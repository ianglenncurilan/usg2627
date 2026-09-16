"use client";

import { useState, useEffect } from "react";
import GridShell from "../components/GridShell";
import ProfileCard from "../components/ProfileCard";
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
import ExpandableSearchBar from "@/components/ui/expandable-search-bar";

const seedMembers = [
  {
    id: "seed-1",
    name: "Peter Gatchalian",
    role: "USG Senator (Senate President)",
    department: "Department of Students' Welfare and Development",
    avatarSrc: "/usg.jpg",
    directLine: "0917 552 6602",
    email: "peter.gatchalian@carsu.edu.ph",
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
    id: "seed-2",
    name: "Cindy C. Sotto",
    role: "USG Senator (President Pro Tempore)",
    department: "Department of Finance and Treasury",
    avatarSrc: "/usg.jpg",
    directLine: "0917 552 6603",
    email: "cindy.sotto@carsu.edu.ph",
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
    id: "seed-3",
    name: "Fuji K. Queroda",
    role: "USG Senator (Majority Floor Leader)",
    department: "Department of Students' Welfare and Development",
    avatarSrc: "/usg.jpg",
    directLine: "0917 552 6607",
    email: "fuji.queroda@carsu.edu.ph",
    roomAddress: "Room 507, Legislative Building",
    filedBills: [
      {
        number: "Senate Bill No. 2627-023",
        title: "AN ACT EXPANDING CAMPUS WIRELESS CONNECTIVITY AND DIGITAL INFRASTRUCTURE IN ALL ACADEMIC BLOCKS",
      },
    ],
  },
  {
    id: "seed-4",
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
    id: "seed-5",
    name: "Patricia Mae Alcantara",
    role: "USG Senator (Student Rights Chair)",
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
    id: "seed-6",
    name: "Maria Imelda Josefa",
    role: "USG Senator (Secretariat Affairs)",
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
    id: "seed-7",
    name: "Christian James Macalolot",
    role: "USG Senator",
    department: "Department of Environment and Natural Resources",
    avatarSrc: "/usg.jpg",
    directLine: "0910 468 7215",
    email: "christian.macalolot@carsu.edu.ph",
    roomAddress: "Room 510, Legislative Building",
    filedBills: [
      {
        number: "Senate Bill No. 2627-026",
        title: "AN ACT ESTABLISHING CAMPUS ECOLOGICAL WASTE MANAGEMENT AND GREEN INITIATIVES",
      },
    ],
  },
  {
    id: "seed-8",
    name: "Steffano Mari P. Potenciano",
    role: "USG Senator (Staff Director)",
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
  {
    id: "seed-9",
    name: "Rafael P. Santos",
    role: "USG Senator (Rules & Ethics Chair)",
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
    id: "seed-10",
    name: "Joshua Villanueva",
    role: "USG Senator (Minority Floor Leader)",
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

const getLastName = (fullName: string = ""): string => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return "";
  let last = parts[parts.length - 1];
  if (/^(jr\.?|sr\.?|ii|iii|iv|v)$/i.test(last) && parts.length > 1) {
    last = parts[parts.length - 2];
  }
  return last.toLowerCase();
};

const getLegislativeRank = (member: any): number => {
  const roleLower = (member.role || "").toLowerCase().trim();
  const nameLower = (member.name || "").toLowerCase().trim();

  // Senate President = Peter
  if ((roleLower.includes("senate president") && !roleLower.includes("pro temp")) || nameLower.includes("peter")) {
    return 1;
  }
  // Pro Tempore = Cindy
  if (roleLower.includes("pro temp") || nameLower.includes("cindy")) {
    return 2;
  }
  // Majority Leader = Fuji
  if (roleLower.includes("majority") || nameLower.includes("fuji")) {
    return 3;
  }

  // All other Legislative Members
  return 4;
};

const getLegislativeSectionLabel = (member: any): string => {
  const roleLower = (member.role || "").toLowerCase().trim();
  const nameLower = (member.name || "").toLowerCase().trim();

  if ((roleLower.includes("senate president") && !roleLower.includes("pro temp")) || nameLower.includes("peter")) {
    return "Senate President";
  }
  if (roleLower.includes("pro temp") || nameLower.includes("cindy")) {
    return "Pro Tempore";
  }
  if (roleLower.includes("majority") || nameLower.includes("fuji")) {
    return "Majority Leader";
  }

  return "Legislative Member";
};

export default function LegislativePage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const membersPerPage = 10;

  useEffect(() => {
    fetchMembers();
  }, []);

  // Reset to page 1 whenever search query changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const fetchMembers = async () => {
    try {
      const data = await fetchWithCache("legislative_members", async () => {
        const { data, error } = await supabase
          .from("members")
          .select("id, name, full_name, role, role_badge, department, profile_url, phone_number, email, room_address, facebook_url, filed_bills, created_at")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
      });

      if (!data || data.length === 0) {
        setMembers(seedMembers);
      } else {
        const mapped = data.map((m: any) => ({
          name: m.name || m.full_name || "USG Member",
          role: m.role,
          roleBadge: m.role_badge || m.role || undefined,
          department: m.department,
          avatarSrc: m.profile_url || "/usg.jpg",
          directLine: m.phone_number || "0917 552 6601",
          email: m.email || "usg@carsu.edu.ph",
          roomAddress: m.room_address || "Room 502, Legislative Building",
          facebookUrl: m.facebook_url || "#",
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

  const isSenatorRole = (role: string = "") => {
    const roleLower = (role || "").toLowerCase().trim();
    if (!roleLower) return false;

    // Exclude non-senator roles explicitly
    if (
      roleLower.includes("comelec") ||
      roleLower.includes("coa") ||
      roleLower.includes("senate secretary") ||
      roleLower.includes("house secretary") ||
      roleLower.includes("administrative staff") ||
      roleLower.includes("governor") ||
      roleLower === "usg president" ||
      roleLower === "president" ||
      roleLower === "usg vice president" ||
      roleLower === "vice president" ||
      roleLower === "usg executive secretary" ||
      roleLower === "executive secretary" ||
      roleLower === "usg treasurer" ||
      roleLower === "treasurer" ||
      roleLower === "usg auditor" ||
      roleLower === "auditor" ||
      roleLower === "usg adviser" ||
      roleLower === "adviser"
    ) {
      return false;
    }

    // Must contain "senator"
    return roleLower.includes("senator");
  };

  const filteredMembers = members
    .filter((member) => {
      // Include only Senators & Senate leadership on Legislative page
      if (!isSenatorRole(member.role)) return false;

      const matchesSearch =
        !searchQuery.trim() ||
        member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    })
    .sort((a, b) => {
      const rankA = getLegislativeRank(a);
      const rankB = getLegislativeRank(b);
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      
      // Sort rank 4 Legislative Members alphabetically by Last Name
      const lastNameA = getLastName(a.name || "");
      const lastNameB = getLastName(b.name || "");
      if (lastNameA !== lastNameB) {
        return lastNameA.localeCompare(lastNameB);
      }
      return (a.name || "").localeCompare(b.name || "");
    });

  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);
  const displayedMembers = filteredMembers.slice(
    (page - 1) * membersPerPage,
    page * membersPerPage
  );

  const handleClearFilters = () => {
    setSearchQuery("");
  };

  return (
    <GridShell>
      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="border-b border-slate-200 pb-6"
        >
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
        </motion.div>

        {/* Results Counter & Search */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 font-medium min-h-[40px]">
          <span>
            Showing {filteredMembers.length > 0 ? (page - 1) * membersPerPage + 1 : 0} -{" "}
            {Math.min(page * membersPerPage, filteredMembers.length)} of {filteredMembers.length} member
            {filteredMembers.length === 1 ? "" : "s"}
          </span>

          <div className="flex justify-end">
            <ExpandableSearchBar
              expandDirection="left"
              width={240}
              placeholder="Search senator..."
              value={searchQuery}
              onSearch={(q) => setSearchQuery(q)}
            />
          </div>
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
              We couldn't find any legislative members matching your search criteria. Try adjusting your search query.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#173490] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1e4bb8] cursor-pointer shadow-sm"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${page}-${searchQuery}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mt-6 grid gap-6 grid-cols-1 lg:grid-cols-2"
              >
                {displayedMembers.map((member, index) => {
                  const label = member.roleBadge || getLegislativeSectionLabel(member);
                  return (
                    <div key={member.id || index}>
                      <ProfileCard {...member} roleBadge={member.roleBadge} sectionLabel={label} />
                    </div>
                  );
                })}
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
