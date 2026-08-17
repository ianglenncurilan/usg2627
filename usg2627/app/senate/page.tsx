import Header from "../components/Header";
import GridShell from "../components/GridShell";

const senateMembers = [
  { name: "Win Gatchalian", role: "Senate President" },
  { name: "Vicente C. Sotto III", role: "Senate President Pro Tempore" },
  { name: "Maria Imelda Josefa", role: "Secretary General" },
  { name: "Rafael P. Santos", role: "Chair, Rules & Ethics" },
];

export default function SenatePage() {
  return (
    <GridShell>
      <Header subtitle="Senate" />

      <main className="mx-auto max-w-6xl px-6 py-20">
        <h1 className="text-5xl font-black tracking-[-0.06em] text-slate-900">
          Senate Leadership
        </h1>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {senateMembers.map((member) => (
            <div
              key={member.name}
              className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#173490]">
                Leadership
              </p>
              <h2 className="mt-3 text-2xl font-black text-slate-900">
                {member.name}
              </h2>
              <p className="mt-3 text-lg text-slate-600">{member.role}</p>
            </div>
          ))}
        </div>
      </main>
    </GridShell>
  );
}
