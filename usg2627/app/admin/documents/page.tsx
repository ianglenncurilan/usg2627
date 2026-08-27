"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "../../components/AdminSidebar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const documentTypes = [
  "RESOLUTION",
  "EXECUTIVE ORDER",
  "ADMINISTRATIVE ORDER",
  "MEMORANDUM",
  "SPECIAL ORDER",
  "ADVISORY",
  "FINANCIAL DOCUMENTS"
];

export default function AdminDocumentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "RESOLUTION",
    tracking_number: "",
    issuing_body: "",
    author: "",
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>("Admin");

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setLoading(false);
        if (session.user) {
          try {
            const { data: profile } = await supabase
              .from("user_profiles")
              .select("role")
              .eq("user_id", session.user.id)
              .single();

            if (profile?.role) {
              setCurrentUserRole(profile.role);
            } else if (session.user.user_metadata?.role) {
              setCurrentUserRole(session.user.user_metadata.role);
            }
          } catch (err) {
            console.error("Role check note:", err);
          }
        }
        fetchDocuments();
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

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching documents:", error);
    } else {
      setDocuments(data || []);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let fileUrl = null;
      let fileName = null;
      let fileSize = null;

      // Upload file if provided
      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileNameUnique = `${Date.now()}.${fileExt}`;
        const filePath = `documents/${fileNameUnique}`;

        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Error uploading file:", uploadError);
          alert("Error uploading file. Please try again.");
          setUploading(false);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("documents")
          .getPublicUrl(filePath);

        fileUrl = publicUrl;
        fileName = file.name;
        fileSize = file.size;
      }

      // Insert document record
      const { data: { user } } = await supabase.auth.getUser();

      const { error: insertError } = await supabase
        .from("documents")
        .insert({
          title: formData.title,
          type: formData.type,
          tracking_number: formData.tracking_number,
          issuing_body: formData.issuing_body,
          author: formData.author,
          description: formData.description,
          file_url: fileUrl,
          file_name: fileName,
          file_size: fileSize,
          status: "pending",
          created_by: user?.id,
        });

      if (insertError) {
        console.error("Error inserting document:", insertError);
        alert("Error saving document. Please try again.");
      } else {
        alert("Document uploaded successfully! It is now pending approval.");
        setFormData({
          title: "",
          type: "RESOLUTION",
          tracking_number: "",
          issuing_body: "",
          author: "",
          description: "",
        });
        setFile(null);
        setIsModalOpen(false);
        fetchDocuments();
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from("documents")
      .update({ status: "approved" })
      .eq("id", id);

    if (error) {
      console.error("Error approving document:", error);
      alert("Error approving document.");
    } else {
      fetchDocuments();
    }
  };

  const handlePublish = async (id: string) => {
    const { error } = await supabase
      .from("documents")
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Error publishing document:", error);
      alert("Error publishing document.");
    } else {
      fetchDocuments();
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from("documents")
      .update({ status: "rejected" })
      .eq("id", id);

    if (error) {
      console.error("Error rejecting document:", error);
      alert("Error rejecting document.");
    } else {
      fetchDocuments();
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesFilter = filter === "all" || doc.status === filter;
    if (!matchesFilter) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    return (
      (doc.title && doc.title.toLowerCase().includes(q)) ||
      (doc.tracking_number && doc.tracking_number.toLowerCase().includes(q)) ||
      (doc.type && doc.type.toLowerCase().includes(q)) ||
      (doc.issuing_body && doc.issuing_body.toLowerCase().includes(q)) ||
      (doc.author && doc.author.toLowerCase().includes(q)) ||
      (doc.description && doc.description.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const displayedDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "approved":
        return "bg-blue-100 text-blue-700";
      case "published":
        return "bg-emerald-100 text-emerald-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
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
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">Documents Management</h1>
                {currentUserRole === "Admin" ? (
                  <span className="rounded bg-purple-100 px-2.5 py-0.5 text-xs font-black uppercase text-purple-800">
                    👑 Admin (Full Control)
                  </span>
                ) : (
                  <span className="rounded bg-blue-100 px-2.5 py-0.5 text-xs font-bold uppercase text-blue-700">
                    👤 User (Upload Only)
                  </span>
                )}
              </div>
              <p className="text-slate-600">Upload official documents (Pending review for Users, Full approval for Admins)</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
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
              Upload New Document
            </button>
          </div>

          {/* Upload Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}>
              <div 
                className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setIsModalOpen(false)}
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

                <h2 className="mb-4 text-lg font-bold text-slate-900">Upload New Document</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Document Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#173490] focus:outline-none focus:ring-1 focus:ring-[#173490]"
                        placeholder="Enter document title"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Document Type *
                      </label>
                      <select
                        required
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#173490] focus:outline-none focus:ring-1 focus:ring-[#173490]"
                      >
                        {documentTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Tracking Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.tracking_number}
                        onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#173490] focus:outline-none focus:ring-1 focus:ring-[#173490]"
                        placeholder="e.g., RES-2026-016"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Issuing Body *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.issuing_body}
                        onChange={(e) => setFormData({ ...formData, issuing_body: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#173490] focus:outline-none focus:ring-1 focus:ring-[#173490]"
                        placeholder="e.g., Committee on Environmental Affairs"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Author *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#173490] focus:outline-none focus:ring-1 focus:ring-[#173490]"
                        placeholder="e.g., Treasurer Lim"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Document File
                      </label>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#173490] focus:outline-none focus:ring-1 focus:ring-[#173490]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#173490] focus:outline-none focus:ring-1 focus:ring-[#173490]"
                      rows={3}
                      placeholder="Brief description of the document"
                    />
                  </div>
                  <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="rounded-lg bg-[#173490] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#1e4bb8] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {uploading ? "Uploading..." : "Upload Document"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Documents List */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-lg font-semibold text-slate-900">All Documents</h2>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-1.5 text-sm focus:border-[#173490] focus:outline-none"
                  />
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
                    className="absolute left-3 top-2.5 text-slate-400"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
                  {["all", "pending", "approved", "published"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition cursor-pointer ${
                        filter === f
                          ? "bg-[#173490] text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredDocuments.length === 0 ? (
              <p className="text-center text-slate-500 py-8">
                {searchQuery ? `No documents matching "${searchQuery}"` : "No documents found"}
              </p>
            ) : (
              <>
                <div className="space-y-3">
                  {displayedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 p-3.5 bg-white transition hover:bg-slate-50/80 shadow-xs"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#173490] text-[10px] font-black text-white shadow-xs">
                          {doc.type.slice(0, 3)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-bold tracking-wider uppercase text-[#173490] bg-[#173490]/5 px-2 py-0.5 rounded-md border border-[#173490]/10">
                              {doc.type}
                            </span>
                            {doc.tracking_number && (
                              <span className="text-xs text-slate-500 font-mono font-medium">
                                {doc.tracking_number}
                              </span>
                            )}
                          </div>
                          <h3 className="mt-1 font-bold text-slate-900 text-sm leading-snug break-words">
                            {doc.title}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-600 truncate">
                            {[doc.issuing_body, doc.author].filter(Boolean).join(" • ")}
                          </p>
                          {doc.description && (
                            <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {doc.description}
                            </p>
                          )}
                          {doc.file_url && (
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[#173490] hover:text-[#E7C609] transition"
                            >
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
                              >
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <path d="M14 2v6h6" />
                                <path d="M16 13H8" />
                                <path d="M16 17H8" />
                                <path d="M10 9H8" />
                              </svg>
                              View File
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(doc.status)}`}
                          >
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          </span>
                          <p className="text-xs text-slate-400">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1.5">
                          {doc.status === "pending" && (
                            currentUserRole === "Admin" ? (
                              <>
                                <button
                                  onClick={() => handleApprove(doc.id)}
                                  className="rounded bg-[#173490] px-2.5 py-1 text-xs font-bold text-white transition hover:bg-blue-700 cursor-pointer shadow-xs"
                                >
                                  ✓ Approve
                                </button>
                                <button
                                  onClick={() => handleReject(doc.id)}
                                  className="rounded bg-red-600 px-2.5 py-1 text-xs font-bold text-white transition hover:bg-red-700 cursor-pointer shadow-xs"
                                >
                                  ✕ Reject
                                </button>
                              </>
                            ) : (
                              <span className="text-[11px] text-slate-500 font-semibold italic bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                🔒 Pending Admin Review
                              </span>
                            )
                          )}
                          {doc.status === "approved" && (
                            currentUserRole === "Admin" ? (
                              <button
                                onClick={() => handlePublish(doc.id)}
                                className="rounded bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white transition hover:bg-emerald-700 cursor-pointer shadow-xs"
                              >
                                🚀 Publish
                              </button>
                            ) : (
                              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                                ✓ Approved by Admin
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center border-t border-slate-100 pt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={currentPage === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              isActive={page === currentPage}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className={currentPage === totalPages ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
