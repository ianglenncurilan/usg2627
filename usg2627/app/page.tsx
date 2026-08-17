"use client";

import Link from "next/link";
import Header from "./components/Header";
import GridShell from "./components/GridShell";

const quickLinks = [
  {
    title: "About USG",
    description: "Student governance and leadership initiatives.",
    href: "/about",
  },
  {
    title: "Senate",
    description: "Leadership and office directory.",
    href: "/senate",
  },
  {
    title: "Committees",
    description: "Oversight and standing committees.",
    href: "/committees",
  },
  {
    title: "Documents",
    description: "Resolutions, memos, and public records.",
    href: "/documents",
  },
];

export default function Home() {
  return (
    <GridShell>
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-20">
        <section className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center text-center">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_6px_20px_rgba(15,23,42,0.04)] backdrop-blur-sm">
            <span className="h-3 w-3 rounded-full bg-[#5ab07d] shadow-[0_0_0_4px_rgba(90,176,125,0.15)]" />
            <span>Official Student Portal</span>
          </div>

          <h1 className="max-w-5xl text-5xl font-black tracking-[-0.06em] text-slate-900 md:text-7xl">
            University Student Government
          </h1>

          <p className="mt-6 max-w-3xl text-xl leading-8 text-slate-600 md:text-2xl">
            Public service, student accountability, and governance across campus
            leadership, documents, and events.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/about"
              className="rounded-full bg-[#E7C609] px-6 py-3 text-sm font-bold text-[#173490] shadow-sm transition hover:brightness-95"
            >
              Learn More
            </Link>
            <Link
              href="/documents"
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
            >
              View Documents
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_28px_rgba(15,23,42,0.08)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#173490]">
                Section
              </p>
              <h2 className="mt-3 text-2xl font-black text-slate-900">
                {link.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {link.description}
              </p>
            </Link>
          ))}
        </section>
      </main>
    </GridShell>
  );
}
