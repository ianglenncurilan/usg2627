"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "../components/AdminSidebar";

const initialDocuments = [
  {
    id: 1,
    title: "Sustainable Green Roof Funding Authorization",
    category: "RESOLUTION",
    tracking: "RES-2026-016",
    status: "Pending",
    author: "Treasurer Lim",
    date: "2026-08-18",
  },
  {
    id: 2,
    title: "Audit Guidelines for Recognized Student Organizations",
    category: "MEMORANDUM",
    tracking: "MEMO-2026-009",
    status: "Published",
    author: "Sec. Almonte",
    date: "2026-08-18",
  },
  {
    id: 3,
    title: "Mandatory Student Seats on Academic Boards",
    category: "EXEC ORDER",
    tracking: "EO-2026-004",
    status: "Approved",
    author: "President Villanueva",
    date: "2026-08-17",
  },
];



export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const [documents] = useState(initialDocuments);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const totals = {
    totalDocuments: 847,
    weeklyChange: "+12 this wk",
    pendingApproval: 12,
    pendingLabel: "Requires Review",
    publishedThisMonth: 34,
    monthlyChange: "+8% MoM",
    activeEncoders: 8,
    encoderStatus: "Full Team Online",
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-[#173490] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600">Welcome back, Administrator</p>
          </div>

          <section className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Documents
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{totals.totalDocuments}</p>
              <p className="mt-1 text-sm text-emerald-600">{totals.weeklyChange}</p>
            </div>
            
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pending Approval
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{totals.pendingApproval}</p>
              <p className="mt-1 text-sm text-amber-600">{totals.pendingLabel}</p>
            </div>
            
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Published This Month
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{totals.publishedThisMonth}</p>
              <p className="mt-1 text-sm text-emerald-600">{totals.monthlyChange}</p>
            </div>
            
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Encoders
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{totals.activeEncoders}</p>
              <p className="mt-1 text-sm text-emerald-600">{totals.encoderStatus}</p>
            </div>
          </section>

          <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Recent Document & System Activity
            </h2>
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-start gap-4 rounded-lg border border-slate-200 p-4 transition hover:bg-slate-50"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#173490] text-xs font-bold text-white">
                    {doc.category.slice(0, 3)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#173490]">
                        {doc.category}
                      </span>
                      <span className="text-xs text-slate-500">{doc.tracking}</span>
                    </div>
                    <h3 className="mt-1 font-medium text-slate-900">{doc.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Submitted by {doc.author}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        doc.status === "Published"
                          ? "bg-emerald-100 text-emerald-700"
                          : doc.status === "Approved"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {doc.status}
                    </span>
                    <p className="mt-2 text-xs text-slate-500">
                      {doc.id === 1 ? "Just now" : doc.id === 2 ? "2 hours ago" : "Yesterday"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Quick Operations
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Link
                href="/admin/documents"
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-[#173490] bg-[#173490] px-4 py-3 font-semibold text-white transition hover:bg-[#102a72]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M12 18v-6" />
                  <path d="M9 15l3 3 3-3" />
                </svg>
                Create New Official Document
              </Link>
              
              <button className="flex items-center justify-center gap-2 rounded-lg border-2 border-[#173490] bg-white px-4 py-3 font-semibold text-[#173490] transition hover:bg-slate-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                  <path d="M18 14h-8" />
                  <path d="M15 18h-5" />
                  <path d="M10 6h8v4h-8V6Z" />
                </svg>
                Write Press Release / News
              </button>
              
              <button className="flex items-center justify-center gap-2 rounded-lg border-2 border-[#173490] bg-white px-4 py-3 font-semibold text-[#173490] transition hover:bg-slate-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Invite System User / Encoder
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
