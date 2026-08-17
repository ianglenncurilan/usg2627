"use client";

import { useMemo, useState } from "react";
import { DropdownMenuCheckboxes } from "@/components/ui/dropdown-menu";
import GridShell from "../components/GridShell";

const initialDocuments = [
  {
    id: 1,
    title: "USG Memorandum No. 001",
    category: "Memorandum",
    status: "Published",
    date: "2026-08-12",
  },
  {
    id: 2,
    title: "Resolution on Student Wellness Program",
    category: "Resolution",
    status: "Under Review",
    date: "2026-08-09",
  },
  {
    id: 3,
    title: "Executive Order 2026-04",
    category: "Executive Order",
    status: "Draft",
    date: "2026-08-07",
  },
];

const initialEvents = [
  { id: 1, title: "Leadership Assembly", date: "2026-08-22", type: "Upcoming" },
  { id: 2, title: "Constitution Day Forum", date: "2026-08-02", type: "Past" },
  { id: 3, title: "Student Services Fair", date: "2026-07-17", type: "Past" },
];

export default function AdminPage() {
  const [documentForm, setDocumentForm] = useState({
    title: "",
    category: "Memorandum",
    status: "Draft",
    author: "",
    tracking: "",
  });

  const [eventForm, setEventForm] = useState({
    title: "",
    date: "",
    type: "Upcoming",
  });

  const [documents, setDocuments] = useState(initialDocuments);
  const [events, setEvents] = useState(initialEvents);
  const [message, setMessage] = useState("Ready for review.");

  const totals = useMemo(
    () => ({
      documents: documents.length,
      published: documents.filter((d) => d.status === "Published").length,
      pending: documents.filter((d) => d.status !== "Published").length,
      events: events.length,
    }),
    [documents, events],
  );

  const handleDocumentSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const freshDocument = {
      id: Date.now(),
      title: documentForm.title || "Untitled document",
      category: documentForm.category,
      status: documentForm.status,
      date: new Date().toISOString().slice(0, 10),
    };

    setDocuments((current) => [freshDocument, ...current]);
    setMessage(
      `Saved: ${freshDocument.title} submitted for ${freshDocument.status.toLowerCase()} review.`,
    );
    setDocumentForm({
      title: "",
      category: "Memorandum",
      status: "Draft",
      author: "",
      tracking: "",
    });
  };

  const handleEventSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const freshEvent = {
      id: Date.now(),
      title: eventForm.title || "New event",
      date: eventForm.date || new Date().toISOString().slice(0, 10),
      type: eventForm.type,
    };

    setEvents((current) => [freshEvent, ...current]);
    setMessage(
      `Event saved: ${freshEvent.title} marked as ${freshEvent.type.toLowerCase()}.`,
    );
    setEventForm({ title: "", date: "", type: "Upcoming" });
  };

  return (
    <GridShell>
      <header className="border-b border-slate-200 bg-[#173490] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E7C609] text-sm font-black text-[#173490]">
              USG
            </div>
            <div>
              <p className="text-lg font-semibold">
                University Student Government
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-200">
                Administrative Portal
              </p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <a href="/" className="text-slate-200 transition hover:text-white">
              Public Portal
            </a>
            <a
              href="#documents"
              className="text-slate-200 transition hover:text-white"
            >
              Documents
            </a>
            <a
              href="#events"
              className="text-slate-200 transition hover:text-white"
            >
              Events
            </a>
            <a
              href="#reports"
              className="text-slate-200 transition hover:text-white"
            >
              Reports
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#173490]">
              Editorial Desk
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
              Content Management Dashboard
            </h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            {message}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            {
              label: "Published Docs",
              value: totals.published,
              tone: "bg-[#173490] text-white",
            },
            {
              label: "Pending Review",
              value: totals.pending,
              tone: "bg-[#E7C609] text-[#173490]",
            },
            {
              label: "Total Records",
              value: totals.documents,
              tone: "bg-white text-slate-900",
            },
            {
              label: "Events",
              value: totals.events,
              tone: "bg-slate-900 text-white",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-2xl p-5 shadow-sm ring-1 ring-slate-200 ${item.tone}`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-75">
                {item.label}
              </p>
              <p className="mt-3 text-3xl font-black">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div
            id="documents"
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#173490]">
                  Upload
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  Document Submission
                </h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                RBAC: Encoder
              </span>
            </div>

            <form onSubmit={handleDocumentSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Document title
                </label>
                <input
                  value={documentForm.title}
                  onChange={(event) =>
                    setDocumentForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-[#173490] focus:bg-white"
                  placeholder="e.g., Memorandum No. 001"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Category
                  </label>
                  <DropdownMenuCheckboxes
                    options={[
                      "Memorandum",
                      "Resolutions",
                      "Executive Order",
                      "Special Order",
                    ]}
                    value={documentForm.category}
                    onValueChange={(value) =>
                      setDocumentForm((current) => ({
                        ...current,
                        category: value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    value={documentForm.status}
                    onChange={(event) =>
                      setDocumentForm((current) => ({
                        ...current,
                        status: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-[#173490] focus:bg-white"
                  >
                    <option>Draft</option>
                    <option>First Reading</option>
                    <option>Second Reading</option>
                    <option>Third Reading</option>
                    <option>Passed</option>
                    <option>Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Author / Office
                  </label>
                  <input
                    value={documentForm.author}
                    onChange={(event) =>
                      setDocumentForm((current) => ({
                        ...current,
                        author: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-[#173490] focus:bg-white"
                    placeholder="e.g., Office of the President"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Tracking No.
                  </label>
                  <input
                    value={documentForm.tracking}
                    onChange={(event) =>
                      setDocumentForm((current) => ({
                        ...current,
                        tracking: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-[#173490] focus:bg-white"
                    placeholder="USG-RES-2026-004"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                PDF upload dropzone: Official document, signed memorandum, or
                resolution attachment.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="rounded-xl bg-[#173490] px-5 py-3 font-semibold text-white transition hover:bg-[#102a72]"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Send for Review
                </button>
              </div>
            </form>
          </div>

          <div
            id="events"
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#173490]">
                  Calendar
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  Live Event Entry
                </h2>
              </div>
              <span className="rounded-full bg-[#E7C609] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#173490]">
                Publish
              </span>
            </div>

            <form onSubmit={handleEventSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Event title
                </label>
                <input
                  value={eventForm.title}
                  onChange={(event) =>
                    setEventForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-[#173490] focus:bg-white"
                  placeholder="e.g., Constitutional Assembly"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Date
                  </label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(event) =>
                      setEventForm((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-[#173490] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Type
                  </label>
                  <select
                    value={eventForm.type}
                    onChange={(event) =>
                      setEventForm((current) => ({
                        ...current,
                        type: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-[#173490] focus:bg-white"
                  >
                    <option>Upcoming</option>
                    <option>Past</option>
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                Media upload area for event posters, official photos, and
                captions.
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#E7C609] px-5 py-3 font-semibold text-[#173490] transition hover:brightness-95"
              >
                Publish Event
              </button>
            </form>
          </div>
        </section>

        <section
          id="reports"
          className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#173490]">
                Queue
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Publishing Workflow
              </h2>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((document) => (
                  <tr
                    key={document.id}
                    className="border-t border-slate-200 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {document.title}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {document.category}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          document.status === "Published"
                            ? "bg-emerald-100 text-emerald-700"
                            : document.status === "Draft"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-sky-100 text-sky-700"
                        }`}
                      >
                        {document.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {document.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </GridShell>
  );
}
