"use client";

import { useState, useEffect } from "react";
import GridShell from "../components/GridShell";
import ProfileCard from "../components/ProfileCard";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

const seedMembers = [
  {
    id: "seed-1",
    name: "Cresencio U. Ablan",
    role: "USG Senator",
    department: "Department of Public Information and Creative Communications",
    avatarSrc: "/usg.jpg",
    directLine: "(632) 552-6601 loc. 5301",
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
    directLine: "(632) 552-6601 loc. 5301",
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
    directLine: "(632) 552-6601 loc. 5302",
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
    directLine: "(632) 552-6601 loc. 5303",
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
    directLine: "(632) 552-6601 loc. 5304",
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
    directLine: "(632) 552-6601 loc. 5305",
    email: "patricia.alcantara@carsu.edu.ph",
    roomAddress: "Room 506, Legislative Building",
    filedBills: [
      {
        number: "Senate Bill No. 2627-019",
        title: "AN ACT ENACTING THE STUDENT ACADEMIC FREEDOM CHARTER AND DATA PRIVACY PROTECTION IN DIGITAL LEARNING PLATFORMS",
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

  useEffect(() => {
    fetchMembers();
  }, []);

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
          directLine: m.phone_number || "(632) 552-6601",
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

  return (
    <GridShell>
      <main className="mx-auto max-w-6xl px-6 py-20">
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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 border-4 border-[#173490] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-10 grid gap-6 md:grid-cols-2"
          >
            {members.map((member, index) => (
              <motion.div key={member.id || index} variants={itemVariants}>
                <ProfileCard {...member} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </GridShell>
  );
}
