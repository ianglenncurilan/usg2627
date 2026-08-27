"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "../components/AdminSidebar";

const getRelativeTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString();
  } catch (e) {
    return "Recently";
  }
};



export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    totalDocuments: 0,
    weeklyChange: "+0 this wk",
    pendingApproval: 0,
    pendingLabel: "All Clear",
    publishedThisMonth: 0,
    monthlyChange: "Total published: 0",
    activeEncoders: 1,
    encoderStatus: "Full Team Online",
  });
  const [recentDocs, setRecentDocs] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setLoading(false);
        fetchDashboardData();
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

  const fetchDashboardData = async () => {
    try {
      const { data: allDocs, error: allDocsError } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (allDocsError) {
        console.error("Error fetching documents for dashboard:", allDocsError);
        return;
      }

      if (allDocs) {
        const total = allDocs.length;
        const pending = allDocs.filter((d: any) => d.status === "pending").length;
        
        // Count published this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const publishedThisMonthCount = allDocs.filter((d: any) => {
          if (d.status !== "published") return false;
          const pubDate = d.published_at ? new Date(d.published_at) : new Date(d.created_at);
          return pubDate >= startOfMonth;
        }).length;

        // Count active encoders
        const uniqueEncoders = new Set(allDocs.map((d: any) => d.created_by).filter(Boolean)).size;

        setTotals({
          totalDocuments: total,
          weeklyChange: `+${allDocs.filter((d: any) => {
            const created = new Date(d.created_at);
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return created >= oneWeekAgo;
          }).length} this wk`,
          pendingApproval: pending,
          pendingLabel: pending > 0 ? "Requires Review" : "All Clear",
          publishedThisMonth: publishedThisMonthCount,
          monthlyChange: `Total published: ${allDocs.filter((d: any) => d.status === "published").length}`,
          activeEncoders: Math.max(1, uniqueEncoders),
          encoderStatus: uniqueEncoders > 0 ? "Online" : "Full Team Online",
        });

        // Set recent activities
        const mappedRecent = allDocs.slice(0, 5).map((doc: any) => ({
          id: doc.id,
          title: doc.title,
          category: doc.type,
          tracking: doc.tracking_number,
          status: doc.status.charAt(0).toUpperCase() + doc.status.slice(1),
          author: doc.author || "System",
          date: doc.created_at,
        }));
        setRecentDocs(mappedRecent);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
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
    <div className="flex min-h-screen flex-col md:flex-row bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-4 sm:p-6 md:p-8">
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

          <section className="rounded-xl bg-white p-6 shadow-sm mb-8">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Quick Operations
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                Upload Document
              </Link>

              <Link
                href="/admin/news"
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-[#173490] bg-white px-4 py-3 font-semibold text-[#173490] transition hover:bg-slate-50"
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
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                  <path d="M18 14h-8" />
                  <path d="M15 18h-5" />
                  <path d="M10 6h8v4h-8V6Z" />
                </svg>
                Write News Release
              </Link>

              <Link
                href="/admin/members"
                className="flex items-center justify-center gap-2 rounded-lg bg-[#173490] px-4 py-3 font-semibold text-white transition hover:bg-[#1e4bb8] shadow-sm"
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
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Legislative Management
              </Link>

              <Link
                href="/admin/users"
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-indigo-600 bg-indigo-50 px-4 py-3 font-semibold text-indigo-900 transition hover:bg-indigo-100 shadow-sm"
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
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" x2="19" y1="8" y2="14" />
                  <line x1="16" x2="22" y1="11" y2="11" />
                </svg>
                Manage Accounts
              </Link>

              <Link
                href="/admin/budgetary-transparency"
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-[#173490] bg-white px-4 py-3 font-semibold text-[#173490] transition hover:bg-slate-50"
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
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
                Budget Transparency
              </Link>

              <Link
                href="/admin/org-structure"
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-amber-600 bg-amber-50 px-4 py-3 font-semibold text-amber-900 transition hover:bg-amber-100 shadow-sm"
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
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Org Structure (About)
              </Link>
            </div>
          </section>

          <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Recent Document & System Activity
            </h2>
            <div className="space-y-4">
              {recentDocs.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No recent document activity found</p>
              ) : (
                recentDocs.map((doc) => (
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
                        {getRelativeTime(doc.date)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
