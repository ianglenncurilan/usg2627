"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

const documentTypes = [
  {
    title: "Memorandums",
    description: "Internal communications and policy directives",
    count: "24",
    href: "/documents?category=Memorandum",
  },
  {
    title: "Resolutions",
    description: "Official legislative acts and decisions",
    count: "156",
    href: "/documents?category=Resolutions",
  },
  {
    title: "Executive Orders",
    description: "Presidential directives and implementations",
    count: "42",
    href: "/documents?category=Executive Order",
  },
  {
    title: "Special Orders",
    description: "Ad-hoc directives and emergency measures",
    count: "18",
    href: "/documents?category=Special Order",
  },
];

const recentPublications = [
  {
    type: "RESOLUTION",
    title: "Resolution Supporting the Student Wellness Initiative",
    date: "Aug 15, 2026",
  },
  {
    type: "MEMORANDUM",
    title: "USG Memorandum No. 001: Academic Calendar Adjustments",
    date: "Aug 12, 2026",
  },
  {
    type: "EXECUTIVE ORDER",
    title: "Executive Order 2026-04: Student Services Coordination",
    date: "Aug 10, 2026",
  },
  {
    type: "SPECIAL ORDER",
    title: "Special Order No. 008: Committee Assignments",
    date: "Aug 8, 2026",
  },
];

const newsItems = [
  {
    title: "USG Launches New Student Mental Health Initiative",
    date: "Aug 16, 2026",
    description: "A comprehensive program to support student well-being across campus.",
  },
  {
    title: "Senate Passes Historic Budget Reform Bill",
    date: "Aug 14, 2026",
    description: "New transparency measures for student organization funding approved.",
  },
  {
    title: "Leadership Assembly Set for Next Week",
    date: "Aug 13, 2026",
    description: "Annual gathering of student leaders to discuss campus priorities.",
  },
];

const featuredStories = [
  {
    type: "EXECUTIVE ORDER",
    title: "EO No. 2026-004: Academic Freedom & Student Representation Expansion",
    description: "Enacted by the Office of the Student Government President, this order establishes mandatory student representative seats on all major academic review boards.",
    readHref: "/documents",
    imageSrc: "/images/publication-hero.jpg",
  },
  {
    type: "RESOLUTION",
    title: "Resolution Supporting the Student Wellness Initiative",
    description: "A comprehensive resolution passed by the Senate to expand mental health resources and support services across all campus facilities.",
    readHref: "/documents",
    imageSrc: "/images/wellness-hero.jpg",
  },
  {
    type: "MEMORANDUM",
    title: "USG Memorandum No. 002: Campus Sustainability Guidelines",
    description: "New environmental policies and sustainability guidelines for all student organizations and campus events effective immediately.",
    readHref: "/documents",
    imageSrc: "/images/sustainability-hero.jpg",
  },
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredStories.length);
        setIsTransitioning(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentStory = featuredStories[currentIndex];

  return (
    <GridShell>
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

        {/* Latest Official Publication */}
        <section className="mt-16 rounded-3xl border border-slate-200 bg-white p-8 shadow-md md:p-12 lg:p-14">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            <div className={`lg:w-1/2 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              <div className="mb-5 flex items-center gap-3">
                <span className="rounded-full bg-[#173490]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#173490]">
                  {currentStory.type}
                </span>
                <span className="text-sm font-medium uppercase tracking-wider text-slate-500">
                  Featured Story
                </span>
              </div>
              <h2 className="text-3xl font-black leading-tight text-slate-900 md:text-4xl lg:text-5xl">
                {currentStory.title}
              </h2>
              <p className="mt-5 text-lg text-slate-600">
                {currentStory.description}
              </p>
              <div className="mt-8 flex gap-4">
                <Link
                  href={currentStory.readHref}
                  className="inline-flex items-center gap-2 rounded-full bg-[#E7C609] px-7 py-3.5 text-base font-bold text-[#173490] transition hover:bg-yellow-400"
                >
                  Read Order
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
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" x2="21" y1="14" y2="3" />
                  </svg>
                </Link>
                <Link
                  href="/documents"
                  className="inline-flex items-center rounded-full border border-slate-300 px-7 py-3.5 text-base font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  All Publications
                </Link>
              </div>
            </div>
            <div className={`lg:w-5/12 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              <div className="relative h-72 rounded-2xl bg-gradient-to-br from-[#1e4bb8] to-[#173490] lg:h-80">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="72"
                    height="72"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-30"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-center gap-2">
            {featuredStories.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setCurrentIndex(index);
                    setIsTransitioning(false);
                  }, 300);
                }}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? 'w-8 bg-[#173490]' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to story ${index + 1}`}
              />
            ))}
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

        {/* Quick Access Document Portal */}
        <section className="mt-20">
          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">
              Quick Access Document Portal
            </h2>
            <p className="mt-2 text-slate-600">
              Browse official USG documents by category
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {documentTypes.map((doc) => (
              <Link
                key={doc.title}
                href={doc.href}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#173490] hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#173490]">
                      {doc.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                      {doc.description}
                    </p>
                  </div>
                  <span className="text-2xl font-black text-[#E7C609]">
                    {doc.count}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Publications */}
        <section className="mt-20">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">
                Recent Publications
              </h2>
              <p className="mt-2 text-slate-600">
                Latest official documents and releases
              </p>
            </div>
            <Link
              href="/documents"
              className="text-sm font-semibold text-[#173490] transition hover:text-[#E7C609]"
            >
              View Archive →
            </Link>
          </div>
          <div className="space-y-4">
            {recentPublications.map((pub) => (
              <div
                key={pub.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <span className="inline-block rounded-full bg-[#173490]/10 px-3 py-1 text-xs font-bold text-[#173490]">
                      {pub.type}
                    </span>
                    <h3 className="mt-3 text-lg font-semibold text-slate-900">
                      {pub.title}
                    </h3>
                  </div>
                  <span className="text-sm text-slate-500">{pub.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* News & Press Releases */}
        <section className="mt-20">
          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">
              News & Press Releases
            </h2>
            <p className="mt-2 text-slate-600">
              Latest updates and announcements from USG
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {newsItems.map((news) => (
              <div
                key={news.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 h-40 rounded-xl bg-gradient-to-br from-[#173490] to-[#1e4bb8]" />
                <span className="text-xs font-semibold text-slate-500">
                  {news.date}
                </span>
                <h3 className="mt-2 text-lg font-bold text-slate-900">
                  {news.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {news.description}
                </p>
                <button className="mt-4 text-sm font-semibold text-[#173490] transition hover:text-[#E7C609]">
                  Read Full Article →
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </GridShell>
  );
}
