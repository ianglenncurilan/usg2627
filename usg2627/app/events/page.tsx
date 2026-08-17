import GridShell from "../components/GridShell";

const events = [
  { title: "Leadership Assembly", date: "Aug 22, 2026" },
  { title: "Constitution Day Forum", date: "Aug 02, 2026" },
  { title: "Student Services Fair", date: "Jul 17, 2026" },
];

export default function EventsPage() {
  return (
    <GridShell>
      <main className="mx-auto max-w-6xl px-6 py-20">
        <h1 className="text-5xl font-black tracking-[-0.06em] text-slate-900">
          Events
        </h1>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {events.map((event) => (
            <div
              key={event.title}
              className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#173490]">
                Upcoming
              </p>
              <h2 className="mt-3 text-2xl font-black text-slate-900">
                {event.title}
              </h2>
              <p className="mt-3 text-base text-slate-600">{event.date}</p>
            </div>
          ))}
        </div>
      </main>
    </GridShell>
  );
}
