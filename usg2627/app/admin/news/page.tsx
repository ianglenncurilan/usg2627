"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "../../components/AdminSidebar";

const categories = ["NEWS", "PRESS RELEASE", "FEATURED STORY"];

export default function AdminNewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dbError, setDbError] = useState(false);
  const [formData, setFormData] = useState({
    headline: "",
    category: "NEWS",
    summary: "",
    link_url: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [newsList, setNewsList] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setLoading(false);
        fetchNews();
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

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching news:", error);
        if (error.message && (error.message.includes("relation") || error.message.includes("cache"))) {
          setDbError(true);
        }
      } else {
        setNewsList(data || []);
        setDbError(false);
      }
    } catch (err) {
      console.error(err);
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
      let imageUrl = null;

      // Upload file to documents bucket if provided
      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileNameUnique = `${Date.now()}.${fileExt}`;
        const filePath = `news/${fileNameUnique}`;

        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Error uploading file:", uploadError);
          alert("Error uploading image. Please try again.");
          setUploading(false);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("documents")
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // Insert news record
      const { data: { user } } = await supabase.auth.getUser();

      const { error: insertError } = await supabase
        .from("news")
        .insert({
          headline: formData.headline,
          category: formData.category,
          summary: formData.summary,
          link_url: formData.link_url || null,
          image_url: imageUrl,
          created_by: user?.id,
        });

      if (insertError) {
        console.error("Error inserting news:", insertError);
        alert("Error saving news article. Please try again.");
      } else {
        alert("News publication created successfully!");
        setFormData({
          headline: "",
          category: "NEWS",
          summary: "",
          link_url: "",
        });
        setFile(null);
        setIsModalOpen(false);
        fetchNews();
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this news article?")) return;

    const { error } = await supabase
      .from("news")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting news:", error);
      alert("Error deleting news item.");
    } else {
      fetchNews();
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
          
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">News & Press Releases</h1>
              <p className="text-slate-600">Manage news publications, announcements, and featured stories</p>
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
              Write News / Press Release
            </button>
          </div>

          {/* Warning for missing DB table */}
          {dbError && (
            <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-5 shadow-sm text-amber-800 animate-in fade-in duration-300">
              <h3 className="font-bold text-base mb-1">Database Setup Required</h3>
              <p className="text-sm mb-3">
                The `news` table was not found in Supabase. Please copy and execute the SQL script in your Supabase dashboard SQL Editor to create it:
              </p>
              <div className="bg-slate-950 text-slate-200 p-3 rounded-lg text-xs font-mono overflow-x-auto max-h-40 border border-slate-800">
                {`-- Run this SQL in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  headline TEXT NOT NULL,
  summary TEXT NOT NULL,
  image_url TEXT,
  link_url TEXT,
  category TEXT NOT NULL DEFAULT 'NEWS',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view news" ON news FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage news" ON news FOR ALL USING (auth.role() = 'authenticated');`}
              </div>
            </div>
          )}

          {/* News Form Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}>
              <div 
                className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
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

                <h2 className="mb-4 text-lg font-bold text-slate-900">Upload News / Press Release</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Headline *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.headline}
                      onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#173490] focus:outline-none"
                      placeholder="e.g. USG Launches New Mental Health Initiative"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Category *
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#173490] focus:outline-none"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Featured Image File
                      </label>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#173490] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Learn More Hyperlink
                    </label>
                    <input
                      type="url"
                      value={formData.link_url}
                      onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#173490] focus:outline-none"
                      placeholder="e.g. https://university.edu/news/123 (Optional)"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Brief Summary *
                    </label>
                    <textarea
                      required
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#173490] focus:outline-none"
                      rows={4}
                      placeholder="Enter a brief, engaging summary of this news publication..."
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
                      className="rounded-lg bg-[#173490] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#1e4bb8] disabled:opacity-50 cursor-pointer"
                    >
                      {uploading ? "Uploading..." : "Publish News"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* News List */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">All News Publications</h2>

            {newsList.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No news publications found</p>
            ) : (
              <div className="space-y-4">
                {newsList.map((news) => (
                  <div
                    key={news.id}
                    className="flex flex-col md:flex-row items-start gap-4 rounded-lg border border-slate-200 p-4 transition hover:bg-slate-50"
                  >
                    {news.image_url ? (
                      <div className="w-full md:w-32 h-20 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={news.image_url}
                          alt={news.headline}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full md:w-32 h-20 flex-shrink-0 bg-gradient-to-br from-[#173490] to-[#1e4bb8] rounded-lg flex items-center justify-center text-white text-xs font-bold">
                        USG NEWS
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-[#173490]">
                          {news.category}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(news.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="mt-1.5 font-bold text-slate-900">{news.headline}</h3>
                      <p className="mt-1 text-sm text-slate-600 line-clamp-2">{news.summary}</p>
                      {news.link_url && (
                        <a
                          href={news.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-sm text-[#173490] hover:text-[#E7C609] font-medium"
                        >
                          Learn More →
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(news.id)}
                      className="rounded bg-red-50 hover:bg-red-100 p-2 text-red-600 transition cursor-pointer"
                      title="Delete News"
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
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
