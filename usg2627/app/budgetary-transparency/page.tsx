"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import GridShell from "../components/GridShell";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

// Pre-seeded fallback data if database is empty or not yet migrated
const fallbackBudgetData = [
  {
    id: "f1",
    event_name: "USG Leadership Summit 2026",
    description: "Annual student government executive assembly, leadership workshops, and organizational planning retreat.",
    file_url: "https://example.com/leadership_summit_2026",
    file_name: "Leadership Summit Records",
    status: "Completed",
    academic_year: "2025-2026",
    amount: "45000",
    created_at: "2026-08-15T09:00:00Z",
  },
  {
    id: "f2",
    event_name: "Campus Mental Health Awareness Week",
    description: "University-wide symposiums, counseling support booths, and wellness activity kits for students.",
    file_url: "https://example.com/mental_health_week",
    file_name: "Mental Health Week Disclosures",
    status: "Audited",
    academic_year: "2025-2026",
    amount: "32500",
    created_at: "2026-08-10T14:30:00Z",
  },
  {
    id: "f3",
    event_name: "University Intramurals & Sports Festival 2026",
    description: "Inter-collegiate sports tournament equipment, hydration stations, and awarding ceremonies.",
    file_url: "https://example.com/sports_fest_budget",
    file_name: "Sports Fest Financials",
    status: "In Progress",
    academic_year: "2025-2026",
    amount: "85000",
    created_at: "2026-08-01T10:00:00Z",
  },
  {
    id: "f4",
    event_name: "Academic Excellence & Research Congress",
    description: "Student research grants, panel honoraria, conference logistics, and publication printing.",
    file_url: "https://example.com/research_congress",
    file_name: "Research Congress Budget",
    status: "Audited",
    academic_year: "2025-2026",
    amount: "58000",
    created_at: "2026-07-20T11:00:00Z",
  },
  {
    id: "f5",
    event_name: "Freshmen General Orientation & Welcome Fest",
    description: "First-year student survival kits, handbook reproduction, audio-visual logistics, and venue setups.",
    file_url: "https://example.com/freshmen_orientation",
    file_name: "Freshmen Orientation Financials",
    status: "Completed",
    academic_year: "2025-2026",
    amount: "62000",
    created_at: "2026-07-05T08:00:00Z",
  },
  {
    id: "f6",
    event_name: "Year-End Student Organization Leadership Gala",
    description: "Student organization financial subsidies, performance recognitions, and annual fiscal turnover.",
    file_url: "https://example.com/yearend_gala",
    file_name: "Year-End Gala Records",
    status: "Approved",
    academic_year: "2025-2026",
    amount: "40000",
    created_at: "2026-06-25T16:00:00Z",
  },
];

const getStatusBadge = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized.includes("audited")) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200/80 shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        {status}
      </span>
    );
  }
  if (normalized.includes("completed") || normalized.includes("approved")) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200/80 shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        {status}
      </span>
    );
  }
  if (normalized.includes("progress")) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200/80 shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        {status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200/80">
      {status}
    </span>
  );
};

export default function BudgetaryTransparencyPage() {
  const [budgetItems, setBudgetItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchBudgetData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus]);

  const fetchBudgetData = async () => {
    try {
      const { data, error } = await supabase
        .from("budgetary_transparency")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        setBudgetItems(fallbackBudgetData);
      } else {
        setBudgetItems(data);
      }
    } catch {
      setBudgetItems(fallbackBudgetData);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = budgetItems.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      selectedStatus === "ALL" ||
      item.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = filteredItems.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredItems.length);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <GridShell>
      <main className="mx-auto max-w-7xl px-6 py-16 sm:py-20">

        {/* Breadcrumbs & Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 flex flex-wrap items-center gap-3"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#173490]/20 bg-[#173490]/5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#173490]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
            Fiscal Accountability & Public Disclosures
          </div>
          <span className="text-xs font-medium text-slate-400">•</span>
          <span className="text-xs font-semibold text-slate-500">Official Publication Portal</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl font-black tracking-[-0.05em] text-slate-900 sm:text-5xl lg:text-6xl"
        >
          USG Budgetary Transparency
        </motion.h1>

        {/* Summary about that page */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 max-w-4xl text-base sm:text-lg leading-relaxed text-slate-600"
        >
          The University Student Government (USG) is firmly committed to absolute fiscal integrity,
          transparent governance, and responsible stewardship of student funds. This official transparency repository provides real-time
          access to all allocated project expenditures, institutional activities, and official documentation.
          Students, faculty, and stakeholders can monitor fiscal statuses, verify resource distribution, and access
          financial and budgetary reports for every student-funded initiative.
        </motion.p>

        {/* Filter and Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search event name, project activity, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#173490] focus:outline-none focus:ring-1 focus:ring-[#173490]"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>

            {/* Status Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {["ALL", "Completed", "In Progress", "Audited", "Approved"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${selectedStatus === status
                    ? "bg-[#173490] text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 3 Columns Section: Events, Link, Status */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-40px" }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-10 w-10 border-4 border-[#173490] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-800">No Budgetary Records Found</h3>
              <p className="mt-1 text-sm text-slate-500">
                Try adjusting your search query or status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                {/* 3 Columns Header */}
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <th scope="col" className="px-6 py-4 sm:px-8 w-[50%]">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-[#173490]"
                        >
                          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                          <line x1="16" x2="16" y1="2" y2="6" />
                          <line x1="8" x2="8" y1="2" y2="6" />
                          <line x1="3" x2="21" y1="10" y2="10" />
                        </svg>
                        <span>Events</span>
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-4 sm:px-8 w-[25%]">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-[#173490]"
                        >
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        <span>Link</span>
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-4 sm:px-8 w-[25%] text-right sm:text-left">
                      <div className="flex items-center justify-end sm:justify-start gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-[#173490]"
                        >
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <span>Status</span>
                      </div>
                    </th>
                  </tr>
                </thead>

                {/* 3 Columns Rows */}
                <tbody className="divide-y divide-slate-100 text-sm">
                  {paginatedItems.map((item) => (
                    <tr
                      key={item.id}
                      className="group transition hover:bg-slate-50/80"
                    >
                      {/* Column 1: Events */}
                      <td className="px-6 py-5 sm:px-8 align-top">
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-slate-900 group-hover:text-[#173490] transition">
                            {item.event_name}
                          </span>
                          {item.description && (
                            <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                              {item.description}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400 font-medium">
                            {item.academic_year && (
                              <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-slate-600 font-semibold">
                                AY {item.academic_year}
                              </span>
                            )}
                            {item.amount && (
                              <span className="text-slate-500 font-semibold">
                                Budget: ₱{Number(item.amount).toLocaleString()}
                              </span>
                            )}
                            {item.created_at && (
                              <span>
                                Logged: {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Link */}
                      <td className="px-6 py-5 sm:px-8 align-middle">
                        {item.file_url ? (
                          <a
                            href={item.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-[#173490]/20 bg-[#173490]/5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#173490] transition hover:bg-[#173490] hover:text-white group/btn"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-[#173490] group-hover/btn:text-white transition"
                            >
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                            <span>Open Link</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="opacity-70 group-hover/btn:translate-x-0.5 transition"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" x2="21" y1="14" y2="3" />
                            </svg>
                          </a>
                        ) : (
                          <span className="text-xs italic text-slate-400 flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" x2="12" y1="8" y2="12" />
                              <line x1="12" x2="12.01" y1="16" y2="16" />
                            </svg>
                            No link available
                          </span>
                        )}
                      </td>

                      {/* Column 3: Status */}
                      <td className="px-6 py-5 sm:px-8 align-middle text-right sm:text-left">
                        <div>
                          {getStatusBadge(item.status)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Pagination Controls */}
        {filteredItems.length > 0 && (
          <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-4 md:flex-row">
            <p className="text-sm text-slate-600">
              Showing {startIndex}-{endIndex} of {filteredItems.length} records
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition cursor-pointer ${currentPage === pageNum
                          ? "bg-[#173490] text-white font-bold shadow-sm"
                          : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <span key={pageNum} className="px-2 text-slate-400">...</span>;
                }
                return null;
              })}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Footer Note / Inquiries */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-40px" }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 p-6 text-center"
        >
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Questions on USG Disclosures & Financial Records?
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
            All student body funds are subject to institutional audit. If you require specific audit schedules, receipts, or breakdown copies,
            contact the Office of the USG Treasurer or the Committee on Budget and Finance.
          </p>
          <div className="mt-4">
            <a
              href="mailto:usg@carsu.edu.ph"
              className="inline-flex items-center gap-2 rounded-full bg-[#173490] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#102a72]"
            >
              Contact USG
            </a>
          </div>
        </motion.div>

      </main>
    </GridShell>
  );
}
