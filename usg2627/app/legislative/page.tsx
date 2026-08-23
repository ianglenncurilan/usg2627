import GridShell from "../components/GridShell";
import ProfileCard from "../components/ProfileCard";

const legislativeMembers = [
  {
    name: "Win Gatchalian",
    role: "Legislative President",
    department: "College of Engineering & Architecture",
    avatarSrc: "/grad_ pic2.jpg",
    directLine: "(632) 552-6601 loc. 5301",
    email: "win.gatchalian@carsu.edu.ph",
    roomAddress: "Room 502, Legislative Building",
    initiatives: [
      "Student Governance & Policy Modernization Act",
      "University Facilities Improvement Appropriations",
      "Student Leadership Development Framework",
    ],
  },
  {
    name: "Vicente C. Sotto III",
    role: "Legislative President Pro Tempore",
    department: "College of Business & Management",
    avatarSrc: "/grad_ pic2.jpg",
    directLine: "(632) 552-6601 loc. 5302",
    email: "vicente.sotto@carsu.edu.ph",
    roomAddress: "Room 503, Legislative Building",
    initiatives: [
      "Student Fiscal Accountability & Transparency Code",
      "Collegiate Council Subsidies Reform",
    ],
  },
  {
    name: "Maria Imelda Josefa",
    role: "Legislative Secretary General",
    department: "College of Humanities & Social Sciences",
    avatarSrc: "/grad_ pic2.jpg",
    directLine: "(632) 552-6601 loc. 5303",
    email: "maria.josefa@carsu.edu.ph",
    roomAddress: "Room 504, Legislative Building",
    initiatives: [
      "Official Resolution Archiving & Digital Registry",
      "Parliamentary Procedure Guidelines",
    ],
  },
  {
    name: "Rafael P. Santos",
    role: "Chair, Committee on Rules & Ethics",
    department: "College of Law & Public Administration",
    avatarSrc: "/grad_ pic2.jpg",
    directLine: "(632) 552-6601 loc. 5304",
    email: "rafael.santos@carsu.edu.ph",
    roomAddress: "Room 505, Legislative Building",
    initiatives: [
      "Code of Ethics for Student Government Officers",
      "Electoral Reforms & Committee Governance",
    ],
  },
  {
    name: "Patricia Mae Alcantara",
    role: "Chair, Committee on Student Rights",
    department: "College of Computing & Information Sciences",
    avatarSrc: "/grad_ pic2.jpg",
    directLine: "(632) 552-6601 loc. 5305",
    email: "patricia.alcantara@carsu.edu.ph",
    roomAddress: "Room 506, Legislative Building",
    initiatives: [
      "Student Academic Freedom Protection Charter",
      "Digital Rights & Campus Privacy Measures",
    ],
  },
  {
    name: "Gabriel Carlos De Mesa",
    role: "Chair, Committee on Finance & Budget",
    department: "College of Accountancy",
    avatarSrc: "/grad_ pic2.jpg",
    directLine: "(632) 552-6601 loc. 5306",
    email: "gabriel.demesa@carsu.edu.ph",
    roomAddress: "Room 507, Legislative Building",
    initiatives: [
      "Annual Student Organization Fund Allocation Bill",
      "Fiscal Liquidation Audit Schedule",
    ],
  },
];

export default function LegislativePage() {
  return (
    <GridShell>
      <main className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-200 pb-8">
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
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {legislativeMembers.map((member, index) => (
            <ProfileCard key={index} {...member} />
          ))}
        </div>
      </main>
    </GridShell>
  );
}
