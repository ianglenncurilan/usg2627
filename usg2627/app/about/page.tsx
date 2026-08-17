import GridShell from "../components/GridShell";

export default function AboutPage() {
  return (
    <GridShell>
      <main className="mx-auto max-w-5xl px-6 py-20">
        <h1 className="text-5xl font-black tracking-[-0.06em] text-slate-900">
          About USG
        </h1>
        <p className="mt-6 text-xl leading-8 text-slate-600">
          The University Student Government serves as the primary student voice
          in policy, representation, and institutional coordination.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#173490]">
              Mission
            </p>
            <p className="mt-4 text-lg leading-8 text-slate-700">
              To advance transparent communication, student welfare, and
              accountable governance for the campus community.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#173490]">
              Vision
            </p>
            <p className="mt-4 text-lg leading-8 text-slate-700">
              To build a stronger student culture rooted in participation,
              inclusion, and institutional responsiveness.
            </p>
          </div>
        </div>
      </main>
    </GridShell>
  );
}
