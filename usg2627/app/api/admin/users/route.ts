import { NextResponse } from "next/server";
import { supabase, supabaseAuthClient } from "@/lib/supabase";

// GET /api/admin/users - Fetch all registered user profiles
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, users: data || [] });
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

    // 1. Create user in Supabase Cloud Authentication (auth.users)
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

    const createdAuthUserId = authData?.user?.id || null;

    // 2. Insert or update user profile record in public.user_profiles
    const profilePayload = {
      user_id: createdAuthUserId,
      email: cleanEmail,
      full_name: cleanName,
      role: userRole,
      is_verified: false,
      updated_at: new Date().toISOString(),
    };

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

    // Handle verification status change in auth.users and user_profiles via RPC
    if (typeof is_verified === "boolean") {
      if (is_verified) {
        // Confirm user in Supabase Auth (sets email_confirmed_at & confirmed_at)
        const { error: rpcError } = await supabase.rpc("verify_supabase_user", {
          target_email: email || "",
          target_user_id: user_id || null,
        });

        if (rpcError) {
          console.warn("RPC verify_supabase_user note:", rpcError.message);
        }
      } else {
        // Unverify user in Supabase Auth (clears email_confirmed_at & confirmed_at)
        const { error: rpcError } = await supabase.rpc("unverify_supabase_user", {
          target_email: email || "",
          target_user_id: user_id || null,
        });

        if (rpcError) {
          console.warn("RPC unverify_supabase_user note:", rpcError.message);
        }
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

// DELETE /api/admin/users - Delete user from user_profiles table
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "User ID is required." }, { status: 400 });
    }

    const { error } = await supabase
      .from("user_profiles")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "User deleted successfully." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
