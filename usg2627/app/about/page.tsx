"use client";

import { useState, useEffect } from "react";
import GridShell from "../components/GridShell";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

const initialOrgCharts = [
  {
    id: "org1",
    title: "USG Organizational Structure",
    subtitle: "Overall Student Government Tree Hierarchy & Governance Diagram",
    image: "/org1.png",
    badge: "Main Overall Structure",
  },
  {
    id: "org2",
    title: "The USG President's Cabinet Officials",
    subtitle: "Executive Office & Cabinet Officials Roster",
    image: "/org2.png",
    badge: "Cabinet Officials",
  },
  {
    id: "org3",
    title: "The USG Executive Branch Cabinet Structure",
    subtitle: "Executive Departments & Departmental Crests Hierarchy",
    image: "/org3.png",
    badge: "Executive Departments",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<"org1" | "org2" | "org3">("org1");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [orgCharts, setOrgCharts] = useState(initialOrgCharts);

  useEffect(() => {
    const fetchOrgCharts = async () => {
      try {
        const { data, error } = await supabase.from("org_charts").select("*");
        if (!error && data && data.length > 0) {
          setOrgCharts((prev) =>
            prev.map((item) => {
              const dbRecord = data.find((d: any) => d.chart_key === item.id);
              return dbRecord ? { ...item, image: dbRecord.image_url || item.image } : item;
            })
          );
        }
      } catch (err) {
        console.error("Fetch org_charts error:", err);
      }
    };

    fetchOrgCharts();
  }, []);

  const currentChart = orgCharts.find((c) => c.id === activeTab) || orgCharts[0];

  return (
    <GridShell>
      <div className="bg-slate-50 min-h-screen pb-24">

        {/* HERO HEADER */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden bg-gradient-to-b from-[#173490] via-[#1b3da8] to-[#0f2466] py-20 text-white shadow-xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent"></div>
          
          <div className="relative mx-auto max-w-7xl px-6 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-[#E7C609] backdrop-blur-md border border-white/15">
              Caraga State University • Main Campus
            </span>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              University Student Government
            </h1>
            <p className="mt-3 text-lg sm:text-xl font-medium text-blue-100 max-w-3xl mx-auto">
              USG 2627 — Official Student Governing Body
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <span className="rounded-xl bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white border border-white/20">
                Responsiveness
              </span>
              <span className="rounded-xl bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white border border-white/20">
                Innovation
              </span>
              <span className="rounded-xl bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white border border-white/20">
                Sustainability
              </span>
              <span className="rounded-xl bg-[#E7C609] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#173490] shadow-md">
                Excellence (RISE)
              </span>
            </div>
          </div>
        </motion.section>

        <div className="mx-auto max-w-7xl px-6 -mt-8 relative z-10 space-y-16">

          {/* MISSION & VISION & GOALS SECTION */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid gap-8 lg:grid-cols-3"
          >
            {/* MISSION */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-lg backdrop-blur-md transition hover:shadow-xl"
            >
              <span className="text-xs font-black uppercase tracking-[0.25em] text-[#173490]">
                Our Mission
              </span>
              <h2 className="mt-2 text-2xl font-black text-slate-900">
                Empower & Advocate
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 font-medium">
                To empower and represent the Caraga State University student body through transparent governance, proactive policy advocacy, accountable leadership, and inclusive student services that safeguard student rights and institutional welfare.
              </p>
            </motion.div>

            {/* VISION */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-3xl border border-blue-200/80 bg-gradient-to-br from-white to-blue-50/60 p-8 shadow-lg backdrop-blur-md transition hover:shadow-xl"
            >
              <span className="text-xs font-black uppercase tracking-[0.25em] text-[#173490]">
                Our Vision
              </span>
              <h2 className="mt-2 text-2xl font-black text-slate-900">
                Premier Student Leadership
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 font-medium">
                To serve as a premier student government championing academic freedom, holistic student development, progressive youth leadership, and sustainable community advancement across the Caraga region and beyond.
              </p>
            </motion.div>

            {/* STRATEGIC GOALS SUMMARY */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-lg backdrop-blur-md transition hover:shadow-xl"
            >
              <span className="text-xs font-black uppercase tracking-[0.25em] text-emerald-800">
                Core Goal
              </span>
              <h2 className="mt-2 text-2xl font-black text-slate-900">
                Student-First Governance
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 font-medium">
                Fostering an open, responsive, and innovative legislative & executive ecosystem where every student’s voice is heard, respected, and translated into concrete university policy and developmental programs.
              </p>
            </motion.div>
          </motion.section>

          {/* 4 CORE STRATEGIC OBJECTIVES */}
          <motion.section
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-lg"
          >
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="inline-block rounded-full bg-blue-100 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#173490]">
                Strategic Pillars
              </span>
              <h2 className="mt-3 text-3xl font-black text-slate-900">
                USG 2627 Strategic Goals
              </h2>
              <p className="mt-2 text-sm text-slate-600 font-medium">
                Four foundational pillars guiding all executive actions, legislative bills, and campus student programs.
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-2xl bg-slate-50 p-6 border border-slate-200/70 hover:border-[#173490] transition group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173490] text-white font-bold mb-4 shadow-xs">
                  1
                </div>
                <h3 className="font-bold text-slate-900 text-base">Transparent Governance</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Publishing open budgetary disclosures, legislative resolutions, and executive reports for total campus accountability.
                </p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-2xl bg-slate-50 p-6 border border-slate-200/70 hover:border-[#173490] transition group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173490] text-white font-bold mb-4 shadow-xs">
                  2
                </div>
                <h3 className="font-bold text-slate-900 text-base">Student Rights & Advocacy</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Active representation in university councils, safeguarding student welfare, academic equity, and student rights.
                </p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-2xl bg-slate-50 p-6 border border-slate-200/70 hover:border-[#173490] transition group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173490] text-white font-bold mb-4 shadow-xs">
                  3
                </div>
                <h3 className="font-bold text-slate-900 text-base">Welfare & Innovation</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Launching digital student services, emergency relief funds, mental health initiatives, and athletic/cultural events.
                </p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-2xl bg-slate-50 p-6 border border-slate-200/70 hover:border-[#173490] transition group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173490] text-white font-bold mb-4 shadow-xs">
                  4
                </div>
                <h3 className="font-bold text-slate-900 text-base">Sustainability & Community</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Driving eco-friendly campus projects, community outreach, and leadership development across Caraga Region.
                </p>
              </motion.div>
            </motion.div>
          </motion.section>

          {/* ORGANIZATIONAL STRUCTURE FULL-IMAGE GRAPHICS SECTION */}
          <motion.section
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-xl overflow-hidden"
          >
            {/* Header & Tabs */}
            <div className="mb-8 text-center max-w-3xl mx-auto">
              <span className="inline-block rounded-full bg-[#173490]/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#173490] border border-[#173490]/20 mb-3">
                Official Organizational Charts
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                USG Organizational Structure
              </h2>
              <p className="mt-2 text-sm text-slate-600 font-medium">
                Select from the 3 official high-resolution organizational structure graphics below.
              </p>

              {/* 3 Interactive Structure Selector Tabs */}
              <div className="mt-6 inline-flex flex-wrap justify-center gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200">
                {orgCharts.map((chart) => (
                  <button
                    key={chart.id}
                    onClick={() => setActiveTab(chart.id as any)}
                    className={`rounded-xl px-5 py-2.5 text-xs font-black transition cursor-pointer ${
                      activeTab === chart.id
                        ? "bg-[#173490] text-white shadow-md"
                        : "text-slate-700 hover:bg-white hover:text-[#173490]"
                    }`}
                  >
                    {chart.title}
                  </button>
                ))}
              </div>
            </div>

            {/* FULL-SIZE IMAGE DISPLAY */}
            <div className="relative rounded-3xl border-2 border-slate-200 bg-slate-900 overflow-hidden shadow-2xl group">
              <div className="flex items-center justify-between bg-slate-900 px-6 py-4 border-b border-slate-800 text-white">
                <div>
                  <span className="rounded-md bg-[#E7C609] px-2.5 py-0.5 text-[11px] font-black uppercase text-[#173490] mr-2">
                    {currentChart.badge}
                  </span>
                  <h3 className="inline-block font-bold text-base text-white">{currentChart.title}</h3>
                </div>

                <button
                  onClick={() => setIsFullscreen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition cursor-pointer backdrop-blur-xs border border-white/10"
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
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" x2="14" y1="3" y2="10" />
                    <line x1="3" x2="10" y1="21" y2="14" />
                  </svg>
                  Fullscreen Preview
                </button>
              </div>

              {/* Responsive High-Res Graphic */}
              <div className="p-2 sm:p-4 bg-slate-950 flex items-center justify-center">
                <img
                  src={currentChart.image}
                  alt={currentChart.title}
                  className="w-full h-auto max-h-[850px] object-contain rounded-2xl shadow-lg cursor-pointer"
                  onClick={() => setIsFullscreen(true)}
                />
              </div>
            </div>
          </motion.section>

        </div>

        {/* FULLSCREEN IMAGE MODAL PREVIEW */}
        {isFullscreen && (
          <div
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 sm:p-8 animate-in fade-in duration-200"
            onClick={() => setIsFullscreen(false)}
          >
            <div className="absolute top-6 right-6 flex items-center gap-4 z-50">
              <a
                href={currentChart.image}
                download={currentChart.image.replace("/", "")}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition border border-white/10"
              >
                Download High-Res
              </a>

              <button
                onClick={() => setIsFullscreen(false)}
                className="rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 transition cursor-pointer border border-white/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="t-modal is-open max-w-7xl max-h-[90vh] overflow-auto rounded-2xl border border-white/10 p-2 bg-slate-900 shadow-2xl">
              <img
                src={currentChart.image}
                alt={currentChart.title}
                className="w-full h-auto object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

      </div>
    </GridShell>
  );
}
