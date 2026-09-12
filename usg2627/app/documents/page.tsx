"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import GridShell from "../components/GridShell";
import { DropdownMenuSelect } from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import ExpandableSearchBar from "@/components/ui/expandable-search-bar";

const documentTypes = [
  "All",
  "Resolution",
  "Executive Order",
  "Administrative Order",
  "Memorandum",
  "Special Order",
  "Advisory",
  "Financial Documents"
];
const academicYears = ["2025-2026", "2024-2025", "2023-2024"];
const statuses = ["All", "Enacted", "Pending", "Archived"];
const sortOptions = ["Newest Published", "Oldest Published", "Document Number A-Z", "Document Number Z-A"];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

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

const seedPublicDocuments = [
  {
    id: "doc-seed-1",
    title: "Executive Order No. 2026-001: Comprehensive Digitalization of Student Government Services",
    type: "EXECUTIVE ORDER",
    tracking_number: "RES-2026-15",
    issuing_body: "Office of the USG President",
    status: "published",
    academic_year: "2025-2026",
    published_at: "2026-08-27T10:00:00Z",
    created_at: "2026-08-27T10:00:00Z",
  },
  {
    id: "doc-seed-2",
    title: "Memorandum No. RES-321-3124: Institutional Records Archiving and Transparency Standards",
    type: "MEMORANDUM",
    tracking_number: "RES-321-3124",
    issuing_body: "Department of Interior, Local Governance and Subordinate Units",
    status: "published",
    academic_year: "2025-2026",
    published_at: "2026-08-18T14:30:00Z",
    created_at: "2026-08-18T14:30:00Z",
  },
  {
    id: "doc-seed-3",
    title: "Executive Order No. RES-2026-15: Student Welfare & Academic Support Subsidies",
    type: "EXECUTIVE ORDER",
    tracking_number: "RES-2026-15",
    issuing_body: "Department of Students' Welfare and Development",
    status: "published",
    academic_year: "2025-2026",
    published_at: "2026-08-12T09:00:00Z",
    created_at: "2026-08-12T09:00:00Z",
  },
  {
    id: "doc-seed-4",
    title: "Resolution No. 2026-008: ENACTING THE ANNUAL STUDENT LEADERSHIP AND ACADEMIC FREEDOM CHARTER",
    type: "RESOLUTION",
    tracking_number: "RES-2026-08",
    issuing_body: "USG Senate Legislative Body",
    status: "published",
    academic_year: "2025-2026",
    published_at: "2026-08-05T11:00:00Z",
    created_at: "2026-08-05T11:00:00Z",
  },
  {
    id: "doc-seed-5",
    title: "Administrative Order No. 2026-003: Standardized Financial Liquidation and Audit Protocol",
    type: "ADMINISTRATIVE ORDER",
    tracking_number: "AO-2026-03",
    issuing_body: "Department of Finance and Treasury",
    status: "published",
    academic_year: "2025-2026",
    published_at: "2026-07-20T16:00:00Z",
    created_at: "2026-07-20T16:00:00Z",
  },
];

function DocumentsContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedYear, setSelectedYear] = useState("2025-2026");
  const [selectedStatus, setSelectedStatus] = useState("Enacted");
  const [sortBy, setSortBy] = useState("Newest Published");
  const [currentPage, setCurrentPage] = useState(1);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType, selectedYear, selectedStatus, sortBy]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        setDocuments(seedPublicDocuments);
      } else {
        setDocuments(data);
      }
    } catch {
      setDocuments(seedPublicDocuments);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      const capitalized = categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1);
      setSelectedType(capitalized);
    }
  }, [searchParams]);

  const filteredDocuments = documents.filter((doc: any) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (doc.title && doc.title.toLowerCase().includes(q)) ||
      (doc.tracking_number && doc.tracking_number.toLowerCase().includes(q)) ||
      (doc.document_number && doc.document_number.toLowerCase().includes(q)) ||
      (doc.issuing_body && doc.issuing_body.toLowerCase().includes(q)) ||
      (doc.type && doc.type.toLowerCase().includes(q));

    const matchesType = selectedType === "All" || doc.type?.toUpperCase() === selectedType.toUpperCase();
    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Enacted" && (doc.status === "published" || doc.status === "enacted")) ||
      doc.status?.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredDocuments.length);
  const displayedDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <GridShell>
        <main className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex items-center justify-center">
            <div className="h-12 w-12 border-4 border-[#173490] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </main>
      </GridShell>
    );
  }

  return (
    <GridShell>
      <main className="mx-auto max-w-7xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#173490]/20 bg-[#173490]/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#173490]"
        >
          <span className="h-2 w-2 rounded-full bg-[#E7C609]" />
          Official Repository
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl font-black tracking-[-0.06em] text-slate-900"
        >
          Public Documents
        </motion.h1>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Document Type
              </label>
              <DropdownMenuSelect
                options={documentTypes}
                value={selectedType}
                onValueChange={setSelectedType}
                placeholder="All"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Academic Year
              </label>
              <DropdownMenuSelect
                options={academicYears}
                value={selectedYear}
                onValueChange={setSelectedYear}
                placeholder="Select year"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Status
              </label>
              <DropdownMenuSelect
                options={statuses}
                value={selectedStatus}
                onValueChange={setSelectedStatus}
                placeholder="All"
              />
            </div>
          </div>
        </motion.div>

        {/* Document Count, Search and Sort */}
        <div className="mt-6 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{filteredDocuments.length} Documents</span> Found in {selectedYear}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Sort by:</label>
              <DropdownMenuSelect
                options={sortOptions}
                value={sortBy}
                onValueChange={setSortBy}
                placeholder="Select"
              />
            </div>
            <ExpandableSearchBar
              expandDirection="left"
              width={260}
              placeholder="Search document..."
              value={searchQuery}
              onSearch={(q) => setSearchQuery(q)}
            />
          </div>
        </div>

        {/* Document List with Staggered Entrance */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-4 space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {displayedDocuments.map((doc: any) => (
              <motion.div
                key={doc.id}
                variants={itemVariants}
                layout
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-[#173490]/30"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${getTypeColor(doc.type)}`}>
                      {doc.type}
                    </span>
                    <h3 className="mt-2 text-base font-semibold text-slate-900">
                      {doc.type === "RESOLUTION" && "Resolution No. "}
                      {doc.type === "EXECUTIVE ORDER" && "Executive Order No. "}
                      {doc.type === "ADMINISTRATIVE ORDER" && "Administrative Order No. "}
                      {doc.type === "MEMORANDUM" && "Memorandum No. "}
                      {doc.type === "SPECIAL ORDER" && "Special Order No. "}
                      {doc.type === "ADVISORY" && "Advisory No. "}
                      {doc.type === "FINANCIAL DOCUMENTS" && "Financial Document: "}
                      {doc.tracking_number}: {doc.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">{doc.issuing_body}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {doc.published_at ? new Date(doc.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  {doc.file_url ? (
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-sm font-semibold text-[#173490] transition hover:text-[#E7C609] md:mt-0 inline-flex items-center gap-1"
                    >
                      <span>View</span>
                      <span>→</span>
                    </a>
                  ) : (
                    <Link
                      href={`/documents/${doc.id}`}
                      className="mt-2 text-sm font-semibold text-[#173490] transition hover:text-[#E7C609] md:mt-0 inline-flex items-center gap-1"
                    >
                      <span>View</span>
                      <span>→</span>
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Pagination */}
        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-4 md:flex-row">
          <p className="text-sm text-slate-600">
            Showing {startIndex}-{endIndex} of {filteredDocuments.length} documents
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${currentPage === pageNum
                      ? "bg-[#173490] text-white"
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
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </GridShell>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense
      fallback={
        <GridShell>
          <main className="mx-auto max-w-7xl px-6 py-20 text-center">
            <div className="h-12 w-12 border-4 border-[#173490] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading Documents...</p>
          </main>
        </GridShell>
      }
    >
      <DocumentsContent />
    </Suspense>
  );
}
