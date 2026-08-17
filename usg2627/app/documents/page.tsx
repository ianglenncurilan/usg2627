"use client";

import { useState } from "react";
import { DropdownMenuSelect } from "@/components/ui/dropdown-menu";
import Header from "../components/Header";
import GridShell from "../components/GridShell";

const documents = [
  { title: "USG Memorandum No. 001", category: "Memorandum" },
  {
    title: "Resolution Supporting the Student Wellness Initiative",
    category: "Resolution",
  },
  {
    title: "Executive Order 2026-04: Student Services Coordination",
    category: "Executive Order",
  },
  {
    title: "Special Order No. 008: Committee Assignments",
    category: "Special Order",
  },
  { title: "USG Bill 2026-15: Advocacy and Housing Support", category: "Bill" },
];

const categoryOptions = [
  "Memorandum",
  "Resolutions",
  "Executive Order",
  "Special Order",
];

export default function DocumentsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const filteredDocuments = selectedCategory
    ? documents.filter((doc) => {
        if (selectedCategory === "Resolutions")
          return doc.category === "Resolution";
        return doc.category === selectedCategory;
      })
    : documents;

  return (
    <GridShell>
      <Header subtitle="Documents" />

      <div className="hidden md:block">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <div className="flex justify-end">
            <div className="w-48">
              <DropdownMenuSelect
                variant="header"
                options={categoryOptions}
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                placeholder="Filter by category"
              />
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-20">
        <h1 className="text-5xl font-black tracking-[-0.06em] text-slate-900">
          Public Documents
        </h1>
        <div className="mt-10 space-y-5">
          {filteredDocuments.map((document) => (
            <div
              key={document.title}
              className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#173490]">
                {document.category}
              </p>
              <h2 className="mt-3 text-2xl font-black text-slate-900">
                {document.title}
              </h2>
            </div>
          ))}
        </div>
      </main>
    </GridShell>
  );
}
