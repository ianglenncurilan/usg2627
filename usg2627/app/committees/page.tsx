import Header from "../components/Header";
import GridShell from "../components/GridShell";

const committees = [
  {
    name: "Blue Ribbon",
    description: "Oversight and integrity investigations.",
  },
  {
    name: "Rules & Ethics",
    description: "Parliamentary procedures and ethics compliance.",
  },
  { name: "Finance", description: "Budget review and fiscal oversight." },
  { name: "Education", description: "Academic policy and student welfare." },
  {
    name: "Public Affairs",
    description: "Campus communications and advocacy.",
  },
  {
    name: "Youth Development",
    description: "Programs and leadership growth initiatives.",
  },
];

export default function CommitteesPage() {
  return (
    <GridShell>
      <Header subtitle="Committees" />

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
