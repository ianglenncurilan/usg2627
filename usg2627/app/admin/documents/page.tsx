"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "../../components/AdminSidebar";

const documentTypes = [
  "RESOLUTION",
  "MEMORANDUM",
  "EXECUTIVE ORDER",
  "SPECIAL ORDER"
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

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setLoading(false);
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

  const filteredDocuments = documents.filter(doc => {
    if (filter === "all") return true;
    return doc.status === filter;
  });

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
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Documents Management</h1>
            <p className="text-slate-600">Upload and manage official documents</p>
          </div>

          {/* Upload Form */}
          <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Upload New Document</h2>
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
              <button
                type="submit"
                disabled={uploading}
                className="rounded-lg bg-[#173490] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#1e4bb8] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : "Upload Document"}
              </button>
            </form>
          </div>

          {/* Documents List */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">All Documents</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    filter === "all"
                      ? "bg-[#173490] text-white"
                      : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("pending")}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    filter === "pending"
                      ? "bg-[#173490] text-white"
                      : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilter("approved")}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    filter === "approved"
                      ? "bg-[#173490] text-white"
                      : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Approved
                </button>
                <button
                  onClick={() => setFilter("published")}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    filter === "published"
                      ? "bg-[#173490] text-white"
                      : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Published
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredDocuments.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No documents found</p>
              ) : (
                filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-start gap-4 rounded-lg border border-slate-200 p-4 transition hover:bg-slate-50"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#173490] text-xs font-bold text-white">
                      {doc.type.slice(0, 3)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#173490]">
                          {doc.type}
                        </span>
                        <span className="text-xs text-slate-500">{doc.tracking_number}</span>
                      </div>
                      <h3 className="mt-1 font-medium text-slate-900">{doc.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {doc.issuing_body} • {doc.author}
                      </p>
                      {doc.file_url && (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-sm text-[#173490] hover:text-[#E7C609]"
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
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColor(doc.status)}`}
                      >
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </span>
                      <p className="text-xs text-slate-500">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex gap-1">
                        {doc.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(doc.id)}
                              className="rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white transition hover:bg-blue-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(doc.id)}
                              className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white transition hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {doc.status === "approved" && (
                          <button
                            onClick={() => handlePublish(doc.id)}
                            className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700"
                          >
                            Publish
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
