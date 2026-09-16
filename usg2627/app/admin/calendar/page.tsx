"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { invalidateCache, fetchWithCache } from "@/lib/cache";
import AdminSidebar from "../../components/AdminSidebar";
import { EditIcon } from "@/components/icons/EditIcon";

export default function AdminCalendarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dbError, setDbError] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
  });
  const [eventsList, setEventsList] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setLoading(false);
        fetchEvents();
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

  const fetchEvents = async () => {
    try {
      const data = await fetchWithCache("admin_calendar_events_list", async () => {
        const { data, error } = await supabase
          .from("calendar_events")
          .select("id, title, description, event_date, location")
          .order("event_date", { ascending: true });

        if (error) {
          console.error("Error fetching calendar events:", error);
          if (error.message && (error.message.includes("relation") || error.message.includes("cache"))) {
            setDbError(true);
          }
          return [];
        }
        setDbError(false);
        return data || [];
      });

      setEventsList(data || []);
    } catch (err) {
      console.error("fetchEvents catch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      event_date: "",
      location: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (evt: any) => {
    setEditingId(evt.id);
    let dateStr = "";
    if (evt.event_date) {
      try {
        const d = new Date(evt.event_date);
        dateStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      } catch {
        dateStr = evt.event_date;
      }
    }
    setFormData({
      title: evt.title || "",
      description: evt.description || "",
      event_date: dateStr,
      location: evt.location || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!formData.event_date) {
        alert("Please select a date and time for the calendar event.");
        setSaving(false);
        return;
      }

      const parsedDate = new Date(formData.event_date);
      if (isNaN(parsedDate.getTime())) {
        alert("Please enter a valid date and time.");
        setSaving(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      const eventPayload: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        event_date: parsedDate.toISOString(),
        location: formData.location.trim(),
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        // UPDATE existing calendar event
        const { error: updateError } = await supabase
          .from("calendar_events")
          .update(eventPayload)
          .eq("id", editingId);

        if (updateError) {
          console.error("Error updating calendar event:", updateError);
          alert(`Error updating calendar event: ${updateError.message}`);
        } else {
          invalidateCache("calendar_events_list");
          invalidateCache("admin_calendar_events_list");
          setIsModalOpen(false);
          await fetchEvents();
        }
      } else {
        // CREATE new calendar event
        if (user?.id) {
          eventPayload.created_by = user.id;
        }

        const { error: insertError } = await supabase
          .from("calendar_events")
          .insert([eventPayload]);

        if (insertError) {
          console.error("Error creating calendar event:", insertError);
          alert(`Error creating calendar event: ${insertError.message}`);
        } else {
          invalidateCache("calendar_events_list");
          invalidateCache("admin_calendar_events_list");
          setIsModalOpen(false);
          await fetchEvents();
        }
      }
    } catch (err: any) {
      console.error("Error in handleSubmit:", err);
      alert(`An unexpected error occurred: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}" from the calendar?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting calendar event:", error);
        alert(`Error deleting calendar event: ${error.message}`);
      } else {
        invalidateCache("calendar_events_list");
        invalidateCache("admin_calendar_events_list");
        await fetchEvents();
      }
    } catch (err: any) {
      console.error("Error deleting calendar event:", err);
      alert(`An error occurred while deleting: ${err.message || err}`);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#E7C609] border-t-transparent"></div>
          <span className="font-semibold text-sm">Loading Calendar Admin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-4 sm:p-6 md:p-8">
          
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Academic & Campus Calendar Management</h1>
              <p className="text-slate-600">Schedule assemblies, dialogues, summits, and campus calendar activities</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleOpenAddModal}
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
                Add Calendar Event
              </button>
            </div>
          </div>

          {/* Database Setup Alert */}
          {dbError && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-xs">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="font-bold text-sm">Database Migration Required</h3>
                  <p className="text-xs text-amber-800 mt-1">
                    The <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">calendar_events</code> table has not been created yet in Supabase. Please apply migration file <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">013_create_calendar_events.sql</code> in your Supabase SQL Editor.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Content Table / Cards */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Scheduled Calendar Events ({eventsList.length})</h2>
              <span className="text-xs text-slate-500 font-medium">Sorted by date</span>
            </div>

            {eventsList.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <svg className="mx-auto h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="font-semibold text-slate-700">No calendar events found</p>
                <p className="text-xs text-slate-400 mt-1">Click "Add Calendar Event" above to create an entry for the public campus calendar.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Title & Description</th>
                      <th className="px-6 py-3 font-semibold">Date & Time</th>
                      <th className="px-6 py-3 font-semibold">Location</th>
                      <th className="px-6 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {eventsList.map((evt) => (
                      <tr key={evt.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-6 py-4 max-w-xs">
                          <div className="font-bold text-slate-900 truncate">{evt.title}</div>
                          <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">{evt.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-700">
                          {evt.event_date ? new Date(evt.event_date).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }) : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                          {evt.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(evt)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#173490] hover:bg-slate-100 transition cursor-pointer"
                              title="Edit Event"
                            >
                              <EditIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(evt.id, evt.title)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                              title="Delete Event"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
          </div>

        </div>
      </main>

      {/* Modal Dialog for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? "Edit Calendar Event" : "Add New Calendar Event"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. USG Leadership Summit"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#173490] focus:outline-none focus:ring-1 focus:ring-[#173490]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#173490] focus:outline-none focus:ring-1 focus:ring-[#173490]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Location *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Student Center Assembly Hall"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#173490] focus:outline-none focus:ring-1 focus:ring-[#173490]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide details about the calendar activity..."
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#173490] focus:outline-none focus:ring-1 focus:ring-[#173490]"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#173490] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1e4bb8] disabled:opacity-50 cursor-pointer"
                >
                  {saving && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  )}
                  {editingId ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
