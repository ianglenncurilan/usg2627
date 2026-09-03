import { NextResponse } from "next/server";
import { supabase, supabaseAuthClient } from "@/lib/supabase";

// GET /api/admin/users - Fetch all registered users directly from Supabase Auth & user_profiles table
export async function GET() {
  try {
    const userMap = new Map<string, any>();

    // 1. Fetch real users directly from Supabase Auth (auth.users)
    try {
      const { data: authData, error: authError } = await supabaseAuthClient.auth.admin.listUsers();
      if (!authError && authData?.users && authData.users.length > 0) {
        authData.users.forEach((u: any) => {
          if (u.email) {
            const meta = u.user_metadata || {};
            userMap.set(u.email.toLowerCase(), {
              id: u.id,
              user_id: u.id,
              email: u.email,
              full_name: meta.full_name || meta.name || u.email.split("@")[0],
              role: meta.role || (u.email.toLowerCase().includes("admin") ? "Admin" : "User"),
              is_verified: Boolean(u.email_confirmed_at || u.confirmed_at),
              created_at: u.created_at || new Date().toISOString(),
            });
          }
        });
      }
    } catch (authErr) {
      console.warn("Supabase auth.admin.listUsers note:", authErr);
    }

    // 2. Merge with user_profiles table from database
    const { data: profileData } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profileData && profileData.length > 0) {
      profileData.forEach((p: any) => {
        if (p.email) {
          const existing = userMap.get(p.email.toLowerCase()) || {};
          userMap.set(p.email.toLowerCase(), {
            id: p.id || existing.id || p.user_id,
            user_id: p.user_id || existing.user_id || p.id,
            email: p.email,
            full_name: p.full_name || existing.full_name || p.email.split("@")[0],
            role: p.role || existing.role || "User",
            is_verified: typeof p.is_verified === "boolean" ? p.is_verified : existing.is_verified ?? true,
            created_at: p.created_at || existing.created_at || new Date().toISOString(),
          });
        }
      });
    }

    const users = Array.from(userMap.values());

    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/admin/users - Secure Admin Endpoint to create a new user account with auto-confirmation
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, full_name, role, email_confirm = true } = body;

    const cleanEmail = email?.trim().toLowerCase();
    const cleanName = full_name?.trim() || cleanEmail?.split("@")[0] || "USG User";
    const userRole = role || "User";
    const autoConfirm = Boolean(email_confirm);

    if (!cleanEmail || !password) {
      return NextResponse.json(
        { success: false, error: "Email Address and Password are required." },
        { status: 400 }
      );
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // 1. Create user in Supabase Authentication (Admin API if service role key configured, else signUp fallback)
    let authUserId: string | null = null;
    let adminAuthError: any = null;

    const hasServiceRoleKey = Boolean(
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
    );

    if (hasServiceRoleKey) {
      try {
        const { data: adminData, error: adminErr } = await supabaseAuthClient.auth.admin.createUser({
          email: cleanEmail,
          password: password,
          email_confirm: autoConfirm,
          user_metadata: {
            full_name: cleanName,
            role: userRole,
          },
        });

        if (!adminErr && adminData?.user) {
          authUserId = adminData.user.id;
        } else {
          adminAuthError = adminErr;
        }
      } catch (err) {
        adminAuthError = err;
      }
    }

    // Fallback if Service Role Key is not configured or admin API returned unauthorized error
    if (!authUserId) {
      const { data: signUpData, error: signUpErr } = await supabaseAuthClient.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: cleanName,
            role: userRole,
          },
        },
      });

      if (signUpErr) {
        let friendlyError = signUpErr.message;
        if (
          friendlyError.toLowerCase().includes("already registered") ||
          friendlyError.toLowerCase().includes("already exists")
        ) {
          friendlyError = `A user with email "${cleanEmail}" is already registered in Supabase Authentication.`;
        } else if (adminAuthError?.message && !adminAuthError.message.includes("Bearer token")) {
          friendlyError = adminAuthError.message;
        }
        return NextResponse.json({ success: false, error: friendlyError }, { status: 400 });
      }

      authUserId = signUpData?.user?.id || null;
    }

    // 2. Insert or update user profile record in public.user_profiles
    const profilePayload = {
      user_id: authUserId,
      email: cleanEmail,
      full_name: cleanName,
      role: userRole,
      is_verified: autoConfirm,
      updated_at: new Date().toISOString(),
    };

    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .upsert(profilePayload, { onConflict: "email" })
      .select();

    // 3. Auto-confirm user in Supabase auth.users via RPC verify_supabase_user
    if (autoConfirm) {
      try {
        await supabase.rpc("verify_supabase_user", {
          target_email: cleanEmail,
          target_user_id: authUserId,
        });
      } catch (rpcErr) {
        console.warn("verify_supabase_user RPC note:", rpcErr);
      }
    }

    const createdUser = (profileData && profileData[0]) || {
      id: authUserId || `usr-${Date.now()}`,
      ...profilePayload,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: `User account (${cleanEmail}) created successfully!`,
      user: createdUser,
    });
  } catch (err: any) {
    console.error("Create User API Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "An unexpected error occurred while creating user." },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users - Update user verification or role in both Supabase Auth and user_profiles
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, email, user_id, is_verified, role } = body;

    if (!id && !email && !user_id) {
      return NextResponse.json({ success: false, error: "User identifier is required." }, { status: 400 });
    }

    // Fetch user profile first to get target_user_id
    let profileQuery = supabase.from("user_profiles").select("*");
    if (id) profileQuery = profileQuery.eq("id", id);
    else if (user_id) profileQuery = profileQuery.eq("user_id", user_id);
    else if (email) profileQuery = profileQuery.eq("email", email);

    const { data: existingProfiles } = await profileQuery;
    const targetUser = existingProfiles?.[0];
    const targetAuthUserId = targetUser?.user_id || user_id;
    const targetEmail = targetUser?.email || email;

    // 1. Sync role/metadata and email confirmation to Supabase Auth (auth.users)
    if (targetAuthUserId) {
      try {
        const updatePayload: any = { user_metadata: {} };
        if (role) updatePayload.user_metadata.role = role;
        if (typeof is_verified === "boolean") updatePayload.email_confirm = is_verified;

        await supabaseAuthClient.auth.admin.updateUserById(targetAuthUserId, updatePayload);
      } catch (authUpdateErr) {
        console.warn("Auth admin updateUserById note:", authUpdateErr);
      }
    }

    // 2. Sync verification status in auth.users and user_profiles via RPC
    if (typeof is_verified === "boolean") {
      if (is_verified) {
        const { error: rpcError } = await supabase.rpc("verify_supabase_user", {
          target_email: targetEmail || "",
          target_user_id: targetAuthUserId || null,
        });
        if (rpcError) console.warn("RPC verify_supabase_user note:", rpcError.message);
      } else {
        const { error: rpcError } = await supabase.rpc("unverify_supabase_user", {
          target_email: targetEmail || "",
          target_user_id: targetAuthUserId || null,
        });
        if (rpcError) console.warn("RPC unverify_supabase_user note:", rpcError.message);
      }
    }

    const updates: any = { updated_at: new Date().toISOString() };
    if (typeof is_verified === "boolean") updates.is_verified = is_verified;
    if (role) updates.role = role;

    let query = supabase.from("user_profiles").update(updates);
    if (id) query = query.eq("id", id);
    else if (user_id) query = query.eq("user_id", user_id);
    else if (email) query = query.eq("email", email);

    const { data, error } = await query.select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: data?.[0] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/users - Delete user from both Supabase Auth (auth.users) and user_profiles table
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const emailParam = searchParams.get("email");

    if (!id && !emailParam) {
      return NextResponse.json({ success: false, error: "User ID or Email is required." }, { status: 400 });
    }

    // Fetch user profile first to get auth user_id
    let profileQuery = supabase.from("user_profiles").select("*");
    if (id) profileQuery = profileQuery.eq("id", id);
    else if (emailParam) profileQuery = profileQuery.eq("email", emailParam);

    const { data: profiles } = await profileQuery;
    const targetUser = profiles?.[0];

    const authUserId = targetUser?.user_id || id;
    const targetEmail = targetUser?.email || emailParam;

    // 1. Delete user from Supabase Auth (auth.users) via Admin API
    if (authUserId) {
      try {
        await supabaseAuthClient.auth.admin.deleteUser(authUserId);
      } catch (authDelErr) {
        console.warn("Auth admin deleteUser note:", authDelErr);
      }
    }

    // 2. Try RPC fallback deletion if RPC exists
    try {
      await supabase.rpc("delete_supabase_user", {
        target_email: targetEmail || "",
        target_user_id: authUserId || null,
      });
    } catch (rpcDelErr) {
      // ignore
    }

    // 3. Delete from user_profiles table
    let deleteQuery = supabase.from("user_profiles").delete();
    if (id) deleteQuery = deleteQuery.eq("id", id);
    else if (targetEmail) deleteQuery = deleteQuery.eq("email", targetEmail);

    const { error } = await deleteQuery;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "User account deleted from Supabase Auth and user profiles." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
