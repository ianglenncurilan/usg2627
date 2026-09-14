"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import GridShell from "./components/GridShell";
import SectionHeader from "./components/SectionHeader";
import { supabase } from "@/lib/supabase";
import { fetchWithCache } from "@/lib/cache";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const topDocumentTypes = [
  {
    type: "RESOLUTION",
    title: "Resolutions",
    description: "Official legislative acts, motions, and enactments",
    href: "/documents?category=Resolution",
  },
  {
    type: "EXECUTIVE ORDER",
    title: "Executive Orders",
    description: "Presidential directives and administrative policies",
    href: "/documents?category=Executive Order",
  },
  {
    type: "ADMINISTRATIVE ORDER",
    title: "Administrative Orders",
    description: "Departmental rules, regulations, and office orders",
    href: "/documents?category=Administrative Order",
  },
  {
    type: "MEMORANDUM",
    title: "Memorandums",
    description: "Internal communications and official circulars",
    href: "/documents?category=Memorandum",
  },
];

const bottomDocumentTypes = [
  {
    type: "SPECIAL ORDER",
    title: "Special Orders",
    description: "Ad-hoc task force designations and committee assignments",
    href: "/documents?category=Special Order",
  },
  {
    type: "ADVISORY",
    title: "Advisories",
    description: "Campus bulletins, public notices, and student updates",
    href: "/documents?category=Advisory",
  },
  {
    type: "FINANCIAL DOCUMENTS",
    title: "Financial Documents",
    description: "Official financial statements, balance sheets, and audit reports",
    href: "/documents?category=Financial Documents",
  },
];

const staticNewsItems = [
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
  {
    title: "Campus Infrastructure & Facility Upgrade Plan Announced",
    date: "Aug 10, 2026",
    description: "Major investments planned for student spaces, study lounges, and sports complexes.",
  },
  {
    title: "Annual Student Organization Fair & Accreditation",
    date: "Aug 05, 2026",
    description: "Registration and re-accreditation open for all official campus student groups.",
  },
  {
    title: "Academic Honor Council Selection Open Call",
    date: "Jul 28, 2026",
    description: "Applications now open for student representatives on the honor council.",
  },
];

const staticFeaturedStories = [
  {
    type: "EXECUTIVE ORDER",
    title: "EO No. 2026-004: Academic Freedom & Student Representation Expansion",
    description: "Enacted by the Office of the Student Government President, this order establishes mandatory student representative seats on all major academic review boards.",
    readHref: "/documents",
    imageSrc: "/images/publication-hero.jpg",
    date: "Aug 17, 2026",
  },
  {
    type: "RESOLUTION",
    title: "Resolution Supporting the Student Wellness Initiative",
    description: "A comprehensive resolution passed by the Senate to expand mental health resources and support services across all campus facilities.",
    readHref: "/documents",
    imageSrc: "/images/wellness-hero.jpg",
    date: "Aug 15, 2026",
  },
  {
    type: "MEMORANDUM",
    title: "USG Memorandum No. 002: Campus Sustainability Guidelines",
    description: "New environmental policies and sustainability guidelines for all student organizations and campus events effective immediately.",
    readHref: "/documents",
    imageSrc: "/images/sustainability-hero.jpg",
    date: "Aug 12, 2026",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [recentPublications, setRecentPublications] = useState<any[]>([]);
  const [loadingPublications, setLoadingPublications] = useState(true);
  const [docCounts, setDocCounts] = useState<Record<string, number>>({
    RESOLUTION: 0,
    "EXECUTIVE ORDER": 0,
    "ADMINISTRATIVE ORDER": 0,
    MEMORANDUM: 0,
    "SPECIAL ORDER": 0,
    ADVISORY: 0,
    "FINANCIAL DOCUMENTS": 0,
  });
  const [featuredStories, setFeaturedStories] = useState<any[]>(staticFeaturedStories);
  const [newsItems, setNewsItems] = useState<any[]>(staticNewsItems);
  const [newsPage, setNewsPage] = useState(1);
  const newsPerPage = 3;

  const totalNewsPages = Math.ceil(newsItems.length / newsPerPage);
  const displayedNewsItems = newsItems.slice(
    (newsPage - 1) * newsPerPage,
    newsPage * newsPerPage
  );



  useEffect(() => {
    async function fetchNews() {
      try {
        const data = await fetchWithCache("home_news", async () => {
          const { data, error } = await supabase
            .from("news")
            .select("id, category, headline, summary, link_url, image_url, created_at")
            .order("created_at", { ascending: false });
          if (error) throw error;
          return data || [];
        });

        if (data && data.length > 0) {
          const featured = data.filter((item: any) => item.category === "FEATURED STORY" || item.category === "RESOLUTION FEATURED STORY");
          const generalNews = data.filter((item: any) => item.category !== "FEATURED STORY" && item.category !== "RESOLUTION FEATURED STORY");

          if (featured.length > 0) {
            setFeaturedStories(featured.map((item: any) => ({
              type: item.category.replace(" FEATURED STORY", ""),
              title: item.headline,
              description: item.summary,
              readHref: item.link_url || "/documents",
              imageSrc: item.image_url || "/images/publication-hero.jpg",
              date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            })));
          }

          if (generalNews.length > 0) {
            setNewsItems(generalNews.map((item: any) => ({
              title: item.headline,
              date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              description: item.summary,
              linkHref: item.link_url,
              imageSrc: item.image_url,
            })));
          }
        }
      } catch (err) {
        console.error("Error fetching news:", err);
      }
    }

    fetchNews();
  }, []);

  useEffect(() => {
    async function fetchDocumentsData() {
      try {
        const data = await fetchWithCache("home_documents", async () => {
          const { data, error } = await supabase
            .from("documents")
            .select("id, type, tracking_number, title, published_at, created_at, file_url")
            .eq("status", "published")
            .order("created_at", { ascending: false });
          if (error) throw error;
          return data || [];
        });

        if (data) {
          // Strictly display only the 4 most recent publications
          setRecentPublications(data.slice(0, 4));

          const counts: Record<string, number> = {
            RESOLUTION: 0,
            "EXECUTIVE ORDER": 0,
            "ADMINISTRATIVE ORDER": 0,
            MEMORANDUM: 0,
            "SPECIAL ORDER": 0,
            ADVISORY: 0,
            "FINANCIAL DOCUMENTS": 0,
          };

          data.forEach((doc: any) => {
            if (doc.type) {
              const typeKey = doc.type.trim().toUpperCase();
              if (counts[typeKey] !== undefined) {
                counts[typeKey] += 1;
              } else {
                counts[typeKey] = (counts[typeKey] || 0) + 1;
              }
            }
          });

          setDocCounts(counts);
        }
      } catch (err) {
        console.error("Error fetching documents:", err);
      } finally {
        setLoadingPublications(false);
      }
    }
    fetchDocumentsData();
  }, []);

  useEffect(() => {
    setCurrentIndex(0);
  }, [featuredStories.length]);

  useEffect(() => {
    if (featuredStories.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredStories.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredStories.length]);

  const currentStory = featuredStories && featuredStories.length > 0 && currentIndex < featuredStories.length
    ? featuredStories[currentIndex]
    : null;

  return (
    <GridShell showCircles={false}>
      {/* Hero Banner Section with usg_background1.png (Fits full viewport height below header) */}
      <div className="relative w-full overflow-hidden h-[calc(100vh-76px)] min-h-[500px] max-h-[880px] flex flex-col justify-center items-center">
        {/* Background Image (Spans full width and height) */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          <Image
            src="/usg_background1.png"
            alt="USG Background"
            fill
            priority
            className="object-cover object-center"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 w-full flex flex-col justify-center items-center text-center py-4">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-shrink-0 flex-col items-center justify-center text-center"
          >
            {/* Institutional Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-900/15 bg-white/90 px-3.5 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#02076C] shadow-[0_4px_16px_rgba(2,7,108,0.06)] backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Caraga State University • Official Portal</span>
            </motion.div>

            {/* Hero Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#02076C] uppercase leading-tight drop-shadow-sm"
            >
              University Student Government
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-xl text-xs sm:text-sm md:text-base leading-relaxed text-slate-600 font-normal mt-3"
            >
              Public service, student accountability, and governance across campus leadership, documents, and events.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 flex flex-wrap items-center justify-center gap-3"
            >
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-xl bg-[#02076C] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-950/20 transition hover:bg-[#173490] hover:scale-105 active:scale-95"
              >
                <span>Learn More</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link
                href="/documents"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-800 shadow-sm transition hover:bg-slate-50 hover:border-slate-400 hover:scale-105 active:scale-95"
              >
                <span>View Documents</span>
              </Link>
            </motion.div>
          </motion.section>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-12">

        {/* Featured Story Carousel (Fixed Height Container to guarantee ZERO layout movement) */}
        {currentStory && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 mb-12 sm:mb-16 shrink-0"
          >
            <div className="relative w-full h-[720px] sm:h-[640px] lg:h-[540px] overflow-hidden">
              <AnimatePresence initial={false}>
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 w-full h-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12"
                >
                  <div className="lg:w-[42%] flex flex-col justify-between h-full py-2">
                    <div>
                      <div className="mb-4 flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          {currentStory.type && !currentStory.type.toLowerCase().includes("featured")
                            ? `Featured Story • ${currentStory.type}`
                            : "Featured Story"}
                        </span>
                      </div>
                      <h2 className="text-3xl font-black leading-tight text-slate-900 md:text-4xl lg:text-5xl">
                        {currentStory.title}
                      </h2>
                      <p className="mt-4 text-base sm:text-lg text-slate-600 line-clamp-4 leading-relaxed">
                        {currentStory.description}
                      </p>
                    </div>

                    <div>
                      {currentStory.date && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 font-semibold">
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
                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                            <line x1="16" x2="16" y1="2" y2="6" />
                            <line x1="8" x2="8" y1="2" y2="6" />
                            <line x1="3" x2="21" y1="10" y2="10" />
                          </svg>
                          <span>{currentStory.date}</span>
                        </div>
                      )}

                      <div className="mt-6 flex gap-4">
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
                      </div>
                    </div>
                  </div>
                  <div className="lg:w-[55%] h-[340px] sm:h-[420px] lg:h-full">
                    {currentStory.imageSrc && !currentStory.imageSrc.includes("/images/") ? (
                      <div className="relative w-full h-full rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={currentStory.imageSrc}
                          alt={currentStory.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-[#1e4bb8] to-[#173490] shadow-xl flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="96"
                            height="96"
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
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-8 flex justify-center gap-2">
              {featuredStories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${index === currentIndex ? 'w-8 bg-[#173490]' : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                  aria-label={`Go to story ${index + 1}`}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* Quick Access Document Portal */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 sm:mt-12"
        >
          <SectionHeader
            title="Quick Access Document Portal"
            subtitle="Browse official USG documents by category"
          />

          <div className="space-y-6">
            {/* Top Row: 4 Cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {topDocumentTypes.map((doc) => (
                <motion.div
                  key={doc.title}
                  variants={itemVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <Link
                    href={doc.href}
                    className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#173490] hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#173490]">
                          {doc.title}
                        </h3>
                        <p className="mt-2 text-sm text-slate-600">
                          {doc.description}
                        </p>
                      </div>
                      <span className="text-2xl font-black text-[#E7C609] shrink-0">
                        {docCounts[doc.type] ?? 0}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Bottom Row: 3 Cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {bottomDocumentTypes.map((doc) => (
                <motion.div
                  key={doc.title}
                  variants={itemVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <Link
                    href={doc.href}
                    className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#173490] hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#173490]">
                          {doc.title}
                        </h3>
                        <p className="mt-2 text-sm text-slate-600">
                          {doc.description}
                        </p>
                      </div>
                      <span className="text-2xl font-black text-[#E7C609] shrink-0">
                        {docCounts[doc.type] ?? 0}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Recent Publications */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20"
        >
          <SectionHeader
            title="Recent Documents"
            subtitle="Latest official documents and releases"
            action={{ label: "View Archive", href: "/documents" }}
          />
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-4"
          >
            {loadingPublications ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 border-4 border-[#173490] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : recentPublications.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No recent publications found</p>
            ) : (
              recentPublications.map((pub) => (
                <motion.div
                  key={pub.id}
                  variants={itemVariants}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <span className="inline-block rounded-full bg-[#173490]/10 px-3 py-1 text-xs font-bold text-[#173490]">
                        {pub.type}
                      </span>
                      <h3 className="mt-3 text-lg font-semibold text-slate-900">
                        {pub.type === "RESOLUTION" && "Resolution No. "}
                        {pub.type === "EXECUTIVE ORDER" && "Executive Order No. "}
                        {pub.type === "ADMINISTRATIVE ORDER" && "Administrative Order No. "}
                        {pub.type === "MEMORANDUM" && "Memorandum No. "}
                        {pub.type === "SPECIAL ORDER" && "Special Order No. "}
                        {pub.type === "ADVISORY" && "Advisory No. "}
                        {pub.type === "FINANCIAL DOCUMENTS" && "Financial Document: "}
                        {pub.tracking_number ? `${pub.tracking_number}: ${pub.title}` : pub.title}
                      </h3>
                    </div>
                    <div className="flex flex-col md:items-end gap-2">
                      <span className="text-sm text-slate-500">
                        {pub.published_at
                          ? new Date(pub.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : new Date(pub.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {pub.file_url ? (
                        <a
                          href={pub.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-[#173490] hover:text-[#E7C609] transition"
                        >
                          View Document →
                        </a>
                      ) : (
                        <Link
                          href={`/documents/${pub.id}`}
                          className="text-xs font-semibold text-[#173490] hover:text-[#E7C609] transition"
                        >
                          View Details →
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </motion.section>

        {/* News & Press Releases */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20"
        >
          <SectionHeader
            title="News & Press Releases"
            subtitle="Latest updates and announcements from USG"
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={newsPage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="grid gap-6 md:grid-cols-3"
            >
              {displayedNewsItems.map((news) => (
                <motion.div
                  key={news.title}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    {news.imageSrc ? (
                      <div className="mb-4 h-64 sm:h-72 md:h-80 rounded-xl overflow-hidden relative border border-slate-100 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={news.imageSrc} alt={news.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="mb-4 h-64 sm:h-72 md:h-80 rounded-xl bg-gradient-to-br from-[#173490] to-[#1e4bb8]" />
                    )}
                    <span className="text-xs font-semibold text-slate-500">
                      {news.date}
                    </span>
                    <h3 className="mt-2 text-lg font-bold text-slate-900">
                      {news.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-3">
                      {news.description}
                    </p>
                  </div>

                  <div className="mt-4">
                    {news.linkHref ? (
                      <a
                        href={news.linkHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-sm font-semibold text-[#173490] transition hover:text-[#E7C609]"
                      >
                        Read Full Article →
                      </a>
                    ) : (
                      <button className="text-sm font-semibold text-[#173490] transition hover:text-[#E7C609]">
                        Read Full Article →
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {totalNewsPages > 1 && (
            <div className="mt-10 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setNewsPage((p) => Math.max(1, p - 1))}
                      disabled={newsPage === 1}
                      className={newsPage === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalNewsPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={page === newsPage}
                        onClick={() => setNewsPage(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setNewsPage((p) => Math.min(totalNewsPages, p + 1))}
                      disabled={newsPage === totalNewsPages}
                      className={newsPage === totalNewsPages ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </motion.section>
      </main>
    </GridShell>
  );
}
