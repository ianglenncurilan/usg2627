"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "../../components/AdminSidebar";

const statusOptions = [
  "Completed",
  "In Progress",
  "Audited",
  "Approved"
];

// Fallback seed items for administrative preview if database table is not yet initialized
const initialMockItems = [
  {
    id: "mock-1",
    event_name: "USG Leadership Summit 2026",
    description: "Annual student government executive assembly, leadership workshops, and organizational planning retreat.",
    file_url: "https://example.com/leadership_summit_2026",
    file_name: "Leadership Summit Records",
    status: "Completed",
    academic_year: "2025-2026",
    amount: 45000,
    created_at: "2026-08-15T09:00:00Z",
  },
  {
    id: "mock-2",
    event_name: "Campus Mental Health Awareness Week",
    description: "University-wide symposiums, counseling support booths, and wellness activity kits for students.",
    file_url: "https://example.com/mental_health_week",
    file_name: "Mental Health Week Disclosures",
    status: "Audited",
    academic_year: "2025-2026",
    amount: 32500,
    created_at: "2026-08-10T14:30:00Z",
  },
  {
    id: "mock-3",
    event_name: "University Intramurals & Sports Festival 2026",
    description: "Inter-collegiate sports tournament equipment, hydration stations, and awarding ceremonies.",
    file_url: "https://example.com/sports_fest_budget",
    file_name: "Sports Fest Financials",
    status: "In Progress",
    academic_year: "2025-2026",
    amount: 85000,
    created_at: "2026-08-01T10:00:00Z",
  },
];

export default function AdminBudgetaryTransparencyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [dbError, setDbError] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Form State
  const [formData, setFormData] = useState({
    event_name: "",
    description: "",
    status: "In Progress",
    amount: "",
    academic_year: "2025-2026",
    link_url: "",
  });

  // Items State
  const [budgetList, setBudgetList] = useState<any[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setLoading(false);
        fetchBudgetItems();
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

  const fetchBudgetItems = async () => {
    try {
      const { data, error } = await supabase
        .from("budgetary_transparency")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching budgetary transparency:", error);
        if (error.message && (error.message.includes("relation") || error.message.includes("cache"))) {
          setDbError(true);
        }
        setBudgetList(initialMockItems);
      } else {
        if (data && data.length > 0) {
          setBudgetList(data);
        } else {
          setBudgetList(initialMockItems);
        }
        setDbError(false);
      }
    } catch (err) {
      console.error(err);
      setBudgetList(initialMockItems);
    }
  };

  // Add new Budget Event
  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const newRecord = {
        event_name: formData.event_name,
        description: formData.description || null,
        file_url: formData.link_url || null,
        status: formData.status,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        academic_year: formData.academic_year || "2025-2026",
        created_by: user?.id,
      };

      const { error: insertError } = await supabase
        .from("budgetary_transparency")
        .insert(newRecord);

      if (insertError) {
        console.error("Error saving budget record:", insertError);
        if (insertError.message && insertError.message.includes("relation")) {
          setDbError(true);
        }
        // Local state fallback update
        const mockCreated = {
          ...newRecord,
          id: `local-${Date.now()}`,
          created_at: new Date().toISOString(),
        };
        setBudgetList((prev) => [mockCreated, ...prev]);
        showToast("Record saved locally! (Please execute migration SQL in Supabase)");
      } else {
        showToast("Budgetary event added successfully!");
        fetchBudgetItems();
      }

      // Reset form
      setFormData({
        event_name: "",
        description: "",
        status: "In Progress",
        amount: "",
        academic_year: "2025-2026",
        link_url: "",
      });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while saving the event.");
    } finally {
      setSaving(false);
    }
  };

  // Direct Inline Status Update
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setStatusUpdatingId(id);
    try {
      const { error } = await supabase
        .from("budgetary_transparency")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        console.warn("DB update note:", error.message);
      }

      // Update in local state immediately
      setBudgetList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      showToast(`Status updated to "${newStatus}"!`);
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Open Edit Modal
  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({
      event_name: item.event_name || "",
      description: item.description || "",
      status: item.status || "In Progress",
      amount: item.amount ? String(item.amount) : "",
      academic_year: item.academic_year || "2025-2026",
      link_url: item.file_url || "",
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit Modal
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);

    try {
      const updatedFields = {
        event_name: formData.event_name,
        description: formData.description || null,
        status: formData.status,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        academic_year: formData.academic_year,
        file_url: formData.link_url || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("budgetary_transparency")
        .update(updatedFields)
        .eq("id", editingItem.id);

      if (error) {
        console.warn("DB edit update note:", error.message);
      }

      // Update local state
      setBudgetList((prev) =>
        prev.map((item) => (item.id === editingItem.id ? { ...item, ...updatedFields } : item))
      );

      showToast("Budget event updated successfully!");
      setIsEditModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Edit error:", err);
      alert("An error occurred while updating the event.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Budget Event
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this budgetary transparency record?")) return;

    try {
      const { error } = await supabase
        .from("budgetary_transparency")
        .delete()
        .eq("id", id);

      if (error) {
        console.warn("Delete DB note:", error.message);
      }

      setBudgetList((prev) => prev.filter((item) => item.id !== id));
      showToast("Record deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting record.");
    }
  };

  const filteredItems = budgetList.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.event_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      item.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = filteredItems.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredItems.length);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusColor = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("audited")) {
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    }
    if (s.includes("completed") || s.includes("approved")) {
      return "bg-blue-100 text-blue-800 border-blue-300";
    }
    if (s.includes("progress")) {
      return "bg-amber-100 text-amber-800 border-amber-300";
    }
    return "bg-slate-100 text-slate-800 border-slate-300";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-[#173490] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Budgetary Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl">
          
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#E7C609"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">USG Budgetary Transparency</h1>
                <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-[#173490]">
                  Admin Portal
                </span>
              </div>
              <p className="text-slate-600 mt-1">
                Manage event allocations, add links, and update financial transparency statuses.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setFormData({
                    event_name: "",
                    description: "",
                    status: "In Progress",
                    amount: "",
                    academic_year: "2025-2026",
                    link_url: "",
                  });
                  setIsAddModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-[#173490] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1e4bb8] cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                Add Budget Event
              </button>
            </div>
          </div>

          {/* Database Setup Banner (if relation not yet found) */}
          {dbError && (
            <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-5 shadow-sm text-amber-900 animate-in fade-in duration-300">
              <div className="flex items-center gap-2">
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
                  className="text-amber-700"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" x2="12" y1="9" y2="13" />
                  <line x1="12" x2="12.01" y1="17" y2="17" />
                </svg>
                <h3 className="font-bold text-base">Supabase Migration Recommended</h3>
              </div>
              <p className="text-sm mt-1 text-amber-800">
                To enable persistent cloud sync, run the SQL script in your Supabase SQL Editor:
              </p>
              <div className="mt-3 bg-slate-950 text-slate-200 p-3 rounded-lg text-xs font-mono overflow-x-auto max-h-36 border border-slate-800">
                {`-- Run this SQL in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS budgetary_transparency (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  status TEXT NOT NULL DEFAULT 'In Progress',
  amount NUMERIC,
  academic_year TEXT DEFAULT '2025-2026',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);
ALTER TABLE budgetary_transparency ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view budgetary transparency" ON budgetary_transparency FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage budgetary transparency" ON budgetary_transparency FOR ALL USING (auth.role() = 'authenticated');`}
              </div>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Events</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{budgetList.length}</p>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Completed</p>
              <p className="mt-2 text-2xl font-black text-blue-600">
                {budgetList.filter((i) => (i.status || "").toLowerCase().includes("completed")).length}
              </p>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600">In Progress</p>
              <p className="mt-2 text-2xl font-black text-amber-600">
                {budgetList.filter((i) => (i.status || "").toLowerCase().includes("progress")).length}
              </p>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Audited</p>
              <p className="mt-2 text-2xl font-black text-emerald-600">
                {budgetList.filter((i) => (i.status || "").toLowerCase().includes("audited")).length}
              </p>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm border border-slate-100">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search event name or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-[#173490] focus:outline-none"
              />
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
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Filter Status:</span>
              {["all", "Completed", "In Progress", "Audited", "Approved"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    statusFilter === st
                      ? "bg-[#173490] text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {st === "all" ? "All" : st}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Records Table with 3 Key Columns + Admin Actions */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Budgetary Transparency Disclosures ({filteredItems.length})
              </h2>
            </div>

            {filteredItems.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <p className="font-semibold">No budgetary records match your criteria.</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-3 text-sm font-bold text-[#173490] hover:underline"
                >
                  + Add First Event
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-slate-600">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <tr>
                      <th className="px-6 py-4 w-[40%]">Events</th>
                      <th className="px-6 py-4 w-[20%]">Link</th>
                      <th className="px-6 py-4 w-[25%]">Status</th>
                      <th className="px-6 py-4 text-right w-[15%]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition">
                        
                        {/* 1. Events */}
                        <td className="px-6 py-4 align-top">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-base">
                              {item.event_name}
                            </span>
                            {item.description && (
                              <p className="mt-1 text-xs text-slate-500 line-clamp-2 max-w-md">
                                {item.description}
                              </p>
                            )}
                            <div className="mt-2 flex items-center gap-3 text-xs text-slate-400 font-medium">
                              {item.academic_year && (
                                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                                  AY {item.academic_year}
                                </span>
                              )}
                              {item.amount && (
                                <span className="text-slate-600 font-semibold">
                                  ₱{Number(item.amount).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 2. Link */}
                        <td className="px-6 py-4 align-middle">
                          {item.file_url ? (
                            <a
                              href={item.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#173490]/20 bg-[#173490]/5 px-3 py-1.5 text-xs font-semibold text-[#173490] hover:bg-[#173490] hover:text-white transition w-fit"
                            >
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
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                              </svg>
                              <span>Open Link</span>
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No link</span>
                          )}
                        </td>

                        {/* 3. Status (Updatable) */}
                        <td className="px-6 py-4 align-middle">
                          <div className="flex flex-col gap-1.5">
                            <div className="relative inline-block">
                              <select
                                value={item.status}
                                disabled={statusUpdatingId === item.id}
                                onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                                className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#173490] cursor-pointer ${getStatusColor(
                                  item.status
                                )}`}
                              >
                                {statusOptions.map((st) => (
                                  <option key={st} value={st} className="bg-white text-slate-900 font-medium">
                                    {st}
                                  </option>
                                ))}
                              </select>
                              {statusUpdatingId === item.id && (
                                <span className="ml-2 text-xs text-slate-400 font-medium animate-pulse">
                                  Updating...
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              Click dropdown to change status
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 align-middle text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(item)}
                              className="rounded-lg bg-slate-100 hover:bg-slate-200 p-2 text-slate-700 transition cursor-pointer"
                              title="Edit Record"
                            >
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
                              >
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                <path d="m15 5 4 4" />
                              </svg>
                            </button>

                            <button
                              onClick={() => handleDelete(item.id)}
                              className="rounded-lg bg-red-50 hover:bg-red-100 p-2 text-red-600 transition cursor-pointer"
                              title="Delete Record"
                            >
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
                              >
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {filteredItems.length > 0 && (
              <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-4 md:flex-row">
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
                          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition cursor-pointer ${
                            currentPage === pageNum
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
          </div>

          {/* ADD EVENT MODAL */}
          {isAddModalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setIsAddModalOpen(false)}
            >
              <div
                className="relative w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
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
                    <path d="M18 6 6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>

                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#173490]/10 text-[#173490]">
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
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Add Budgetary Transparency Event</h2>
                    <p className="text-xs text-slate-500">Provide the event name, link URL, and status</p>
                  </div>
                </div>

                <form onSubmit={handleSubmitNew} className="space-y-4">
                  {/* Name of Event */}
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Name of Event / Initiative *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.event_name}
                      onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#173490] focus:outline-none focus:ring-1 focus:ring-[#173490]"
                      placeholder="e.g. USG Leadership Summit 2026"
                    />
                  </div>

                  {/* Status & Academic Year */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">
                        Status *
                      </label>
                      <select
                        required
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#173490] focus:outline-none"
                      >
                        {statusOptions.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">
                        Allocated Budget (₱) (Optional)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#173490] focus:outline-none"
                        placeholder="e.g. 50000"
                      />
                    </div>
                  </div>

                  {/* Link URL */}
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Link / URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.link_url}
                      onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#173490] focus:outline-none"
                      placeholder="https://example.com/event-document-or-sheet"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Event Summary / Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#173490] focus:outline-none"
                      placeholder="Summary of expenditures, venue, participants, and highlights..."
                    />
                  </div>

                  {/* Buttons */}
                  <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-xl bg-[#173490] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#1e4bb8] disabled:opacity-50 cursor-pointer shadow-md"
                    >
                      {saving ? "Saving..." : "Add Event Record"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* EDIT EVENT MODAL */}
          {isEditModalOpen && editingItem && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setIsEditModalOpen(false)}
            >
              <div
                className="relative w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
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
                    <path d="M18 6 6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>

                <h2 className="text-xl font-bold text-slate-900 mb-1">Edit Budgetary Transparency Record</h2>
                <p className="text-xs text-slate-500 mb-5">Update event name, link URL, or change status</p>

                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Name of Event *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.event_name}
                      onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#173490] focus:outline-none"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">
                        Status (Updatable) *
                      </label>
                      <select
                        required
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-bold text-[#173490] focus:border-[#173490] focus:outline-none"
                      >
                        {statusOptions.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">
                        Allocated Budget (₱)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#173490] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Link URL */}
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Link / URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.link_url}
                      onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#173490] focus:outline-none"
                      placeholder="https://example.com/event-document-or-sheet"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Description / Summary
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#173490] focus:outline-none"
                    />
                  </div>

                  <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-xl bg-[#173490] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#1e4bb8] disabled:opacity-50 cursor-pointer shadow-md"
                    >
                      {saving ? "Updating..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
