import GridShell from "../components/GridShell";

const committees = [
  {
    name: "Department of Students' Welfare and Development",
    description: "Oversight and integrity investigations.",
  },
  {
    name: "Department of Public Information and Creative Communications",
    description: "Parliamentary procedures and ethics compliance.",
  },
  { name: "Department of Interior, Local Governance and Subordinate Units", 
    description: "Budget review and fiscal oversight." },
  {
    name: "Department of Finance and Treasury",
    description: "Campus communications and advocacy.",
  },
  {
    name: "Department of Environment and Natural Resources",
    description: "Programs and leadership growth initiatives.",
  },
  {
    name: "Department of Budget and Management",
    description: "Programs and leadership growth initiatives.",
  },
  {
    name: "Department of Academics, Sports, Culture, Arts and Technology",
    description: "Programs and leadership growth initiatives.",
  },
  {
    name: "Executive Branch",
    description: "Programs and leadership growth initiatives.",
  },
  {
    name: "Office of the President",
    description: "Programs and leadership growth initiatives.",
  },
  {
    name: "Department of Secretary",
    description: "Programs and leadership growth initiatives.",
  },
  {
    name: "Office of the Vice President",
    description: "Programs and leadership growth initiatives.",
  },
  {
    name: "Office of the Student Regent",
    description: "Programs and leadership growth initiatives.",
  },
  {
    name: "University Student Government Legislative Branch",
    description: "Programs and leadership growth initiatives.",
  },
];

export default function CommitteesPage() {
  return (
    <GridShell>
      <main className="mx-auto max-w-6xl px-6 py-20">
        <h1 className="text-5xl font-black tracking-[-0.06em] text-slate-900">
          Standing Committees
        </h1>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {committees.map((committee) => (
            <div
              key={committee.name}
              className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#173490]">
                Committee
              </p>
              <h2 className="mt-3 text-2xl font-black text-slate-900">
                {committee.name}
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                {committee.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </GridShell>
  );
}
