"use client";

import { useState, useEffect } from "react";
import GridShell from "../components/GridShell";
import ProfileCard from "../components/ProfileCard";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const seedMembers = [
  {
    id: "seed-1",
    name: "Cresencio U. Ablan",
    role: "USG Senator",
    department: "Department of Public Information and Creative Communications",
    avatarSrc: "/usg.jpg",
    directLine: "0917 552 6601",
    email: "cresencio.ablan@carsu.edu.ph",
    roomAddress: "Room 502, Legislative Building",
    filedBills: [
      {
        number: "Senate Bill No. 2627-021",
        title: "AN ACT ESTABLISHING COLLEGE-BASED MEDICAL RESPONSE TEAMS IN EACH COLLEGE OF CARAGA STATE UNIVERSITY – MAIN CAMPUS",
      },
      {
        number: "Senate Bill No. 2627-022",
        title: "AN ACT INSTITUTIONALIZING A SEMESTRAL MENTAL HEALTH AND WELLNESS TRIVIA CHALLENGE FOR STUDENTS OF CARAGA STATE UNIVERSITY – MAIN CAMPUS",
      },
    ],
  },
  {
    id: "seed-2",
    name: "Win Gatchalian",
    role: "Legislative President",
    department: "Department of Students' Welfare and Development",
    avatarSrc: "/usg.jpg",
    directLine: "0917 552 6602",
    email: "win.gatchalian@carsu.edu.ph",
    roomAddress: "Room 502, Legislative Building",
    filedBills: [
      {
        number: "Senate Bill No. 2627-015",
        title: "AN ACT MODERNIZING THE UNIVERSITY STUDENT GOVERNMENT POLICY ENACTMENT PROCEDURE AND DIGITAL RESOLUTION REGISTRY",
      },
      {
        number: "Senate Bill No. 2627-018",
        title: "AN ACT PROVIDING ANNUAL INFRASTRUCTURE ACCESSIBILITY APPROPRIATIONS FOR PERSONS WITH DISABILITIES IN ALL CAMPUS BUILDINGS",
      },
    ],
  },
  {
    id: "seed-3",
    name: "Vicente C. Sotto III",
    role: "Legislative President Pro Tempore",
    department: "Department of Finance and Treasury",
    avatarSrc: "/usg.jpg",
    directLine: "0917 552 6603",
    email: "vicente.sotto@carsu.edu.ph",
    roomAddress: "Room 503, Legislative Building",
    filedBills: [
      {
        number: "Senate Bill No. 2627-011",
        title: "AN ACT MANDATING FISCAL ACCOUNTABILITY DISCLOSURES AND MONTHLY LIQUIDATION REPORTS FOR ALL RECOGNIZED STUDENT ORGANIZATIONS",
      },
      {
        number: "Senate Bill No. 2627-014",
        title: "AN ACT ESTABLISHING SUBSIDY ALLOCATION FUNDING FOR ANNUAL COLLEGIATE ATHLETIC AND CULTURAL REPRESENTATION",
      },
    ],
  },
  {
    id: "seed-4",
    name: "Maria Imelda Josefa",
    role: "Legislative Secretary General",
    department: "Department of the Secretariat",
    avatarSrc: "/usg.jpg",
    directLine: "0917 552 6604",
    email: "maria.josefa@carsu.edu.ph",
    roomAddress: "Room 504, Legislative Building",
    filedBills: [
      {
        number: "Senate Bill No. 2627-008",
        title: "AN ACT CREATING A UNIFIED ARCHIVAL RECORDING SYSTEM FOR ALL PASSED RESOLUTIONS AND EXECUTIVE DIRECTIVES",
      },
    ],
  },
  {
    id: "seed-5",
    name: "Rafael P. Santos",
    role: "Chair, Committee on Rules & Ethics",
    department: "Department of Interior, Local Governance and Subordinate Units",
    avatarSrc: "/usg.jpg",
    directLine: "0917 552 6605",
    email: "rafael.santos@carsu.edu.ph",
    roomAddress: "Room 505, Legislative Building",
    filedBills: [
      {
        number: "Senate Bill No. 2627-005",
        title: "AN ACT ADOPTING THE COMPREHENSIVE CODE OF ETHICAL CONDUCT AND RESPONSIBILITY FOR ELECTED AND APPOINTED STUDENT OFFICIALS",
      },
    ],
  },
  {
    id: "seed-6",
    name: "Patricia Mae Alcantara",
    role: "Chair, Committee on Student Rights",
    department: "Department of Academics, Sports, Culture, Arts and Technology",
    avatarSrc: "/usg.jpg",
    directLine: "0917 552 6606",
    email: "patricia.alcantara@carsu.edu.ph",
    roomAddress: "Room 506, Legislative Building",
    filedBills: [
      {
        number: "Senate Bill No. 2627-019",
        title: "AN ACT ENACTING THE STUDENT ACADEMIC FREEDOM CHARTER AND DATA PRIVACY PROTECTION IN DIGITAL LEARNING PLATFORMS",
      },
    ],
  },
  {
    id: "seed-7",
    name: "Jouard Karl Queroda",
    role: "USG Senate Majority Floor Leader",
    department: "Department of Students' Welfare and Development",
    avatarSrc: "/usg.jpg",
    directLine: "0917 552 6607",
    email: "jouard.queroda@carsu.edu.ph",
    roomAddress: "Room 507, Legislative Building",
    filedBills: [
      {
        number: "Senate Bill No. 2627-023",
        title: "AN ACT EXPANDING CAMPUS WIRELESS CONNECTIVITY AND DIGITAL INFRASTRUCTURE IN ALL ACADEMIC BLOCKS",
      },
    ],
  },
  {
    id: "seed-8",
    name: "Joshua Villanueva",
    role: "USG Senate Minority Floor Leader",
    department: "Department of Students' Welfare and Development",
    avatarSrc: "/usg.jpg",
    directLine: "0917 552 6608",
    email: "joshua.villanueva@carsu.edu.ph",
    roomAddress: "Room 508, Legislative Building",
    filedBills: [
      {
        number: "Senate Bill No. 2627-024",
        title: "AN ACT MANDATING TRANSPARENT ELECTION CODE REFORMS FOR THE STUDENT GOVERNMENT",
      },
    ],
  },
  {
    id: "seed-9",
    name: "Steffano Mari P. Potenciano",
    role: "Legislative Staff Director",
    department: "Department of Students' Welfare and Development",
    avatarSrc: "/usg.jpg",
    directLine: "0917 552 6609",
    email: "steffano.potenciano@carsu.edu.ph",
    roomAddress: "Room 509, Legislative Building",
    filedBills: [
      {
        number: "Senate Bill No. 2627-025",
        title: "AN ACT INSTITUTIONALIZING ANNUAL STUDENT LEADERSHIP TRAINING AND LEGISLATIVE SKILLS WORKSHOPS",
      },
    ],
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
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export default function LegislativePage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  const membersPerPage = 9;

  useEffect(() => {
    fetchMembers();
  }, []);

  // Reset to page 1 whenever filter or search query changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedDepartment]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        setMembers(seedMembers);
      } else {
        const mapped = data.map((m: any) => ({
          name: m.name || m.full_name || "USG Member",
          role: m.role,
          department: m.department,
          avatarSrc: m.profile_url || "/usg.jpg",
          directLine: m.phone_number || "0917 552 6601",
          email: m.email || "usg@carsu.edu.ph",
          roomAddress: m.room_address || "Room 502, Legislative Building",
          filedBills: m.filed_bills || [],
        }));
        setMembers(mapped);
      }
    } catch (err) {
      console.error(err);
      setMembers(seedMembers);
    } finally {
      setLoading(false);
    }
  };

  const departments = Array.from(
    new Set(members.map((m) => m.department).filter(Boolean))
  );

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      !searchQuery.trim() ||
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      selectedDepartment === "ALL" || member.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);
  const displayedMembers = filteredMembers.slice(
    (page - 1) * membersPerPage,
    page * membersPerPage
  );

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedDepartment("ALL");
  };

  return (
    <GridShell>
      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-200 pb-8"
        >
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#173490]/20 bg-[#173490]/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#173490]">
              <span className="h-2 w-2 rounded-full bg-[#E7C609]" />
              Official Directory
            </div>
            <h1 className="text-4xl font-black tracking-[-0.06em] text-slate-900 sm:text-5xl">
              USG Legislative Branch
            </h1>
            <p className="mt-4 text-slate-600 max-w-3xl text-base sm:text-lg leading-relaxed">
              The legislative body responsible for enacting resolutions, policy measures, budget allocations, and student ordinances.
            </p>
          </div>
        </motion.div>

        {/* Search & Filter Controls */}
        <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[280px]">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name, role, department, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#173490] focus:border-transparent transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
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
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px]">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full appearance-none bg-white border border-slate-200 py-2.5 pl-3.5 pr-9 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#173490] focus:border-transparent transition cursor-pointer"
              >
                <option value="ALL">All Departments</option>
                {departments.map((dept: any) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
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
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>

            {(searchQuery || selectedDepartment !== "ALL") && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold text-[#173490] bg-[#173490]/10 hover:bg-[#173490] hover:text-white rounded-xl transition cursor-pointer"
              >
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>
            Showing {filteredMembers.length > 0 ? (page - 1) * membersPerPage + 1 : 0} -{" "}
            {Math.min(page * membersPerPage, filteredMembers.length)} of {filteredMembers.length} member
            {filteredMembers.length === 1 ? "" : "s"}
          </span>
          {members.length > 0 && (
            <span className="hidden sm:inline">
              Total directory: {members.length} member{members.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 border-4 border-[#173490] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#173490]/10 text-[#173490]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
                <path d="M8 11h6" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">No members found</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              We couldn't find any legislative members matching your search criteria. Try adjusting your search query or department filter.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#173490] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1e4bb8] cursor-pointer shadow-sm"
            >
              Clear Search & Filters
            </button>
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${page}-${searchQuery}-${selectedDepartment}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {displayedMembers.map((member, index) => (
                  <div key={member.id || index}>
                    <ProfileCard {...member} />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className={page === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          isActive={p === page}
                          onClick={() => setPage(p)}
                          className="cursor-pointer"
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className={page === totalPages ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </main>
    </GridShell>
  );
}
