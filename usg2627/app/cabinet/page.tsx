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

// Executive Seed Members for fallback
const seedExecutiveMembers = [
  {
    id: "exec-1",
    name: "Rene Antonio S. Moreno",
    role: "USG President",
    department: "Office of the President",
    avatarSrc: "/usg.jpg",
    directLine: "0917 552 6001",
    email: "rene.moreno@carsu.edu.ph",
    roomAddress: "Room 501, Executive Building",
    filedBills: [
      {
        number: "Executive Directives No. 2026-001",
        title: "DIRECTING THE COMPREHENSIVE DIGITALIZATION OF STUDENT GOVERNMENT SERVICES AND TRANSPARENCY PORTAL",
      },
    ],
  },
  {
    id: "exec-2",
    name: "Kyla Marie L. Santos",
    role: "USG Vice President",
    department: "Office of the Vice President",
    avatarSrc: "/ovp.png",
    directLine: "0917 552 6002",
    email: "kyla.santos@carsu.edu.ph",
    roomAddress: "Room 502, Executive Building",
    filedBills: [
      {
        number: "Executive Order No. 2026-002",
        title: "ESTABLISHING THE ANNUAL STUDENT LEADERSHIP ACADEMY AND CAMPUS INITIATIVE INCENTIVES",
      },
    ],
  },
  {
    id: "exec-3",
    name: "Joshua Emanuel V. Cruz",
    role: "USG Executive Secretary",
    department: "Department of the Secretariat",
    avatarSrc: "/dhsw.png",
    directLine: "0917 552 6003",
    email: "joshua.cruz@carsu.edu.ph",
    roomAddress: "Room 503, Executive Building",
    filedBills: [
      {
        number: "Directive No. 2026-003",
        title: "STANDARDIZING EXECUTIVE COMMUNICATIONS, RECORDS ARCHIVING, AND PUBLIC NOTICES",
      },
    ],
  },
  {
    id: "exec-4",
    name: "Samantha Mae R. Alonzo",
    role: "USG Treasurer",
    department: "Department of Finance and Treasury",
    avatarSrc: "/dft.png",
    directLine: "0917 552 6004",
    email: "samantha.alonzo@carsu.edu.ph",
    roomAddress: "Room 504, Executive Building",
    filedBills: [
      {
        number: "Financial Directive No. 2026-001",
        title: "IMPLEMENTING REAL-TIME LIQUIDATION AUDITS AND OPEN BUDGET TRANSPARENCY DASHBOARDS",
      },
    ],
  },
  {
    id: "exec-5",
    name: "Derrick Vance G. Ramos",
    role: "USG Auditor",
    department: "Department of Budget and Management",
    avatarSrc: "/dbm.png",
    directLine: "0917 552 6005",
    email: "derrick.ramos@carsu.edu.ph",
    roomAddress: "Room 505, Executive Building",
    filedBills: [
      {
        number: "Audit Directive No. 2026-002",
        title: "MANDATING FISCAL INTEGRITY AND QUARTERLY EXPENDITURE AUDITS FOR ALL USG DEPARTMENTS",
      },
    ],
  },
  {
    id: "exec-6",
    name: "Janine Erika C. Dela Cruz",
    role: "CAALSG Governor",
    department: "Department of Interior, Local Governance and Subordinate Units",
    avatarSrc: "/dilgsu.png",
    directLine: "0917 552 6007",
    email: "janine.delacruz@carsu.edu.ph",
    roomAddress: "Room 101, Agriculture Building",
    filedBills: [
      {
        number: "Local Resolution No. 2026-001",
        title: "ESTABLISHING COLLEGE AGRI-INNOVATION GRANTS AND SUSTAINABILITY LABS",
      },
    ],
  },
  {
    id: "exec-7",
    name: "Marcus Aurelius T. Lim",
    role: "CCISLSG Governor",
    department: "Department of Academics, Sports, Culture, Arts and Technology",
    avatarSrc: "/dascat.png",
    directLine: "0917 552 6008",
    email: "marcus.lim@carsu.edu.ph",
    roomAddress: "Room 202, CCIS Building",
    filedBills: [
      {
        number: "Local Resolution No. 2026-002",
        title: "EXPANDING STUDENT HACKATHONS AND DIGITAL INFRASTRUCTURE IN CCIS LABORATORIES",
      },
    ],
  },
  {
    id: "exec-8",
    name: "Alyssa Nicole B. Garcia",
    role: "CEdLSG Governor",
    department: "Department of Students' Welfare and Development",
    avatarSrc: "/dswd.png",
    directLine: "0917 552 6009",
    email: "alyssa.garcia@carsu.edu.ph",
    roomAddress: "Room 303, CEd Building",
    filedBills: [
      {
        number: "Local Resolution No. 2026-003",
        title: "PROVIDING MENTORSHIP AND TEACHING ASSISTANTSHIP SUBSIDIES FOR EDUCATION MAJORS",
      },
    ],
  },
  {
    id: "exec-9",
    name: "Gabriel Ryan M. Torralba",
    role: "CEGSLSG Governor",
    department: "Department of Environment and Natural Resources",
    avatarSrc: "/denr.png",
    directLine: "0917 552 6010",
    email: "gabriel.torralba@carsu.edu.ph",
    roomAddress: "Room 404, CEGS Building",
    filedBills: [
      {
        number: "Local Resolution No. 2026-004",
        title: "PROMOTING GREEN CAMPUS ENGINEERING AND ZERO-WASTE RECYCLING STATIONS",
      },
    ],
  },
  {
    id: "exec-10",
    name: "Sofia Isabela N. Valenzuela",
    role: "CFESLSG Governor",
    department: "Department of Environment and Natural Resources",
    avatarSrc: "/denr.png",
    directLine: "0917 552 6011",
    email: "sofia.valenzuela@carsu.edu.ph",
    roomAddress: "Room 105, CFES Building",
    filedBills: [
      {
        number: "Local Resolution No. 2026-005",
        title: "ADVANCING FORESTRY CONSERVATION AND ECO-TOURISM ADVOCACY CAMPAIGNS",
      },
    ],
  },
  {
    id: "exec-11",
    name: "Tristan Dominic P. Mercado",
    role: "CHaSSLSG Governor",
    department: "Department of Public Information and Creative Communications",
    avatarSrc: "/dpicc.png",
    directLine: "0917 552 6012",
    email: "tristan.mercado@carsu.edu.ph",
    roomAddress: "Room 208, CHaSS Building",
    filedBills: [
      {
        number: "Local Resolution No. 2026-006",
        title: "PROMOTING HUMANITIES CULTURAL FELLOWSHIPS AND STUDENT ARTS EXPOSITIONS",
      },
    ],
  },
  {
    id: "exec-12",
    name: "Chloe Annalise R. Mendoza",
    role: "CMNSLSG Governor",
    department: "Department of Academics, Sports, Culture, Arts and Technology",
    avatarSrc: "/dascat.png",
    directLine: "0917 552 6013",
    email: "chloe.mendoza@carsu.edu.ph",
    roomAddress: "Room 304, CMNS Building",
    filedBills: [
      {
        number: "Local Resolution No. 2026-007",
        title: "ESTABLISHING NATURAL SCIENCE RESEARCH GRANTS AND INTER-COLLEGIATE SCIENCE QUIZ BEES",
      },
    ],
  },
];

// Cabinet Official Seed Members for fallback
const seedCabinetOfficialMembers = [
  {
    id: "cab-1",
    name: "Patricia Claire V. Santos",
    role: "USG Cabinet Secretary",
    department: "Department of the Secretariat",
    avatarSrc: "/dhsw.png",
    directLine: "0917 552 6101",
    email: "patricia.santos@carsu.edu.ph",
    roomAddress: "Room 506, Executive Building",
    filedBills: [
      {
        number: "Cabinet Resolution No. 2026-001",
        title: "SYNCHRONIZING INTER-DEPARTMENTAL REPORTING AND SEMESTRAL CABINET SUMMITS",
      },
    ],
  },
  {
    id: "cab-2",
    name: "Ethan Miguel D. Torres",
    role: "USG Chief of Staff",
    department: "Office of the President",
    avatarSrc: "/usg.jpg",
    directLine: "0917 552 6102",
    email: "ethan.torres@carsu.edu.ph",
    roomAddress: "Room 501, Executive Building",
    filedBills: [
      {
        number: "Executive Order No. 2026-005",
        title: "ESTABLISHING EXECUTIVE ADVISORY PANELS AND STRATEGIC PROJECT MANAGEMENT PROTOCOLS",
      },
    ],
  },
  {
    id: "cab-3",
    name: "Beatriz Anne L. Reyes",
    role: "USG Secretary for Records and Archives",
    department: "Department of the Secretariat",
    avatarSrc: "/dhsw.png",
    directLine: "0917 552 6103",
    email: "beatriz.reyes@carsu.edu.ph",
    roomAddress: "Room 506, Executive Building",
    filedBills: [
      {
        number: "Cabinet Directive No. 2026-002",
        title: "DIGITAL ARCHIVING AND OPEN-ACCESS REPOSITORY FOR ALL EXECUTIVE INSTRUMENTS",
      },
    ],
  },
  {
    id: "cab-4",
    name: "Jayson Mark B. Mendoza",
    role: "USG DBM Secretary",
    department: "Department of Budget and Management",
    avatarSrc: "/dbm.png",
    directLine: "0917 552 6104",
    email: "jayson.mendoza@carsu.edu.ph",
    roomAddress: "Room 505, Executive Building",
    filedBills: [
      {
        number: "Budget Policy No. 2026-001",
        title: "MANDATING FISCAL TRANSPARENCY & EXPEDITED ALLOCATION REVIEW FOR STUDENT PROJECTS",
      },
    ],
  },
  {
    id: "cab-5",
    name: "Clarissa Mae O. Fernandez",
    role: "USG DFT Secretary",
    department: "Department of Finance and Treasury",
    avatarSrc: "/dft.png",
    directLine: "0917 552 6105",
    email: "clarissa.fernandez@carsu.edu.ph",
    roomAddress: "Room 504, Executive Building",
    filedBills: [
      {
        number: "Treasury Directive No. 2026-003",
        title: "DIGITAL DISBURSEMENT MONITORING SYSTEM FOR ACCREDITED STUDENT ORGANIZATIONS",
      },
    ],
  },
  {
    id: "cab-6",
    name: "Liam Alexander P. Castillo",
    role: "USG DSWD Secretary",
    department: "Department of Students' Welfare and Development",
    avatarSrc: "/dswd.png",
    directLine: "0917 552 6106",
    email: "liam.castillo@carsu.edu.ph",
    roomAddress: "Room 303, Student Center",
    filedBills: [
      {
        number: "Welfare Directive No. 2026-001",
        title: "CAMPUS-WIDE MENTAL HEALTH FIRST AID STATIONS AND WELLNESS HELP DESKS",
      },
    ],
  },
  {
    id: "cab-7",
    name: "Hannah Sophia G. Villanueva",
    role: "USG DILGSU Secretary",
    department: "Department of Interior, Local Governance and Subordinate Units",
    avatarSrc: "/dilgsu.png",
    directLine: "0917 552 6107",
    email: "hannah.villanueva@carsu.edu.ph",
    roomAddress: "Room 201, Governance Wing",
    filedBills: [
      {
        number: "Local Governance Directive No. 2026-004",
        title: "INTER-COLLEGIATE LOCAL COUNCIL COLLABORATION AND ACCREDITATION FRAMEWORK",
      },
    ],
  },
  {
    id: "cab-8",
    name: "Dominic Javier R. Aquino",
    role: "USG DASCAT Secretary",
    department: "Department of Academics, Sports, Culture, Arts and Technology",
    avatarSrc: "/dascat.png",
    directLine: "0917 552 6108",
    email: "dominic.aquino@carsu.edu.ph",
    roomAddress: "Room 102, Sports & Culture Hub",
    filedBills: [
      {
        number: "DASCAT Directive No. 2026-002",
        title: "ANNUAL UNIVERSITY SPORTS FESTIVAL AND INNOVATION HACKATHON GUIDELINES",
      },
    ],
  },
];

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
    name: "Office of the Student Regent",
    acronym: "OSR",
    description: "Student representation in the University Board of Regents, university-level policy reforms, and student advocacy.",
    logoSrc: "/osr.png",
    mandate: "Carrying the unified student body voice to the highest policy-making governing board of the university.",
    members: [],
  },
  {
    name: "Office of the President",
    acronym: "OP",
    description: "Chief executive leadership, strategic institutional initiatives, university administration liaison, and policy vision.",
    logoSrc: "/usg.jpg",
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
];

const ROLE_PRIORITY_ORDER: string[] = [
  "csu president",
  "csu vpsas",
  "osld director",
  "usg executive",
  "executive officer",
  "usg adviser",
  "adviser",
  "usg president",
  "president",
  "usg vice president",
  "vice president",
  "usg executive secretary",
  "executive secretary",
  "usg treasurer",
  "treasurer",
  "usg auditor",
  "auditor",
  "caalsg governor",
  "ccislsg governor",
  "cedlsg governor",
  "cegslsg governor",
  "cfeslsg governor",
  "chasslsg governor",
  "cmnslsg governor",
  "governor",
];

const CABINET_ROLE_PRIORITY_ORDER: string[] = [
  "usg cabinet secretary",
  "cabinet secretary",
  "usg chief of staff",
  "chief of staff",
  "usg secretary for records and archives",
  "secretary for records and archives",
  "usg dbm secretary",
  "usg dft secretary",
  "usg dswd secretary",
  "usg dilgsu secretary",
  "usg dascat secretary",
  "usg denr secretary",
  "usg dhws secretary",
  "usg dpicc secretary",
  "usg undersecretary",
  "undersecretary",
  "usg executive assistant",
  "executive assistant",
  "usg senate secretary",
  "usg house secretary",
  "usg administrative staff",
  "usg coa chief commissioner",
  "usg comelec chairperson",
];

const isExecutiveRole = (role: string = "") => {
  const roleLower = (role || "").toLowerCase().trim();
  if (!roleLower) return false;

  return (
    roleLower.includes("csu president") ||
    roleLower.includes("csu vpsas") ||
    roleLower.includes("osld director") ||
    roleLower.includes("usg executive") ||
    roleLower.includes("executive officer") ||
    roleLower === "usg adviser" ||
    roleLower === "adviser" ||
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
    roleLower.includes("governor")
  );
};

const isCabinetOfficialRole = (role: string = "") => {
  const roleLower = (role || "").toLowerCase().trim();
  if (!roleLower) return false;

  if (isExecutiveRole(roleLower) || roleLower.includes("senator")) return false;

  for (const key of CABINET_ROLE_PRIORITY_ORDER) {
    if (roleLower === key || roleLower.includes(key)) {
      return true;
    }
  }

  return (
    roleLower.includes("cabinet secretary") ||
    roleLower.includes("chief of staff") ||
    roleLower.includes("secretary") ||
    roleLower.includes("undersecretary") ||
    roleLower.includes("assistant") ||
    roleLower.includes("commissioner") ||
    roleLower.includes("chairperson") ||
    roleLower.includes("staff")
  );
};

const getRoleRank = (member: any): number => {
  const role = (member.role || "").toLowerCase().trim();

  for (let i = 0; i < ROLE_PRIORITY_ORDER.length; i++) {
    const key = ROLE_PRIORITY_ORDER[i];
    if (role === key) {
      return i + 1;
    }
  }

  if (role.includes("adviser")) return 1;
  if (role.includes("president") && !role.includes("vice")) return 2;
  if (role.includes("vice president") || role.includes("vp")) return 3;
  if (role.includes("executive secretary")) return 4;
  if (role.includes("treasurer")) return 5;
  if (role.includes("auditor")) return 6;
  if (role.includes("governor")) return 7;

  return 99;
};

const getCabinetOfficialRank = (member: any): number => {
  const roleLower = (member.role || "").toLowerCase().trim();
  for (let i = 0; i < CABINET_ROLE_PRIORITY_ORDER.length; i++) {
    const key = CABINET_ROLE_PRIORITY_ORDER[i];
    if (roleLower === key || roleLower.includes(key)) {
      return i + 1;
    }
  }
  return 99;
};

export default function CabinetPage() {
  const [selectedDept, setSelectedDept] = useState<CabinetDepartment | null>(null);
  const [departments, setDepartments] = useState<CabinetDepartment[]>(initialCabinetDepartments);

  // Executive Profiling State
  const [execMembers, setExecMembers] = useState<any[]>([]);
  const [loadingExec, setLoadingExec] = useState(true);
  const [execPage, setExecPage] = useState(1);
  const [execSearchQuery, setExecSearchQuery] = useState("");
  const [cabinetSelectedDept, setCabinetSelectedDept] = useState("ALL");
  const execMembersPerPage = 8;

  // Cabinet Officials Profiling State
  const [cabOfficialMembers, setCabOfficialMembers] = useState<any[]>([]);
  const [cabPage, setCabPage] = useState(1);
  const [cabSearchQuery, setCabSearchQuery] = useState("");
  const cabMembersPerPage = 8;

  useEffect(() => {
    fetchDynamicMembers();
  }, []);

  useEffect(() => {
    setExecPage(1);
  }, [execSearchQuery]);

  useEffect(() => {
    setCabPage(1);
  }, [cabSearchQuery]);

  const fetchDynamicMembers = async () => {
    try {
      const data = await fetchWithCache("cabinet_members", async () => {
        const { data, error } = await supabase
          .from("members")
          .select("id, name, full_name, role, department, profile_url, phone_number, email, room_address, facebook_url, filed_bills, created_at")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
      });

      if (data && data.length > 0) {
        // 1. Process Executive Profiling Members
        const mappedData = data.map((m: any) => ({
          id: m.id,
          name: m.name || m.full_name || "USG Member",
          role: m.role || "Executive Officer",
          department: m.department || "Executive Branch",
          avatarSrc: m.profile_url || "/usg.jpg",
          directLine: m.phone_number || "0917 552 6001",
          email: m.email || "usg@carsu.edu.ph",
          roomAddress: m.room_address || "Room 501, Executive Building",
          facebookUrl: m.facebook_url || "#",
          filedBills: m.filed_bills || [],
        }));

        const executiveOnly = mappedData.filter((m: any) => isExecutiveRole(m.role));

        if (executiveOnly.length > 0) {
          setExecMembers(executiveOnly);
        } else {
          setExecMembers(seedExecutiveMembers);
        }

        // 2. Process Cabinet Officials Profiling Members
        const cabinetOnly = mappedData.filter((m: any) => isCabinetOfficialRole(m.role));
        if (cabinetOnly.length > 0) {
          setCabOfficialMembers(cabinetOnly);
        } else {
          setCabOfficialMembers(seedCabinetOfficialMembers);
        }

        // 3. Process Cabinet Departments Appointed Members
        const updatedDepts = initialCabinetDepartments.map((dept) => {
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
              directLine: m.phone_number || "0917 552 6000",
              email: m.email || "usg@carsu.edu.ph",
              roomAddress: m.room_address || "Executive Suite",
              facebookUrl: m.facebook_url || "#",
              assignedProjects: m.assigned_projects || 0,
              initiativesLed: m.initiatives_led || 0,
              term: m.term || "2026-2027",
            }));

          return {
            ...dept,
            members: matchingDbMembers,
          };
        });

        setDepartments(updatedDepts);
      } else {
        setExecMembers(seedExecutiveMembers);
        setCabOfficialMembers(seedCabinetOfficialMembers);
      }
    } catch (err) {
      console.error("Error fetching dynamic members:", err);
      setExecMembers(seedExecutiveMembers);
      setCabOfficialMembers(seedCabinetOfficialMembers);
    } finally {
      setLoadingExec(false);
    }
  };

  const execDepartmentsList = Array.from(
    new Set(execMembers.map((m) => m.department).filter(Boolean))
  ).sort((a: any, b: any) => a.localeCompare(b));

  const filteredCabinetDepartments = departments.filter((dept) =>
    cabinetSelectedDept === "ALL" ||
    dept.name.toLowerCase() === cabinetSelectedDept.toLowerCase() ||
    dept.acronym.toLowerCase() === cabinetSelectedDept.toLowerCase()
  );

  const filteredExecMembers = execMembers
    .filter((member) => {
      return (
        !execSearchQuery.trim() ||
        member.name?.toLowerCase().includes(execSearchQuery.toLowerCase()) ||
        member.role?.toLowerCase().includes(execSearchQuery.toLowerCase()) ||
        member.department?.toLowerCase().includes(execSearchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(execSearchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      const rankA = getRoleRank(a);
      const rankB = getRoleRank(b);
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      return (a.name || "").localeCompare(b.name || "");
    });

  const execTotalPages = Math.ceil(filteredExecMembers.length / execMembersPerPage);
  const displayedExecMembers = filteredExecMembers.slice(
    (execPage - 1) * execMembersPerPage,
    execPage * execMembersPerPage
  );

  const filteredCabMembers = cabOfficialMembers
    .filter((member) => {
      return (
        !cabSearchQuery.trim() ||
        member.name?.toLowerCase().includes(cabSearchQuery.toLowerCase()) ||
        member.role?.toLowerCase().includes(cabSearchQuery.toLowerCase()) ||
        member.department?.toLowerCase().includes(cabSearchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(cabSearchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      const rankA = getCabinetOfficialRank(a);
      const rankB = getCabinetOfficialRank(b);
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      return (a.name || "").localeCompare(b.name || "");
    });

  const cabTotalPages = Math.ceil(filteredCabMembers.length / cabMembersPerPage);
  const displayedCabMembers = filteredCabMembers.slice(
    (cabPage - 1) * cabMembersPerPage,
    cabPage * cabMembersPerPage
  );

  return (
    <GridShell>
      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-12 sm:py-20">

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
              USG Executive Branch
            </h1>
            <p className="mt-4 text-slate-600 max-w-3xl text-base sm:text-lg leading-relaxed">
              The chief executive officers, cabinet secretaries, and departments tasked with executing policy measures, student welfare programs, and university administration.
            </p>
          </div>
        </motion.div>

        {/* SECTION 1: USG EXECUTIVES (EXECUTIVE PROFILING) */}
        <section className="mt-8">
          {/* Results Counter & Search */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium min-h-[40px]">
            <span>
              Showing {filteredExecMembers.length > 0 ? (execPage - 1) * execMembersPerPage + 1 : 0} -{" "}
              {Math.min(execPage * execMembersPerPage, filteredExecMembers.length)} of {filteredExecMembers.length} executive profile
              {filteredExecMembers.length === 1 ? "" : "s"}
            </span>

            <div className="flex justify-end">
              <ExpandableSearchBar
                expandDirection="left"
                width={220}
                placeholder="Search executive..."
                value={execSearchQuery}
                onSearch={(q) => setExecSearchQuery(q)}
              />
            </div>
          </div>

          {loadingExec ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-10 w-10 border-4 border-[#173490] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredExecMembers.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
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
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">No executive profiles found</h3>
              <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
                We couldn't find any executive members matching your criteria. Try adjusting your search query or department filter.
              </p>
              <button
                onClick={() => setExecSearchQuery("")}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#173490] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1e4bb8] cursor-pointer shadow-sm"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${execPage}-${execSearchQuery}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="mt-6 grid gap-6 grid-cols-1 lg:grid-cols-2"
                >
                  {displayedExecMembers.map((member, index) => (
                    <div key={member.id || index}>
                      <ProfileCard {...member} sectionLabel="USG EXECUTIVE" />
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {execTotalPages > 1 && (
                <div className="mt-10 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setExecPage((p) => Math.max(1, p - 1))}
                          className={execPage === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: execTotalPages }, (_, i) => i + 1).map((p) => (
                        <PaginationItem key={p}>
                          <PaginationLink
                            isActive={p === execPage}
                            onClick={() => setExecPage(p)}
                            className="cursor-pointer"
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setExecPage((p) => Math.min(execTotalPages, p + 1))}
                          className={execPage === execTotalPages ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </section>

        {/* SECTION 2: USG CABINETS (PROFILING FIRST, THEN DEPARTMENTS) */}
        <section className="mt-16 border-t border-slate-200/80 pt-12">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#173490]/20 bg-[#173490]/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#173490]">
                <span className="h-2 w-2 rounded-full bg-[#173490]" />
                USG Cabinet Structure & Officials
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-[-0.04em]">
                USG Cabinets
              </h2>
              <p className="mt-2 text-slate-600 max-w-3xl text-sm sm:text-base leading-relaxed">
                The appointed Cabinet Secretaries, Chiefs of Staff, and Department Officers tasked with directing operations across all university departments.
              </p>
            </div>
          </div>

          {/* SUBSECTION 2A: CABINET OFFICIALS PROFILING (PROFILING FIRST BEFORE DEPARTMENTS) */}
          <div className="mt-8">
            {/* Results Counter & Search */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium min-h-[40px]">
              <span>
                Showing {filteredCabMembers.length > 0 ? (cabPage - 1) * cabMembersPerPage + 1 : 0} -{" "}
                {Math.min(cabPage * cabMembersPerPage, filteredCabMembers.length)} of {filteredCabMembers.length} cabinet official profile
                {filteredCabMembers.length === 1 ? "" : "s"}
              </span>

              <div className="flex justify-end">
                <ExpandableSearchBar
                  expandDirection="left"
                  width={220}
                  placeholder="Search cabinet official..."
                  value={cabSearchQuery}
                  onSearch={(q) => setCabSearchQuery(q)}
                />
              </div>
            </div>

            {filteredCabMembers.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-xs">
                <h4 className="text-base font-bold text-slate-900">No cabinet officials found</h4>
                <p className="mt-1 text-xs text-slate-500">Try adjusting your search query.</p>
                <button
                  onClick={() => setCabSearchQuery("")}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#173490] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#1e4bb8] cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`cab-${cabPage}-${cabSearchQuery}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="mt-6 grid gap-6 grid-cols-1 lg:grid-cols-2"
                  >
                    {displayedCabMembers.map((member, index) => (
                      <div key={member.id || index}>
                        <ProfileCard {...member} sectionLabel="USG CABINET" />
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                {cabTotalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCabPage((p) => Math.max(1, p - 1))}
                            className={cabPage === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {Array.from({ length: cabTotalPages }, (_, i) => i + 1).map((p) => (
                          <PaginationItem key={p}>
                            <PaginationLink
                              isActive={p === cabPage}
                              onClick={() => setCabPage(p)}
                              className="cursor-pointer"
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCabPage((p) => Math.min(cabTotalPages, p + 1))}
                            className={cabPage === cabTotalPages ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>

          {/* SUBSECTION 2B: CABINET DEPARTMENTS DIRECTORY GRID (BELOW THE PROFILING) */}
          <div className="mt-16 border-t border-slate-200/70 pt-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Cabinet Departments
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Explore department operational mandates, structural divisions, and appointed staff rosters.
                </p>
              </div>

              {/* Department Filtering in Section II */}
              <div className="flex items-center gap-3 self-start sm:self-auto mt-2 sm:mt-0">
                <div className="relative min-w-[200px] sm:min-w-[230px]">
                  <select
                    value={cabinetSelectedDept}
                    onChange={(e) => setCabinetSelectedDept(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-200 py-2 pl-3.5 pr-9 rounded-full text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#173490] focus:border-transparent transition cursor-pointer shadow-xs hover:border-[#173490]/40"
                  >
                    <option value="ALL">All Cabinet Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.name} value={dept.name}>
                        {dept.name} ({dept.acronym})
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
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

                {cabinetSelectedDept !== "ALL" && (
                  <button
                    onClick={() => setCabinetSelectedDept("ALL")}
                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-[#173490] bg-[#173490]/10 hover:bg-[#173490] hover:text-white rounded-full transition cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

          {/* Departments Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-8 flex flex-wrap justify-center gap-6"
          >
            {filteredCabinetDepartments.map((dept) => (
              <motion.div
                key={dept.name}
                variants={itemVariants}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  boxShadow: "0 28px 50px -12px rgba(23, 52, 144, 0.24)",
                  transition: { type: "spring", stiffness: 350, damping: 25 },
                }}
                whileTap={{ scale: 0.985 }}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-lg shadow-slate-200/70 hover:shadow-2xl transition-all duration-300 hover:border-[#173490]/50 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-[360px]"
              >
                <div>
                  {/* Centered Top Header */}
                  <div className="flex flex-col items-center text-center">
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="relative"
                    >
                      <img
                        src={dept.logoSrc || "/usg.jpg"}
                        alt={`${dept.name} Logo`}
                        onError={(e) => {
                          e.currentTarget.src = "/usg.jpg";
                        }}
                        className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover border-2 border-white shadow-lg ring-2 ring-[#173490]/25 transition-transform duration-300 group-hover:scale-105 mx-auto"
                      />
                    </motion.div>
                    <div className="mt-3 flex flex-col items-center gap-1">
                      <span className="inline-block rounded-full bg-[#173490]/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-[#173490] group-hover:bg-[#173490] group-hover:text-white transition-colors duration-200">
                        {dept.acronym}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {dept.members.length} Appointed Member{dept.members.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>

                  {/* Department Name */}
                  <h3 className="mt-4 text-xl font-bold text-slate-900 group-hover:text-[#173490] transition leading-snug text-center">
                    {dept.name}
                  </h3>

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

                  <motion.button
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.95 }}
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
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

        {/* Modal: Department Member Profiling with Framer Motion AnimatePresence */}
        <AnimatePresence>
          {selectedDept && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 pt-20 sm:pt-24 bg-slate-900/75 backdrop-blur-md overflow-y-auto"
              onClick={() => setSelectedDept(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="relative my-auto max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100"
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
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="flex-shrink-0 mx-auto sm:mx-0"
                  >
                    <img
                      src={selectedDept.logoSrc || "/usg.jpg"}
                      alt={`${selectedDept.name} Logo`}
                      onError={(e) => {
                        e.currentTarget.src = "/usg.jpg";
                      }}
                      className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover border-4 border-white shadow-lg ring-2 ring-[#173490]/20"
                    />
                  </motion.div>
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
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span>Appointed Department Officers</span>
                  </h3>

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
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05, duration: 0.3 }}
                          whileHover={{ y: -3, transition: { duration: 0.2 } }}
                          className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#173490]/40 hover:shadow-md transition"
                        >
                          <div>
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
                          </div>

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
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-end border-t border-slate-100 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedDept(null)}
                    className="rounded-xl bg-[#173490] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#1e4bb8] cursor-pointer shadow-md"
                  >
                    Close Department Profile
                  </motion.button>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </GridShell>
  );
}
