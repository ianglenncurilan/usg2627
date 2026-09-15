"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { fetchWithCache, invalidateCache } from "@/lib/cache";
import GridShell from "../components/GridShell";
import { motion, AnimatePresence } from "framer-motion";
import ExpandableSearchBar from "@/components/ui/expandable-search-bar";

// Comprehensive seed events for academic year 2026-2027
const seedEvents = [
  {
    id: "evt-1",
    title: "USG Leadership Summit & Strategic Planning",
    description: "University-wide gathering of college student councils, committee heads, and campus leaders to align executive agenda priorities, review legislative proposals, and coordinate student welfare initiatives.",
    event_date: "2026-09-18T09:00:00.000Z",
    location: "Student Center Assembly Hall",
    category: "Assembly",
  },
  {
    id: "evt-2",
    title: "Legislative Town Hall & Student Rights Dialogue",
    description: "Open floor public forum with USG Senators to discuss upcoming university bills, constitutional revisions, tuition transparency, and academic equity policies.",
    event_date: "2026-10-08T13:30:00.000Z",
    location: "Senate Hall Annex",
    category: "Dialogue",
  },
  {
    id: "evt-3",
    title: "Semestral Mental Health & Wellness Challenge",
    description: "Interactive psychological wellness forum, destigmatization talks, and semestral campus-wide trivia challenge promoting student mental wellness and support networks.",
    event_date: "2026-10-24T10:00:00.000Z",
    location: "University Gymnasium",
    category: "Wellness",
  },
  {
    id: "evt-4",
    title: "Annual State of the Student Body Address (SOSBA)",
    description: "Executive report by the USG President outlining policy enactments, financial audits, completed infrastructure projects, and strategic milestones for the academic year.",
    event_date: "2026-11-20T14:00:00.000Z",
    location: "Main University Auditorium",
    category: "Summit",
  },
  {
    id: "evt-5",
    title: "Constitution Day & Governance Forum",
    description: "Commemorative panel discussion on student representation, amendments, and governance procedures governing student organization charters.",
    event_date: "2026-08-02T14:00:00.000Z",
    location: "Senate Hall Annex",
    category: "Governance",
  },
  {
    id: "evt-6",
    title: "Student Services & Accredited Organizations Fair",
    description: "Interactive fair connecting students with student-led committees, auxiliary organizations, and university student welfare support services.",
    event_date: "2026-07-17T09:00:00.000Z",
    location: "Campus Plaza",
    category: "Fair",
  },
];

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
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

function getEventDateStr(evt: any): string {
  return evt?.event_date || evt?.date || evt?.created_at || "";
}

function getEventTime(evt: any): number {
  const str = getEventDateStr(evt);
  if (!str) return 0;
  const t = new Date(str).getTime();
  return isNaN(t) ? 0 : t;
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setMounted(true);
    const calculateTimeLeft = () => {
      if (!targetDate) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      const targetTime = new Date(targetDate).getTime();
      if (isNaN(targetTime)) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      const difference = targetTime - Date.now();
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!mounted) {
    return (
      <div className="mt-6 grid grid-cols-4 gap-2 text-center opacity-60">
        <div className="rounded-2xl bg-slate-950 p-2.5 shadow-md border border-slate-800 flex flex-col justify-center min-w-[55px]">
          <span className="text-xl font-black tracking-tight text-white">0</span>
          <span className="text-[9px] font-bold tracking-wider text-[#E7C609] uppercase">Days</span>
        </div>
        <div className="rounded-2xl bg-slate-950 p-2.5 shadow-md border border-slate-800 flex flex-col justify-center min-w-[55px]">
          <span className="text-xl font-black tracking-tight text-white">00</span>
          <span className="text-[9px] font-bold tracking-wider text-[#E7C609] uppercase">Hours</span>
        </div>
        <div className="rounded-2xl bg-slate-950 p-2.5 shadow-md border border-slate-800 flex flex-col justify-center min-w-[55px]">
          <span className="text-xl font-black tracking-tight text-white">00</span>
          <span className="text-[9px] font-bold tracking-wider text-[#E7C609] uppercase">Mins</span>
        </div>
        <div className="rounded-2xl bg-slate-950 p-2.5 shadow-md border border-slate-800 flex flex-col justify-center min-w-[55px]">
          <span className="text-xl font-black tracking-tight text-white">00</span>
          <span className="text-[9px] font-bold tracking-wider text-[#E7C609] uppercase">Secs</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-4 gap-2 text-center" suppressHydrationWarning>
      <div className="rounded-2xl bg-slate-950 p-2.5 shadow-md border border-slate-800 flex flex-col justify-center min-w-[55px]">
        <span className="text-xl font-black tracking-tight text-white">{timeLeft.days}</span>
        <span className="text-[9px] font-bold tracking-wider text-[#E7C609] uppercase">Days</span>
      </div>
      <div className="rounded-2xl bg-slate-950 p-2.5 shadow-md border border-slate-800 flex flex-col justify-center min-w-[55px]">
        <span className="text-xl font-black tracking-tight text-white">{String(timeLeft.hours).padStart(2, "0")}</span>
        <span className="text-[9px] font-bold tracking-wider text-[#E7C609] uppercase">Hours</span>
      </div>
      <div className="rounded-2xl bg-slate-950 p-2.5 shadow-md border border-slate-800 flex flex-col justify-center min-w-[55px]">
        <span className="text-xl font-black tracking-tight text-white">{String(timeLeft.minutes).padStart(2, "0")}</span>
        <span className="text-[9px] font-bold tracking-wider text-[#E7C609] uppercase">Mins</span>
      </div>
      <div className="rounded-2xl bg-slate-950 p-2.5 shadow-md border border-slate-800 flex flex-col justify-center min-w-[55px]">
        <span className="text-xl font-black tracking-tight text-white">{String(timeLeft.seconds).padStart(2, "0")}</span>
        <span className="text-[9px] font-bold tracking-wider text-[#E7C609] uppercase">Secs</span>
      </div>
    </div>
  );
}

function FormattedDate({ dateString }: { dateString: string }) {
  const [formatted, setFormatted] = useState(dateString);

  useEffect(() => {
    try {
      if (!dateString) return;
      const d = new Date(dateString);
      if (!isNaN(d.getTime())) {
        setFormatted(
          d.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          })
        );
      }
    } catch {
      setFormatted(dateString);
    }
  }, [dateString]);

  return <span suppressHydrationWarning>{formatted}</span>;
}

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "past">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<any[]>(seedEvents);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents(skipCache = false) {
      try {
        if (skipCache) invalidateCache("events_list");
        const data = await fetchWithCache("events_list", async () => {
          const { data, error } = await supabase
            .from("events")
            .select("id, title, description, event_date, location")
            .order("event_date", { ascending: false });
          if (error) throw error;
          return data || [];
        });

        if (data && data.length > 0) {
          setEvents(data);
        } else {
          setEvents(seedEvents);
        }
      } catch (err) {
        console.error("Fetch events catch error:", err);
        setEvents(seedEvents);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();

    const channel = supabase
      .channel("realtime-events")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => {
          fetchEvents(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const now = useMemo(() => new Date(), []);

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const upcoming: any[] = [];
    const past: any[] = [];

    events.forEach((evt) => {
      const t = getEventTime(evt);
      if (t > 0 && t > now.getTime()) {
        upcoming.push(evt);
      } else {
        past.push(evt);
      }
    });

    // Sort upcoming ascending (soonest first), past descending (most recent past first)
    upcoming.sort((a, b) => getEventTime(a) - getEventTime(b));
    past.sort((a, b) => getEventTime(b) - getEventTime(a));

    return { upcomingEvents: upcoming, pastEvents: past };
  }, [events, now]);

  const displayedEvents = useMemo(() => {
    let list = events;
    if (activeTab === "upcoming") list = upcomingEvents;
    else if (activeTab === "past") list = pastEvents;

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter((e) =>
      (e.title && e.title.toLowerCase().includes(q)) ||
      (e.description && e.description.toLowerCase().includes(q)) ||
      (e.location && e.location.toLowerCase().includes(q))
    );
  }, [activeTab, events, upcomingEvents, pastEvents, searchQuery]);

  return (
    <GridShell>
      <main className="mx-auto max-w-6xl px-6 py-20">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="border-b border-slate-200 pb-8"
        >
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#173490]/20 bg-[#173490]/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#173490]">
              <span className="h-2 w-2 rounded-full bg-[#E7C609]" />
              Official Calendar
            </div>
            <h1 className="text-4xl font-black tracking-[-0.06em] text-slate-900 sm:text-5xl">
              Campus Events & Forums
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl">
              Keep track of student assemblies, policy dialogues, committee summits, and campus welfare initiatives.
            </p>
          </div>
        </motion.div>

        {/* Search (Left, Expanding Right) & Tabs (Right) Row */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex justify-start">
            <ExpandableSearchBar
              expandDirection="right"
              width={260}
              placeholder="Search event title, venue..."
              value={searchQuery}
              onSearch={(q) => setSearchQuery(q)}
            />
          </div>

          {/* 3 Navigation Tabs: All, Upcoming, Past */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-slate-100 p-1.5 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${activeTab === "all"
                ? "bg-[#173490] text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
                }`}
            >
              All Events ({events.length})
            </button>
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${activeTab === "upcoming"
                ? "bg-[#173490] text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Upcoming ({upcomingEvents.length})
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${activeTab === "past"
                ? "bg-[#173490] text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Past ({pastEvents.length})
            </button>
          </div>
        </div>

        {/* Events Grid List with Framer Motion */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-10 w-10 border-4 border-[#173490] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : displayedEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 text-center text-slate-500 py-16 bg-white rounded-3xl border border-slate-200 shadow-sm"
          >
            <svg
              className="mx-auto h-12 w-12 text-slate-400 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-bold text-slate-800">No events found</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? `No events matched your search "${searchQuery}".`
                : `There are currently no ${activeTab === "all" ? "" : activeTab} events recorded.`}
            </p>
            {(activeTab !== "all" || searchQuery) && (
              <button
                onClick={() => {
                  setActiveTab("all");
                  setSearchQuery("");
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#173490] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#102a72] transition"
              >
                View All Events
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {displayedEvents.map((event) => {
                const dateStr = getEventDateStr(event);
                const eventTime = getEventTime(event);
                const isUpcoming = eventTime > 0 && eventTime > now.getTime();
                return (
                  <motion.div
                    key={event.id || event.title}
                    variants={itemVariants}
                    layout
                    whileHover={{
                      y: -6,
                      scale: 1.015,
                      boxShadow: "0 20px 30px -10px rgba(23,52,144,0.12)",
                      transition: { type: "spring", stiffness: 350, damping: 25 },
                    }}
                    whileTap={{ scale: 0.985 }}
                    className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-[#173490]/40 transition-colors"
                  >
                    <div>
                      {/* Badge & Location */}
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${isUpcoming
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                        >
                          {isUpcoming && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                          )}
                          {isUpcoming ? "Upcoming Event" : "Past Event"}
                        </span>

                        <span
                          className="flex items-center gap-1 text-xs text-slate-500 font-medium max-w-[140px] truncate"
                          title={event.location || "Campus Venue"}
                        >
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
                            className="text-[#173490] shrink-0"
                          >
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span className="truncate">{event.location || "Campus Venue"}</span>
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 group-hover:text-[#173490] transition leading-snug">
                        {event.title}
                      </h2>

                      {/* Date Display */}
                      <p className="mt-2 flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500" suppressHydrationWarning>
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
                          className="text-[#173490] shrink-0"
                        >
                          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                          <line x1="16" x2="16" y1="2" y2="6" />
                          <line x1="8" x2="8" y1="2" y2="6" />
                          <line x1="3" x2="21" y1="10" y2="10" />
                        </svg>
                        <FormattedDate dateString={dateStr} />
                      </p>

                      {/* Description */}
                      <p className="mt-4 text-sm leading-relaxed text-slate-600 line-clamp-4">
                        {event.description}
                      </p>
                    </div>

                    {/* Countdown Timer Animation for Upcoming Events */}
                    {isUpcoming ? (
                      <CountdownTimer targetDate={dateStr} />
                    ) : (
                      <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <span className="font-semibold uppercase tracking-wider text-[10px]">Status</span>
                        <span className="font-bold text-slate-500">Concluded</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </GridShell>
  );
}
