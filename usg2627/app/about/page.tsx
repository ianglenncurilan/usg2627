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
  const [selectedModalChart, setSelectedModalChart] = useState<any | null>(null);
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

          {/* NATURE & JURISDICTION SECTION */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 lg:grid-cols-2"
          >
            {/* NATURE */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-lg transition hover:shadow-xl"
            >
              <span className="text-xs font-black uppercase tracking-[0.25em] text-[#173490]">
                Nature
              </span>
              <h2 className="mt-2 text-2xl font-black text-slate-900">
                Highest Student Governing Body
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 font-medium">
                The USG is the highest student governing body, an autonomous, democratic student institution and union of all students of Caraga State University - Main Campus. It shall be the official and sole representative of the entire student populace.
              </p>
            </motion.div>

            {/* JURISDICTION */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-3xl border border-blue-200/80 bg-gradient-to-br from-white to-blue-50/60 p-8 shadow-lg transition hover:shadow-xl"
            >
              <span className="text-xs font-black uppercase tracking-[0.25em] text-[#173490]">
                Jurisdiction
              </span>
              <h2 className="mt-2 text-2xl font-black text-slate-900">
                Institutional Authority
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 font-medium">
                The USG shall exercise jurisdiction over all students, duly recognized local student governments, and student institutions of the University, pursuant to the provisions of this Constitution and relevant University policies.
              </p>
            </motion.div>
          </motion.section>

          {/* PRINCIPLES SECTION */}
          <motion.section
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-lg"
          >
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="inline-block rounded-full bg-blue-100 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#173490]">
                Foundational Guiding Values
              </span>
              <h2 className="mt-3 text-3xl font-black text-slate-900">
                USG Principles
              </h2>
              <p className="mt-2 text-sm text-slate-600 font-medium">
                Fundamental principles governing student democracy, nonpartisan service, and academic rights.
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="grid gap-6 md:grid-cols-3"
            >
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-2xl bg-slate-50 p-6 border border-slate-200/70 hover:border-[#173490] transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173490] text-white font-bold mb-4 shadow-xs">
                    1
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Democratic Sovereignty</h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                    The USG is an autonomous, democratic student institution and union, in which sovereignty resides in the students, and all student government authority emanates from them. It shall be a government of the students, by the students, and for the students.
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-2xl bg-slate-50 p-6 border border-slate-200/70 hover:border-[#173490] transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173490] text-white font-bold mb-4 shadow-xs">
                    2
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Nonpartisan Student Service</h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                    The primary duty of the USG is to serve the student body, protecting and defending its interests and welfare. The USG shall remain nonpartisan and shall serve all students without regard to political affiliation, beliefs, or organizational alignment.
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-2xl bg-slate-50 p-6 border border-slate-200/70 hover:border-[#173490] transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173490] text-white font-bold mb-4 shadow-xs">
                    3
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Equal Access & Academic Rights</h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                    The USG shall guarantee equal access to opportunities for student development, student welfare, and service. The USG recognizes and upholds students' academic freedom, rights, and responsibilities within the University.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.section>

          {/* PREAMBLE SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-lg transition hover:shadow-xl max-w-3xl mx-auto text-center"
          >
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#173490]">
              Preamble
            </span>
            <h2 className="mt-2 text-xl sm:text-2xl font-black text-slate-900">
              Constitution of the University Student Government
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 font-medium italic">
              "We, the bona fide students of Caraga State University - Main Campus, imploring the aid of Almighty God, to live up with an effective discipline for academic and non-academic excellence, in the development of the youth as future leaders of the nation, believing in need of a well-organized and democratic student government that upholds competence, service, and uprightness that unites the entire studentry of Caraga State University - Main Campus to practice our social responsibilities, protect students’ rights and uphold democracy, defend justice, promote peace and love, under the rule of law, do hereby ordain and promulgate this Constitution."
            </p>
          </motion.div>

          {/* 3 SEPARATE ORGANIZATIONAL STRUCTURE CHARTS SECTIONS */}
          <div className="space-y-12">
            <div className="text-center max-w-3xl mx-auto">
              <span className="inline-block rounded-full bg-[#173490]/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#173490] border border-[#173490]/20 mb-3">
                Official Organizational Charts
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                USG Organizational Structure
              </h2>
              <p className="mt-2 text-sm text-slate-600 font-medium">
                Official high-resolution organizational structure & governance hierarchy diagrams of Caraga State University.
              </p>
            </div>

            {orgCharts.map((chart) => (
              <motion.section
                key={chart.id}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-4xl mx-auto w-full rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl overflow-hidden"
              >
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="rounded-md bg-[#E7C609] px-2.5 py-0.5 text-[11px] font-black uppercase text-[#173490] mr-2">
                      {chart.badge}
                    </span>
                    <h3 className="inline-block font-bold text-xl sm:text-2xl text-slate-900">{chart.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{chart.subtitle}</p>
                  </div>

                  <button
                    onClick={() => setSelectedModalChart(chart)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#173490] px-4 py-2 text-xs font-bold text-white hover:bg-[#1e4bb8] transition cursor-pointer shadow-sm shrink-0"
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

                {/* High-Res Graphic Portrait Container */}
                <div className="relative rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-inner group p-2 flex items-center justify-center">
                  <img
                    src={chart.image}
                    alt={chart.title}
                    className="w-full h-auto max-h-[1050px] object-contain rounded-xl shadow-md cursor-pointer transition hover:scale-[1.005]"
                    onClick={() => setSelectedModalChart(chart)}
                  />
                </div>
              </motion.section>
            ))}
          </div>

        </div>

        {/* FULLSCREEN IMAGE MODAL PREVIEW */}
        {selectedModalChart && (
          <div
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 sm:p-8 animate-in fade-in duration-200"
            onClick={() => setSelectedModalChart(null)}
          >
            <div className="absolute top-6 right-6 flex items-center gap-4 z-50">
              <a
                href={selectedModalChart.image}
                download={selectedModalChart.image.replace("/", "")}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition border border-white/10"
              >
                Download High-Res
              </a>

              <button
                onClick={() => setSelectedModalChart(null)}
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

            <div className="t-modal is-open max-w-4xl max-h-[90vh] overflow-auto rounded-2xl border border-white/10 p-2 bg-slate-900 shadow-2xl">
              <img
                src={selectedModalChart.image}
                alt={selectedModalChart.title}
                className="w-full h-auto max-h-[85vh] object-contain mx-auto"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

      </div>
    </GridShell>
  );
}
