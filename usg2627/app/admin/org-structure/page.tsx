"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "../../components/AdminSidebar";
import Modal from "../../components/Modal";

const defaultChartTemplates = [
  {
    chart_key: "org1",
    title: "USG Organizational Structure",
    subtitle: "Overall Student Government Tree Hierarchy & Governance Diagram",
    image_url: "/org1.png",
    badge: "Main Overall Structure",
  },
  {
    chart_key: "org2",
    title: "The USG President's Cabinet Officials",
    subtitle: "Executive Office & Cabinet Officials Roster",
    image_url: "/org2.png",
    badge: "Cabinet Officials",
  },
  {
    chart_key: "org3",
    title: "The USG Executive Branch Cabinet Structure",
    subtitle: "Executive Departments & Departmental Crests Hierarchy",
    image_url: "/org3.png",
    badge: "Executive Departments",
  },
];

export default function AdminOrgStructurePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [charts, setCharts] = useState<any[]>(defaultChartTemplates);

  // Modals & Feedback
  const [updatingChart, setUpdatingChart] = useState<any | null>(null);
  const [newImageInput, setNewImageInput] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessageModal, setErrorMessageModal] = useState<string | null>(null);

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
        fetchCharts();
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

  const fetchCharts = async () => {
    try {
      let localCache: Record<string, string> = {};
      try {
        const stored = localStorage.getItem("usg_org_charts_store");
        if (stored) localCache = JSON.parse(stored);
      } catch {}

      const { data, error } = await supabase
        .from("org_charts")
        .select("*")
        .order("chart_key", { ascending: true });

      const merged = defaultChartTemplates.map((template) => {
        const dbFound = data?.find((d: any) => d.chart_key === template.chart_key);
        const updatedImage = dbFound?.image_url || localCache[template.chart_key] || template.image_url;
        return {
          ...template,
          ...(dbFound || {}),
          image_url: updatedImage,
        };
      });

      setCharts(merged);
    } catch (err) {
      console.error("fetchCharts error:", err);
      setCharts(defaultChartTemplates);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        setPreviewImage(res);
        setNewImageInput(res);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingChart) return;
    if (!newImageInput) {
      setErrorMessageModal("Please upload an image file or paste an image URL to update.");
      return;
    }

    setSaving(true);

    try {
      const finalImageUrl = newImageInput;

      // 1. Upsert into Supabase database org_charts table
      const updatedItem = {
        chart_key: updatingChart.chart_key,
        title: updatingChart.title,
        subtitle: updatingChart.subtitle,
        image_url: finalImageUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("org_charts")
        .upsert(updatedItem, { onConflict: "chart_key" });

      if (error) console.warn("Supabase org_charts upsert note:", error.message);

      // 2. Sync to localStorage for instant local reactivity across tabs/pages
      try {
        const local = localStorage.getItem("usg_org_charts_store");
        const existingMap = local ? JSON.parse(local) : {};
        existingMap[updatingChart.chart_key] = finalImageUrl;
        localStorage.setItem("usg_org_charts_store", JSON.stringify(existingMap));
      } catch (lErr) {
        console.warn("localStorage sync note:", lErr);
      }

      // 3. Dispatch global custom event for instant UI update
      window.dispatchEvent(new Event("usg_org_charts_updated"));

      setCharts((prev) =>
        prev.map((c) => (c.chart_key === updatingChart.chart_key ? { ...c, image_url: finalImageUrl } : c))
      );

      showToast(`Chart "${updatingChart.title}" updated successfully!`);
      setUpdatingChart(null);
      setNewImageInput("");
      setPreviewImage(null);
    } catch (err: any) {
      console.error(err);
      setErrorMessageModal(`Failed to update image chart: ${err.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-[#173490] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Organizational Chart Manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl">

          {/* Toast */}
          {toastMessage && (
            <div className="fixed top-6 right-6 z-[100] flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-2xl animate-in fade-in duration-300">
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
                <h1 className="text-2xl font-bold text-slate-900">Organizational Structure Charts</h1>
                <span className="rounded bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-[#173490] border border-blue-200">
                  About Page Image Manager
                </span>
              </div>
              <p className="text-slate-600 mt-1">
                Download or Update the 3 official high-resolution organizational structure chart graphics rendered on the public About page.
              </p>
            </div>
          </div>

          {/* THE 3 CHART CARDS */}
          <div className="grid gap-8 lg:grid-cols-3">
            {charts.map((chart) => (
              <div
                key={chart.chart_key}
                className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg hover:border-slate-300"
              >
                <div>
                  {/* Badge & Title */}
                  <div className="mb-4">
                    <span className="inline-block rounded-md bg-[#173490] px-3 py-1 text-[11px] font-black uppercase text-white tracking-wider mb-2">
                      {chart.badge}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 leading-snug">
                      {chart.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                      {chart.subtitle}
                    </p>
                  </div>

                  {/* High-Res Graphic Image Preview */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-950 p-2 shadow-inner group">
                    {chart.image_url ? (
                      <img
                        src={chart.image_url}
                        alt={chart.title}
                        className="h-full w-full object-contain transition duration-300 group-hover:scale-102"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-slate-900/60 p-6 text-center text-slate-400">
                        <svg className="mb-2 h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs font-semibold">No Image Uploaded Yet</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Click "Update Image" below to upload chart</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions: Download & Update Buttons */}
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <a
                    href={chart.image_url}
                    download={`${chart.chart_key}_chart.png`}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
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
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" x2="12" y1="15" y2="3" />
                    </svg>
                    Download Chart
                  </a>

                  <button
                    onClick={() => {
                      setUpdatingChart(chart);
                      setNewImageInput(chart.image_url);
                      setPreviewImage(chart.image_url);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#173490] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1e4bb8] transition cursor-pointer shadow-md"
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
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" x2="12" y1="3" y2="15" />
                    </svg>
                    Update Image
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* UPDATE / REPLACE IMAGE MODAL */}
          <Modal
            isOpen={!!updatingChart}
            onClose={() => setUpdatingChart(null)}
            className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 relative"
          >
            {updatingChart && (
              <>
                <button
                  onClick={() => setUpdatingChart(null)}
                  className="absolute right-5 top-5 rounded-full bg-slate-100 p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>

                <span className="rounded-md bg-[#173490] px-2.5 py-0.5 text-[10px] font-black uppercase text-white">
                  {updatingChart.badge}
                </span>

                <h2 className="text-xl font-black text-slate-900 mt-2">
                  Update "{updatingChart.title}"
                </h2>
                <p className="text-xs text-slate-500 mb-6">
                  Upload a new replacement image file or paste an image URL for this chart.
                </p>

                <form onSubmit={handleUpdateSave} className="space-y-5">
                  {/* File Upload Input */}
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Select New Image File (.png, .jpg, .webp) *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="w-full text-xs text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-[#173490] file:px-4 file:py-2.5 file:text-xs file:font-bold file:text-white hover:file:bg-[#1e4bb8] cursor-pointer"
                    />
                  </div>

                  {/* Or Image URL */}
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Or Image URL / Base64 Path
                    </label>
                    <input
                      type="text"
                      value={newImageInput}
                      onChange={(e) => {
                        setNewImageInput(e.target.value);
                        setPreviewImage(e.target.value);
                      }}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-mono focus:border-[#173490] focus:outline-none"
                      placeholder="e.g. /org1.png or https://..."
                    />
                  </div>

                  {/* Live Image Preview */}
                  {previewImage && (
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                        New Chart Preview
                      </label>
                      <div className="aspect-video w-full rounded-2xl border-2 border-slate-300 bg-slate-950 p-2 overflow-hidden shadow-sm">
                        <img
                          src={previewImage}
                          alt="Chart Preview"
                          className="h-full w-full object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setUpdatingChart(null)}
                      className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-xl bg-[#173490] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#1e4bb8] disabled:opacity-50 cursor-pointer shadow-md"
                    >
                      {saving ? "Updating Graphic..." : "Save Updated Chart"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </Modal>

          {/* ERROR NOTIFICATION MODAL */}
          <Modal
            isOpen={!!errorMessageModal}
            onClose={() => setErrorMessageModal(null)}
            className="w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 relative"
          >
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 ring-4 ring-red-50 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Chart Manager Notice</h3>
            </div>

            <div className="mt-2 rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <p className="text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
                {errorMessageModal}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setErrorMessageModal(null)}
                className="rounded-xl bg-[#173490] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#1e4bb8] cursor-pointer shadow-md"
              >
                Understood
              </button>
            </div>
          </Modal>

        </div>
      </main>
    </div>
  );
}
