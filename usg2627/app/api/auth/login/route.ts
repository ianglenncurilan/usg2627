import { NextResponse } from "next/server";
import { supabase, supabaseAuthClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required." }, { status: 400 });
    }

    // 1. Auto-confirm user in Supabase Auth via RPC & Admin API before attempting sign in
    try {
      await supabase.rpc("verify_supabase_user", {
        target_email: cleanEmail,
      });
    } catch (rpcErr) {
      console.warn("RPC verify_supabase_user login note:", rpcErr);
    }

    // Also attempt admin updateUserById auto confirm if auth user exists
    try {
      const { data: userProfiles } = await supabase
        .from("user_profiles")
        .select("user_id")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (userProfiles?.user_id) {
        await supabaseAuthClient.auth.admin.updateUserById(userProfiles.user_id, {
          email_confirm: true,
        });
      }
    } catch (adminErr) {
      console.warn("Admin updateUserById login note:", adminErr);
    }

    // 2. Attempt signInWithPassword via Client
    const { data: authData, error: authError } = await supabaseAuthClient.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    if (authError) {
      // If error is related to email confirmation, force RPC update and retry
      if (authError.message.toLowerCase().includes("not confirmed")) {
        try {
          await supabase.rpc("verify_supabase_user", { target_email: cleanEmail });

          const retry = await supabaseAuthClient.auth.signInWithPassword({
            email: cleanEmail,
            password: password,
          });

          if (!retry.error && retry.data?.session) {
            return NextResponse.json({ success: true, session: retry.data.session });
          }
        } catch (retryErr) {
          console.error("Retry login error:", retryErr);
        }
      }

      return NextResponse.json({ success: false, error: authError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, session: authData.session });
  } catch (err: any) {
    console.error("Auth Login API Error:", err);
    return NextResponse.json({ success: false, error: err.message || "Login failed." }, { status: 500 });
  }
}
