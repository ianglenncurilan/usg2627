"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import GridShell from "./components/GridShell";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

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



  useEffect(() => {
    async function fetchNews() {
      try {
        const { data, error } = await supabase
          .from("news")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching news:", error);
          return;
        }

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
        console.error(err);
      }
    }

    fetchNews();
  }, []);

  useEffect(() => {
    async function fetchDocumentsData() {
      try {
        const { data, error } = await supabase
          .from("documents")
          .select("*")
          .eq("status", "published")
          .order("published_at", { ascending: false });

        if (error) {
          console.error("Error fetching documents:", error);
        } else if (data) {
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
        console.error("Error:", err);
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
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredStories.length);
        setIsTransitioning(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredStories.length]);

  const currentStory = featuredStories && featuredStories.length > 0 && currentIndex < featuredStories.length
    ? featuredStories[currentIndex]
    : null;

  return (
    <GridShell>


      <main className="mx-auto max-w-7xl px-6 py-20">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_6px_20px_rgba(15,23,42,0.04)] backdrop-blur-sm"
          >
            <span className="h-3 w-3 rounded-full bg-[#5ab07d] shadow-[0_0_0_4px_rgba(90,176,125,0.15)]" />
            <span>Official Student Portal</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl text-5xl font-black tracking-[-0.06em] text-slate-900 md:text-7xl"
          >
            University Student Government
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-3xl text-xl leading-8 text-slate-600 md:text-2xl"
          >
            Public service, student accountability, and governance across campus
            leadership, documents, and events.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/about"
              className="rounded-full bg-[#E7C609] px-6 py-3 text-sm font-bold text-[#173490] shadow-sm transition hover:brightness-95 hover:scale-105 active:scale-95"
            >
              Learn More
            </Link>
            <Link
              href="/documents"
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50 hover:scale-105 active:scale-95"
            >
              View Documents
            </Link>
          </motion.div>
        </motion.section>

        {/* Latest Official Publication */}
        {currentStory && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-16 py-12"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
              <div className={`lg:w-[42%] transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
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

                {currentStory.date && (
                  <div className="mt-5 flex items-center gap-2 text-sm text-slate-500 font-semibold">
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
              <div className={`lg:w-[55%] transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                {currentStory.imageSrc && !currentStory.imageSrc.includes("/images/") ? (
                  <div className="relative h-[300px] lg:h-[480px] rounded-3xl overflow-hidden border border-slate-200 shadow-lg bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentStory.imageSrc}
                      alt={currentStory.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative h-[300px] lg:h-[480px] rounded-3xl bg-gradient-to-br from-[#1e4bb8] to-[#173490] shadow-lg flex items-center justify-center">
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
          </motion.section>
        )}

        {/* Quick Access Document Portal */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">
              Quick Access Document Portal
            </h2>
            <p className="mt-2 text-slate-600">
              Browse official USG documents by category
            </p>
          </div>

          <div className="space-y-6">
            {/* Top Row: 4 Cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
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
              viewport={{ once: true, margin: "-40px" }}
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
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20"
        >
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
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
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
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">
              News & Press Releases
            </h2>
            <p className="mt-2 text-slate-600">
              Latest updates and announcements from USG
            </p>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="grid gap-6 md:grid-cols-3"
          >
            {newsItems.map((news) => (
              <motion.div
                key={news.title}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  {news.imageSrc ? (
                    <div className="mb-4 h-40 rounded-xl overflow-hidden relative border border-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={news.imageSrc} alt={news.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="mb-4 h-40 rounded-xl bg-gradient-to-br from-[#173490] to-[#1e4bb8]" />
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
        </motion.section>
      </main>
    </GridShell>
  );
}
