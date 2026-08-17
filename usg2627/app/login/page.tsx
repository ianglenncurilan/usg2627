"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import GridShell from "../components/GridShell";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.session) {
        router.push("/admin");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GridShell>
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <div className="text-center mb-8">
              <img
                src="/usg.jpg"
                alt="USG Logo"
                className="mx-auto h-20 w-20 rounded-full object-cover mb-4"
              />
              <h1 className="text-2xl font-black text-slate-900">
                Admin Login
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Sign in to access the administrative portal
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none transition focus:border-[#173490] focus:bg-white"
                  placeholder="admin@usg.edu.ph"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none transition focus:border-[#173490] focus:bg-white"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#173490] px-5 py-2.5 font-semibold text-white transition hover:bg-[#102a72] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm text-slate-600 transition hover:text-[#173490]"
              >
                ← Back to Public Portal
              </Link>
            </div>
          </div>
        </div>
      </main>
    </GridShell>
  );
}
