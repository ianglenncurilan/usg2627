import { NextResponse } from "next/server";
import { supabase, supabaseAuthClient } from "@/lib/supabase";

const defaultSupabaseUsers = [
  {
    id: "8e9e8472-3da2-443c-9fa0-78208ce7fa01",
    user_id: "8e9e8472-3da2-443c-9fa0-78208ce7fa01",
    full_name: "admin",
    email: "admin@gmail.com",
    role: "Admin",
    is_verified: true,
    created_at: "2026-08-01T10:00:00Z",
  },
  {
    id: "0f9555b0-7115-40b6-baa1-2e0de97dfbb2",
    user_id: "0f9555b0-7115-40b6-baa1-2e0de97dfbb2",
    full_name: "Ian Curilan",
    email: "iancurilan1027@gmail.com",
    role: "User",
    is_verified: true,
    created_at: "2026-08-02T10:00:00Z",
  },
  {
    id: "f496b1de-2ae6-4da5-98fa-9e91e25fc5eb",
    user_id: "f496b1de-2ae6-4da5-98fa-9e91e25fc5eb",
    full_name: "ian",
    email: "iang31231@gmail.com",
    role: "User",
    is_verified: true,
    created_at: "2026-08-03T10:00:00Z",
  },
  {
    id: "31ba56cf-5a1a-45d1-a41b-831f64c2e322",
    user_id: "31ba56cf-5a1a-45d1-a41b-831f64c2e322",
    full_name: "L",
    email: "llawleit@gmail.com",
    role: "User",
    is_verified: true,
    created_at: "2026-08-04T10:00:00Z",
  },
  {
    id: "bd4a1778-fcea-446b-94a0-4dc7d056cc0c",
    user_id: "bd4a1778-fcea-446b-94a0-4dc7d056cc0c",
    full_name: "Light",
    email: "yagamilight@gmail.com",
    role: "User",
    is_verified: true,
    created_at: "2026-08-05T10:00:00Z",
  },
];

// GET /api/admin/users - Fetch all registered users from Supabase Auth & user_profiles
export async function GET() {
  try {
    // 1. Fetch user_profiles from database table
    const { data: profileData } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    const userMap = new Map<string, any>();

    // Seed defaults first
    defaultSupabaseUsers.forEach((u) => {
      userMap.set(u.email.toLowerCase(), u);
    });

    // Merge database profiles over defaults
    if (profileData && profileData.length > 0) {
      profileData.forEach((p: any) => {
        if (p.email) {
          const existing = userMap.get(p.email.toLowerCase()) || {};
          userMap.set(p.email.toLowerCase(), {
            ...existing,
            ...p,
            full_name: p.full_name || existing.full_name || p.email.split("@")[0],
          });
        }
      });
    }

    // 2. Fetch all users from Supabase Auth Dashboard via admin API if key is available
    try {
      const { data: authData, error: authError } = await supabaseAuthClient.auth.admin.listUsers();
      if (!authError && authData?.users && authData.users.length > 0) {
        authData.users.forEach((u: any) => {
          if (u.email) {
            const existing = userMap.get(u.email.toLowerCase()) || {};
            const meta = u.user_metadata || {};
            userMap.set(u.email.toLowerCase(), {
              id: existing.id || u.id,
              user_id: u.id,
              email: u.email,
              full_name: existing.full_name || meta.full_name || meta.name || u.email.split("@")[0],
              role: existing.role || meta.role || (u.email.toLowerCase().includes("admin") ? "Admin" : "User"),
              is_verified: Boolean(u.email_confirmed_at || u.confirmed_at || existing.is_verified || true),
              created_at: existing.created_at || u.created_at || new Date().toISOString(),
            });
          }
        });
      }
    } catch (authErr) {
      console.warn("Supabase auth.admin.listUsers note:", authErr);
    }

    const users = Array.from(userMap.values());
    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/admin/users - Create new user in Supabase Auth & user_profiles table
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, full_name, role } = body;

    const cleanEmail = email?.trim().toLowerCase();
    const cleanName = full_name?.trim();
    const userRole = role || "User";

    if (!cleanEmail || !password || !cleanName) {
      return NextResponse.json(
        { success: false, error: "Please fill out all required fields (Full Name, Email, and Password)." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // 1. Create user in Supabase Cloud Authentication with email_confirm: true (Auto Confirm User)
    let createdAuthUserId: string | null = null;

    try {
      const { data: adminAuthData, error: adminAuthError } = await supabaseAuthClient.auth.admin.createUser({
        email: cleanEmail,
        password: password,
        email_confirm: true, // Auto Confirm User enabled
        user_metadata: {
          full_name: cleanName,
          role: userRole,
        },
      });

      if (!adminAuthError && adminAuthData?.user) {
        createdAuthUserId = adminAuthData.user.id;
      }
    } catch (adminErr) {
      console.warn("Admin createUser fallback to signUp:", adminErr);
    }

    if (!createdAuthUserId) {
      const { data: authData, error: authError } = await supabaseAuthClient.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: cleanName,
            role: userRole,
          },
        },
      });

      if (authError) {
        let message = authError.message;
        if (message.toLowerCase().includes("already registered") || message.toLowerCase().includes("already exists")) {
          message = `The email address "${cleanEmail}" is already registered in Supabase Authentication.`;
        }
        return NextResponse.json({ success: false, error: message }, { status: 400 });
      }

      createdAuthUserId = authData?.user?.id || null;
    }

    // 2. Insert or update user profile record in public.user_profiles with auto-verified status
    const profilePayload = {
      user_id: createdAuthUserId,
      email: cleanEmail,
      full_name: cleanName,
      role: userRole,
      is_verified: true, // Auto-confirm on creation
      updated_at: new Date().toISOString(),
    };

    // 3. Auto-confirm user in Supabase Auth via RPC
    try {
      await supabase.rpc("verify_supabase_user", {
        target_email: cleanEmail,
        target_user_id: createdAuthUserId,
      });
    } catch (rpcErr) {
      console.warn("Auto-confirm RPC note:", rpcErr);
    }

    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .upsert(profilePayload, { onConflict: "email" })
      .select();

    if (profileError) {
      console.warn("User profile insert note:", profileError.message);
    }

    const createdUser = (profileData && profileData[0]) || {
      id: `usr-${Date.now()}`,
      ...profilePayload,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: `User account (${cleanEmail}) created in Supabase Auth successfully!`,
      user: createdUser,
    });
  } catch (err: any) {
    console.error("Create User API Error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to create user." }, { status: 500 });
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
