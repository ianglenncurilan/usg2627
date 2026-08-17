"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import GridShell from "../components/GridShell";
import { DropdownMenuSelect } from "@/components/ui/dropdown-menu";

const documents = [
  {
    id: "2026-015",
    type: "RESOLUTION",
    title: "Establishment of Campus Sustainability Green Roof Fund",
    issuingBody: "Committee on Environmental Affairs",
    date: "Oct 24, 2026",
    status: "Enacted",
  },
  {
    id: "2026-014",
    type: "MEMORANDUM",
    title: "Guidelines for Student Organization Funding Allocation",
    issuingBody: "Finance Committee",
    date: "Oct 22, 2026",
    status: "Enacted",
  },
  {
    id: "2026-013",
    type: "EXECUTIVE ORDER",
    title: "Student Services Coordination and Resource Optimization",
    issuingBody: "Office of the President",
    date: "Oct 20, 2026",
    status: "Enacted",
  },
  {
    id: "2026-012",
    type: "SPECIAL ORDER",
    title: "Committee Assignments for Academic Year 2026-2027",
    issuingBody: "Senate Secretariat",
    date: "Oct 18, 2026",
    status: "Enacted",
  },
  {
    id: "2026-011",
    type: "RESOLUTION",
    title: "Student Mental Health Support Initiative",
    issuingBody: "Committee on Student Welfare",
    date: "Oct 15, 2026",
    status: "Enacted",
  },
  {
    id: "2026-010",
    type: "MEMORANDUM",
    title: "Academic Calendar Adjustments for Fall Semester",
    issuingBody: "Academic Affairs",
    date: "Oct 12, 2026",
    status: "Enacted",
  },
];

const documentTypes = ["All", "Resolution", "Memorandum", "Executive Order", "Special Order"];
const academicYears = ["2025-2026", "2024-2025", "2023-2024"];
const statuses = ["All", "Enacted", "Pending", "Archived"];
const sortOptions = ["Newest Published", "Oldest Published", "Document Number A-Z", "Document Number Z-A"];

const getTypeColor = (type: string) => {
  switch (type) {
    case "RESOLUTION":
      return "bg-blue-100 text-blue-800";
    case "MEMORANDUM":
      return "bg-green-100 text-green-800";
    case "EXECUTIVE ORDER":
      return "bg-purple-100 text-purple-800";
    case "SPECIAL ORDER":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

export default function DocumentsPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedYear, setSelectedYear] = useState("2025-2026");
  const [selectedStatus, setSelectedStatus] = useState("Enacted");
  const [sortBy, setSortBy] = useState("Newest Published");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      const capitalized = categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1);
      setSelectedType(capitalized);
    }
  }, [searchParams]);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      searchQuery === "" ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "All" || doc.type === selectedType.toUpperCase();
    const matchesStatus = selectedStatus === "All" || doc.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredDocuments.length);
  const displayedDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <GridShell>
      <main className="mx-auto max-w-7xl px-6 py-20">
        <h1 className="text-5xl font-black tracking-[-0.06em] text-slate-900">
          Public Documents
        </h1>

        {/* Search and Filters */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search keyword, document title, or document number (e.g. Resolution 2026-015)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-sm focus:border-[#173490] focus:outline-none focus:ring-1 focus:ring-[#173490]"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
            </div>
            <button className="rounded-lg bg-[#173490] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#1e4bb8]">
              Search
            </button>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-3">
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
        </div>

        {/* Document Count and Sort */}
        <div className="mt-6 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{filteredDocuments.length} Documents</span> Found in {selectedYear}
          </p>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Sort by:</label>
            <DropdownMenuSelect
              options={sortOptions}
              value={sortBy}
              onValueChange={setSortBy}
              placeholder="Select"
            />
          </div>
        </div>

        {/* Document List */}
        <div className="mt-4 space-y-3">
          {displayedDocuments.map((doc) => (
            <div
              key={doc.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${getTypeColor(doc.type)}`}>
                    {doc.type}
                  </span>
                  <h3 className="mt-2 text-base font-semibold text-slate-900">
                    {doc.type === "RESOLUTION" && "Resolution No. "}
                    {doc.type === "MEMORANDUM" && "Memorandum No. "}
                    {doc.type === "EXECUTIVE ORDER" && "Executive Order No. "}
                    {doc.type === "SPECIAL ORDER" && "Special Order No. "}
                    {doc.id}: {doc.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{doc.issuingBody}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{doc.date}</p>
                </div>
                <Link
                  href={`/documents/${doc.id}`}
                  className="mt-2 text-sm font-semibold text-[#173490] transition hover:text-[#E7C609] md:mt-0"
                >
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>

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
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      currentPage === pageNum
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
