"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import GridShell from "../../components/GridShell";
import { supabase } from "@/lib/supabase";

const documentData = {
  "2026-015": {
    type: "RESOLUTION",
    number: "Resolution No. 2026-015",
    title: "Establishment of Campus Sustainability Green Roof Fund for Student-Led Projects",
    dateEnacted: "October 24, 2026",
    sponsorCommittee: "Committee on Environmental Affairs",
    voteTally: "24 Yeas / 2 Nays / 1 Abstain",
    status: "ENACTED",
    fileName: "Resolution_2026-015_Green_Roof.pdf",
  },
};

const relatedDocuments = [
  {
    id: "2026-014",
    type: "MEMORANDUM",
    title: "Guidelines for Student Organization Funding Allocation",
    date: "Oct 22, 2026",
  },
  {
    id: "2026-013",
    type: "RESOLUTION",
    title: "Student Mental Health Support Initiative",
    date: "Oct 15, 2026",
  },
  {
    id: "2026-012",
    type: "EXECUTIVE ORDER",
    title: "Student Services Coordination",
    date: "Oct 20, 2026",
  },
];

const getTypeColor = (type: string) => {
  switch (type?.toUpperCase()) {
    case "RESOLUTION":
      return "bg-blue-100 text-blue-800";
    case "EXECUTIVE ORDER":
      return "bg-purple-100 text-purple-800";
    case "ADMINISTRATIVE ORDER":
      return "bg-indigo-100 text-indigo-800";
    case "MEMORANDUM":
      return "bg-green-100 text-green-800";
    case "SPECIAL ORDER":
      return "bg-orange-100 text-orange-800";
    case "ADVISORY":
      return "bg-amber-100 text-amber-800";
    case "FINANCIAL DOCUMENTS":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  const [resolvedParams, setResolvedParams] = useState<any>(null);
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params) {
      if (typeof (params as any).then === "function") {
        (params as any).then((resolved: any) => setResolvedParams(resolved));
      } else {
        setResolvedParams(params);
      }
    }
  }, [params]);

  const id = resolvedParams?.id;

  useEffect(() => {
    if (!id) return;

    async function fetchDoc() {
      // Check static mock data
      const staticDoc = documentData[id as keyof typeof documentData];
      if (staticDoc) {
        setDoc(staticDoc);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("documents")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching document:", error);
        } else if (data) {
          setDoc({
            type: data.type,
            number: `${data.type === "RESOLUTION" ? "Resolution" : data.type === "MEMORANDUM" ? "Memorandum" : data.type === "EXECUTIVE ORDER" ? "Executive Order" : "Special Order"} No. ${data.tracking_number}`,
            title: data.title,
            dateEnacted: data.published_at 
              ? new Date(data.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              : new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            sponsorCommittee: data.issuing_body,
            voteTally: data.author ? `Author: ${data.author}` : "N/A",
            status: data.status.toUpperCase(),
            fileName: data.file_name || "Document.pdf",
            fileUrl: data.file_url,
            description: data.description,
          });
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDoc();
  }, [id]);

  if (loading || !resolvedParams) {
    return (
      <GridShell>
        <main className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex items-center justify-center py-20">
            <div className="h-12 w-12 border-4 border-[#173490] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </main>
      </GridShell>
    );
  }

  if (!doc) {
    return (
      <GridShell>
        <main className="mx-auto max-w-7xl px-6 py-20">
          <h1 className="text-5xl font-black tracking-[-0.06em] text-slate-900">
            Document Not Found
          </h1>
          <Link href="/documents" className="mt-4 inline-block text-[#173490] hover:text-[#E7C609]">
            ← Back to Documents
          </Link>
        </main>
      </GridShell>
    );
  }

  return (
    <GridShell>
      <main className="mx-auto max-w-7xl px-6 py-20">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-600">
          <Link href="/" className="hover:text-[#173490]">
            Home
          </Link>
          <span>/</span>
          <Link href="/documents" className="hover:text-[#173490]">
            Documents
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-900">{doc.number}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Document Header */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${getTypeColor(doc.type)}`}>
                {doc.type}
              </span>
              <h1 className="mt-4 text-3xl font-black text-slate-900">
                {doc.number}
              </h1>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">
                {doc.title}
              </h2>

              {/* Document Details */}
              <div className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-4 md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Date Enacted
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{doc.dateEnacted}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Sponsor Committee
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{doc.sponsorCommittee}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Vote Tally
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{doc.voteTally}</p>
                </div>
              </div>

              {/* Status */}
              <div className="mt-4 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-green-800">
                  {doc.status}
                </span>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 p-4">
                <div className="flex items-center gap-3">
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
                    className="text-red-500"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span className="text-sm font-medium text-slate-900">{doc.fileName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50">
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
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" x2="16.65" y1="21" y2="16.65" />
                      <line x1="11" x2="11" y1="8" y2="14" />
                      <line x1="8" x2="14" y1="11" y2="11" />
                    </svg>
                  </button>
                  <button className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50">
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
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" x2="16.65" y1="21" y2="16.65" />
                      <line x1="8" x2="14" y1="11" y2="11" />
                    </svg>
                  </button>
                  <button className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50">
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
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" x2="12" y1="15" y2="3" />
                    </svg>
                  </button>
                  <button className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50">
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
                    >
                      <path d="M6 9V2h12v7" />
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                      <path d="M6 14h12v8H6z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* PDF Content Viewer or Description Fallback */}
              {doc.fileUrl ? (
                <div className="w-full h-[600px] bg-slate-100">
                  <iframe
                    src={doc.fileUrl}
                    className="w-full h-full border-none"
                    title={doc.title}
                  />
                </div>
              ) : (
                <div className="min-h-[600px] bg-slate-100 p-8">
                  <div className="mx-auto max-w-3xl rounded-lg bg-white p-8 shadow-sm">
                    <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
                      University Student Government
                    </p>
                    <p className="mt-2 text-center text-sm font-bold text-slate-900">
                      Office of the {doc.type === "RESOLUTION" ? "Senate President" : "Secretariat"}
                    </p>
                    <p className="mt-4 text-center text-lg font-black text-slate-900">
                      {doc.number}
                    </p>
                    <div className="mt-8 space-y-4 text-sm text-slate-700">
                      <p className="font-semibold">{doc.title}</p>
                      {doc.description ? (
                        <p>{doc.description}</p>
                      ) : (
                        <p>No description or digital text content is available for this document.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Documents */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">Related Documents</h3>
              <div className="mt-4 space-y-3">
                {relatedDocuments.map((related) => (
                  <Link
                    key={related.id}
                    href={`/documents/${related.id}`}
                    className="block rounded-lg border border-slate-100 bg-slate-50 p-3 transition hover:border-slate-200 hover:bg-slate-100"
                  >
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${getTypeColor(related.type)}`}>
                      {related.type}
                    </span>
                    <p className="mt-2 text-sm font-medium text-slate-900 line-clamp-2">
                      {related.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{related.date}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Document Inquiries */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">Document Inquiries</h3>
              <p className="mt-3 text-sm text-slate-600">
                For official records, certified copies, or questions regarding this document, please contact the USG Secretariat Office.
              </p>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
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
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>(632) 552-6601</span>
                </div>
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
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span>usg.secretariat@university.edu</span>
                </div>
              </div>
            </div>

            {/* Download Section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">Need an official copy?</h3>
              <p className="mt-2 text-sm text-slate-600">
                Download a certified PDF for record-keeping purposes.
              </p>
              {doc.fileUrl ? (
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block w-full text-center rounded-lg bg-[#173490] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1e4bb8]"
                >
                  Download Certified File
                </a>
              ) : (
                <button className="mt-4 w-full rounded-lg bg-[#173490] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1e4bb8]">
                  Download Certified PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </GridShell>
  );
}
