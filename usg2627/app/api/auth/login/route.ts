import { NextResponse } from "next/server";
import { supabase, supabaseAuthClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required." }, { status: 400 });
    }

    // 1. Force confirm user email in Supabase Auth via Admin API before attempting sign in
    try {
      const { data: userListData } = await supabaseAuthClient.auth.admin.listUsers();
      const authUser = userListData?.users?.find(
        (u: any) => u.email?.toLowerCase() === cleanEmail
      );

      if (authUser?.id) {
        await supabaseAuthClient.auth.admin.updateUserById(authUser.id, {
          email_confirm: true,
        });
      }
    } catch (adminErr) {
      console.warn("Admin updateUserById pre-login note:", adminErr);
    }

    // 2. Also run RPC verification fallback
    try {
      await supabase.rpc("verify_supabase_user", { target_email: cleanEmail });
    } catch (rpcErr) {
      // ignore
    }

    // 3. Attempt signInWithPassword via Auth Client
    let { data: authData, error: authError } = await supabaseAuthClient.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    if (authError) {
      // Try again after forcing confirmation
      try {
        const { data: userListData } = await supabaseAuthClient.auth.admin.listUsers();
        const authUser = userListData?.users?.find(
          (u: any) => u.email?.toLowerCase() === cleanEmail
        );

        if (authUser?.id) {
          await supabaseAuthClient.auth.admin.updateUserById(authUser.id, {
            email_confirm: true,
          });

          const retry = await supabaseAuthClient.auth.signInWithPassword({
            email: cleanEmail,
            password: password,
          });

          if (!retry.error && retry.data?.session) {
            return NextResponse.json({ success: true, session: retry.data.session });
          }
        }
      } catch (retryErr) {
        console.error("Retry login error:", retryErr);
      }

      return NextResponse.json({ success: false, error: authError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, session: authData.session });
  } catch (err: any) {
    console.error("Auth Login API Error:", err);
    return NextResponse.json({ success: false, error: err.message || "Login failed." }, { status: 500 });
  }
}
