"use client";

import { useState, useEffect } from "react";
import GridShell from "../components/GridShell";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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

interface CabinetMember {
  name: string;
  role: string;
  department?: string;
  avatarSrc?: string;
  trunkLine?: string;
  directLine?: string;
  email?: string;
  roomAddress?: string;
  assignedProjects?: number;
  initiativesLed?: number;
  term?: string;
}

interface CabinetDepartment {
  name: string;
  acronym: string;
  description: string;
  logoSrc: string;
  mandate?: string;
  members: CabinetMember[];
}

const initialCabinetDepartments: CabinetDepartment[] = [
  {
    name: "Department of Students' Welfare and Development",
    acronym: "DSWD",
    description: "Student advocacy, welfare programs, student rights protection, and mental health support initiatives.",
    logoSrc: "/dswd.png",
    mandate: "Ensuring student well-being, equal access to support services, and active advocacy for student body rights and welfare.",
    members: [],
  },
  {
    name: "Department of Public Information and Creative Communications",
    acronym: "DPICC",
    description: "Official press releases, institutional branding, graphic designs, and university-wide student publications.",
    logoSrc: "/dpicc.png",
    mandate: "Disseminating official student government notices, maintaining public transparency, and crafting creative publications.",
    members: [],
  },
  {
    name: "Department of Interior, Local Governance and Subordinate Units",
    acronym: "DILG",
    description: "Local councils liaison, student organizations coordination, policy compliance, and governance affairs.",
    logoSrc: "/dilgsu.png",
    mandate: "Bridging the central student government with collegiate local councils and accredited student organizations.",
    members: [],
  },
  {
    name: "Department of Finance and Treasury",
    acronym: "DFT",
    description: "Fiscal allocation, institutional budget tracking, financial disclosures, and official receipts auditing.",
    logoSrc: "/dft.png",
    mandate: "Safeguarding student funds with absolute fiscal integrity, transparent records, and prompt financial disclosures.",
    members: [],
  },
  {
    name: "Department of Environment and Natural Resources",
    acronym: "DENR",
    description: "Eco-sustainability campaigns, green campus programs, clean-up drives, and climate awareness projects.",
    logoSrc: "/denr.png",
    mandate: "Championing environmental sustainability, carbon footprint reduction, and campus-wide eco-friendly practices.",
    members: [],
  },
  {
    name: "Department of Budget and Management",
    acronym: "DBM",
    description: "Budgetary allocations, operational expenditures evaluation, fiscal auditing, and financial transparency reports.",
    logoSrc: "/dbm.png",
    mandate: "Optimizing institutional fund usage, ensuring budgetary transparency, and standardizing procurement processes.",
    members: [],
  },
  {
    name: "Department of Academics, Sports, Culture, Arts and Technology",
    acronym: "DASCAT",
    description: "Scholastic competitions, varsity support, cultural showcases, art exhibitions, and student tech innovations.",
    logoSrc: "/dascat.png",
    mandate: "Fostering well-rounded student excellence through academic support, athletic pride, cultural arts, and digital literacy.",
    members: [],
  },
  {
    name: "Office of the President",
    acronym: "OP",
    description: "Chief executive leadership, strategic institutional initiatives, university administration liaison, and policy vision.",
    logoSrc: "/op.jpg",
    mandate: "Directing overall executive agenda, executing student government enactments, and representing the unified student body.",
    members: [],
  },
  {
    name: "Office of the Vice President",
    acronym: "OVP",
    description: "Internal administrative coordination, cabinet supervision, executive liaison, and special project implementation.",
    logoSrc: "/ovp.png",
    mandate: "Assisting the presidency, overseeing cabinet departments execution, and spearheading priority development programs.",
    members: [],
  },
  {
    name: "Department of the Secretariat",
    acronym: "DS",
    description: "Official documentation, minutes archival, executive correspondence, and records repository management.",
    logoSrc: "/dhsw.png",
    mandate: "Preserving historical records, ensuring accurate documentation of executive actions, and managing official communications.",
    members: [],
  },
  {
    name: "Office of the Student Regent",
    acronym: "OSR",
    description: "Student representation in the University Board of Regents, university-level policy reforms, and student advocacy.",
    logoSrc: "/osr.png",
    mandate: "Carrying the unified student body voice to the highest policy-making governing board of the university.",
    members: [],
  },
];

export default function CabinetPage() {
  const [selectedDept, setSelectedDept] = useState<CabinetDepartment | null>(null);
  const [departments, setDepartments] = useState<CabinetDepartment[]>(initialCabinetDepartments);

  useEffect(() => {
    fetchDynamicMembers();
  }, []);

  const fetchDynamicMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const updated = initialCabinetDepartments.map((dept) => {
          const matchingDbMembers = data
            .filter(
              (m: any) =>
                m.department &&
                m.department.trim().toLowerCase() === dept.name.trim().toLowerCase()
            )
            .map((m: any) => ({
              name: m.name || m.full_name || "USG Member",
              role: m.role || "Officer",
              department: m.department,
              avatarSrc: m.profile_url || "",
              directLine: m.phone_number || "loc. 6000",
              email: m.email || "usg@carsu.edu.ph",
              roomAddress: m.room_address || "Executive Suite",
              assignedProjects: m.assigned_projects || 0,
              initiativesLed: m.initiatives_led || 0,
              term: m.term || "2026-2027",
            }));

          return {
            ...dept,
            members: matchingDbMembers,
          };
        });

        setDepartments(updated);
      }
    } catch (err) {
      console.error("Error fetching dynamic members:", err);
    }
  };

  return (
    <GridShell>
      <main className="mx-auto max-w-6xl px-6 py-20">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-200 pb-8"
        >
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#173490]/20 bg-[#173490]/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#173490]">
              <span className="h-2 w-2 rounded-full bg-[#E7C609]" />
              Executive Branch Directory
            </div>
            <h1 className="text-4xl font-black tracking-[-0.06em] text-slate-900 sm:text-5xl">
              USG Departments
            </h1>
            <p className="mt-4 text-slate-600 max-w-3xl text-base sm:text-lg leading-relaxed">
              Executive secretaries, directors, and departments tasked with implementing USG policies, student welfare programs, and university-wide services.
            </p>
          </div>
        </motion.div>

        {/* Departments Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-40px" }}
          className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {departments.map((dept) => (
            <motion.div
              key={dept.name}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm transition hover:border-[#173490]/40 hover:shadow-xl backdrop-blur-sm"
            >
              <div>
                {/* Centered Top Header: Logo, Acronym Badge, Member Count */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <img
                      src={dept.logoSrc || "/usg.jpg"}
                      alt={`${dept.name} Logo`}
                      onError={(e) => {
                        e.currentTarget.src = "/usg.jpg";
                      }}
                      className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-[#173490]/20 transition-transform duration-300 group-hover:scale-105 mx-auto"
                    />
                  </div>
                  <div className="mt-3 flex flex-col items-center gap-1">
                    <span className="inline-block rounded-full bg-[#173490]/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-[#173490]">
                      {dept.acronym}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {dept.members.length} Appointed Member{dept.members.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>

                {/* Department Name */}
                <h2 className="mt-4 text-xl font-bold text-slate-900 group-hover:text-[#173490] transition leading-snug text-center">
                  {dept.name}
                </h2>

                {/* Summary Description */}
                <p className="mt-3 text-sm leading-relaxed text-slate-600 line-clamp-3 text-center">
                  {dept.description}
                </p>
              </div>

              {/* Bottom Row: See More Action & Avatar Previews */}
              <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between min-h-[44px]">
                <div className="flex -space-x-2 overflow-hidden items-center">
                  {dept.members.length > 0 ? (
                    dept.members.slice(0, 3).map((m, idx) =>
                      m.avatarSrc ? (
                        <img
                          key={idx}
                          src={m.avatarSrc}
                          alt={m.name}
                          className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover shadow-xs"
                        />
                      ) : (
                        <div
                          key={idx}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#173490] text-[10px] font-bold text-white ring-2 ring-white shadow-xs"
                        >
                          {m.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                      )
                    )
                  ) : null}
                </div>

                <button
                  onClick={() => setSelectedDept(dept)}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[#173490] hover:text-[#E7C609] transition cursor-pointer group/btn"
                >
                  <span>See More</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform group-hover/btn:translate-x-1"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Modal: Department Member Profiling */}
        {selectedDept && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 pt-20 sm:pt-24 bg-slate-900/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
            onClick={() => setSelectedDept(null)}
          >
            <div
              className="relative my-auto max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedDept(null)}
                className="absolute right-5 top-5 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer z-10"
                aria-label="Close modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>

              {/* Department Header in Modal */}
              <div className="flex flex-col sm:flex-row items-center gap-5 border-b border-slate-100 pb-6 text-center sm:text-left pr-8">
                <img
                  src={selectedDept.logoSrc || "/usg.jpg"}
                  alt={`${selectedDept.name} Logo`}
                  onError={(e) => {
                    e.currentTarget.src = "/usg.jpg";
                  }}
                  className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover border-4 border-white shadow-lg ring-2 ring-[#173490]/20 flex-shrink-0 mx-auto sm:mx-0"
                />
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="rounded-full bg-[#173490]/10 px-3 py-0.5 text-xs font-black uppercase tracking-wider text-[#173490]">
                      {selectedDept.acronym}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">•</span>
                    <span className="text-xs text-slate-500 font-semibold">
                      {selectedDept.members.length} Appointed Member{selectedDept.members.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <h2 className="mt-1.5 text-2xl sm:text-3xl font-black text-slate-900">
                    {selectedDept.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {selectedDept.description}
                  </p>
                </div>
              </div>

              {/* Department Mandate */}
              {selectedDept.mandate && (
                <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#173490]">
                    Department Mandate
                  </p>
                  <p className="mt-1 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {selectedDept.mandate}
                  </p>
                </div>
              )}

              {/* Department Member Profiling Cards */}
              <div className="mt-6">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
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
                    className="text-[#173490]"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>Appointed Department Officers</span>
                </h3>

                {/* Empty State or Member Profiles Grid */}
                {selectedDept.members.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#173490]/10 text-[#173490]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="18" x2="23" y1="11" y2="11" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-slate-800">No Appointed Members Found</p>
                    <p className="mt-1 text-xs text-slate-500">
                      There are currently no active officers or members assigned to {selectedDept.name} in the directory.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {selectedDept.members.map((member, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#173490]/40 hover:shadow-md transition"
                      >
                        <div>
                          {/* Member Avatar & Role */}
                          <div className="flex items-start gap-3">
                            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full border-2 border-slate-100 bg-gradient-to-br from-[#173490] to-[#1e4bb8] shadow-sm">
                              {member.avatarSrc ? (
                                <img
                                  src={member.avatarSrc}
                                  alt={member.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-base font-bold text-white">
                                  {member.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base font-bold text-slate-900 truncate">
                                {member.name}
                              </h4>
                              <span className="inline-block mt-1 rounded-md bg-[#173490]/10 px-2 py-0.5 text-[11px] font-bold text-[#173490]">
                                {member.role}
                              </span>
                              <p className="mt-1 text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-[#173490] flex-shrink-0"
                                >
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                <span className="truncate">{member.department || `${selectedDept.name} (${selectedDept.acronym})`}</span>
                              </p>
                            </div>
                          </div>

                          {/* Contact & Location */}
                          <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
                            {member.email && (
                              <div className="flex items-center gap-2 truncate">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="13"
                                  height="13"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-[#173490] flex-shrink-0"
                                >
                                  <rect width="20" height="16" x="2" y="4" rx="2" />
                                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                                <span className="truncate">{member.email}</span>
                              </div>
                            )}

                            {member.directLine && (
                              <div className="flex items-center gap-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="13"
                                  height="13"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-[#173490] flex-shrink-0"
                                >
                                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                                <span>Direct: {member.directLine}</span>
                              </div>
                            )}
                          </div>

                          {/* Compact Stats */}
                          <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-2.5 text-center">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Projects
                              </p>
                              <p className="text-sm font-black text-[#173490]">
                                {member.assignedProjects || 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Initiatives
                              </p>
                              <p className="text-sm font-black text-[#173490]">
                                {member.initiativesLed || 0}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Social / Direct Action */}
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-[10px] font-semibold text-slate-400">
                            AY {member.term || "2026-2027"}
                          </span>
                          <a
                            href={`mailto:${member.email || "usg@carsu.edu.ph"}`}
                            className="font-bold text-[#173490] hover:text-[#E7C609] transition flex items-center gap-1"
                          >
                            <span>Contact</span>
                            <span>→</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Close Action in Footer */}
              <div className="mt-8 flex justify-end border-t border-slate-100 pt-4">
                <button
                  onClick={() => setSelectedDept(null)}
                  className="rounded-xl bg-[#173490] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#1e4bb8] cursor-pointer shadow-md"
                >
                  Close Department Profile
                </button>
              </div>

            </div>
          </div>
        )}

      </main>
    </GridShell>
  );
}
