"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { fetchWithCache, invalidateCache } from "@/lib/cache";
import GridShell from "../components/GridShell";
import { motion, AnimatePresence } from "framer-motion";
import { FaLocationDot } from "react-icons/fa6";

// Default seed events matching the campus calendar
const seedEvents = [
  {
    id: "evt-1",
    title: "USG Leadership Summit & Strategic Planning",
    description: "University-wide gathering of college student councils, committee heads, and campus leaders to align executive agenda priorities.",
    event_date: "2026-09-18T09:00:00.000Z",
    location: "Student Center Assembly Hall",
    category: "Summit",
  },
  {
    id: "evt-2",
    title: "Legislative Town Hall & Student Rights Dialogue",
    description: "Open floor public forum with USG Senators to discuss upcoming university bills, constitutional revisions, and tuition transparency.",
    event_date: "2026-10-08T13:30:00.000Z",
    location: "Senate Hall Annex",
    category: "Dialogue",
  },
  {
    id: "evt-3",
    title: "Semestral Mental Health & Wellness Challenge",
    description: "Interactive psychological wellness forum, destigmatization talks, and semestral campus-wide trivia challenge.",
    event_date: "2026-10-24T10:00:00.000Z",
    location: "University Gymnasium",
    category: "Wellness",
  },
  {
    id: "evt-4",
    title: "Annual State of the Student Body Address (SOSBA)",
    description: "Executive report by the USG President outlining policy enactments, financial audits, and strategic milestones.",
    event_date: "2026-11-20T14:00:00.000Z",
    location: "Main University Auditorium",
    category: "Assembly",
  },
  {
    id: "evt-5",
    title: "Constitution Day & Governance Forum",
    description: "Commemorative panel discussion on student representation, amendments, and governance procedures.",
    event_date: "2026-08-02T14:00:00.000Z",
    location: "Senate Hall Annex",
    category: "Governance",
  },
  {
    id: "evt-6",
    title: "Student Services & Accredited Organizations Fair",
    description: "Interactive fair connecting students with student-led committees, auxiliary organizations, and welfare support services.",
    event_date: "2026-07-17T09:00:00.000Z",
    location: "Campus Plaza",
    category: "Fair",
  },
];

// Format YYYY-MM-DD for date matching
function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 1)); // Default to Sept 2026 view
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // Default to today's date
  const [events, setEvents] = useState<any[]>(seedEvents);
  const [loading, setLoading] = useState(true);

  // Fetch events from Supabase or cache
  useEffect(() => {
    async function loadEvents(skipCache = false) {
      try {
        if (skipCache) invalidateCache("calendar_events_list");
        const data = await fetchWithCache("calendar_events_list", async () => {
          const { data, error } = await supabase
            .from("calendar_events")
            .select("id, title, description, event_date, location, category")
            .order("event_date", { ascending: true });

          if (error) {
            // If calendar_events table doesn't exist yet in Supabase, fallback to events table
            const { data: fallbackData } = await supabase
              .from("events")
              .select("id, title, description, event_date, location, category")
              .order("event_date", { ascending: true });
            return fallbackData || null;
          }
          return data || [];
        });

        if (data && data.length > 0) {
          setEvents(data);
        } else {
          setEvents(seedEvents);
        }
      } catch (err: any) {
        console.warn("Notice loading calendar events:", err?.message || err);
        setEvents(seedEvents);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();

    const channel = supabase
      .channel("realtime-calendar-events")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "calendar_events" },
        () => {
          loadEvents(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Calendar grid calculations
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon...
    const totalDaysInMonth = lastDayOfMonth.getDate();

    // Previous month padding days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevDays: { date: Date; isCurrentMonth: boolean }[] = [];
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      prevDays.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    const currentDays: { date: Date; isCurrentMonth: boolean }[] = [];
    for (let d = 1; d <= totalDaysInMonth; d++) {
      currentDays.push({
        date: new Date(year, month, d),
        isCurrentMonth: true,
      });
    }

    // Next month padding days to fill 35 or 42 grid cells
    const remainingCount = (7 - ((prevDays.length + currentDays.length) % 7)) % 7;
    const nextDays: { date: Date; isCurrentMonth: boolean }[] = [];
    for (let d = 1; d <= remainingCount; d++) {
      nextDays.push({
        date: new Date(year, month + 1, d),
        isCurrentMonth: false,
      });
    }

    return [...prevDays, ...currentDays, ...nextDays];
  }, [currentDate]);

  // Group events by date key YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    events.forEach((evt) => {
      if (!evt.event_date) return;
      const d = new Date(evt.event_date);
      if (isNaN(d.getTime())) return;
      const key = formatDateKey(d);
      if (!map[key]) map[key] = [];
      map[key].push(evt);
    });
    return map;
  }, [events]);

  // Events for currently selected date
  const selectedDateKey = formatDateKey(selectedDate);
  const selectedDateEvents = eventsByDate[selectedDateKey] || [];

  // Month navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  const monthName = currentDate.toLocaleString("en-US", { month: "long", year: "numeric" });
  const todayKey = formatDateKey(new Date());

  return (
    <GridShell>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">

        {/* Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="border-b border-slate-200 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#173490]/20 bg-[#173490]/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#173490]">
              <span className="h-2 w-2 rounded-full bg-[#E7C609] animate-pulse" />
              Public Interactive Calendar
            </div>
            <h1 className="text-4xl font-black tracking-[-0.05em] text-slate-900 sm:text-5xl">
              Campus Calendar & Schedule
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl">
              Explore university assemblies, hearings, summits, and student body activities across the academic year.
            </p>
          </div>
        </motion.div>



        {/* Main Calendar & Side Event Details Grid */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Calendar Grid Container (8 Cols on Desktop) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-[12px_18px_40px_-6px_rgba(15,23,42,0.15)] hover:shadow-[14px_20px_45px_-6px_rgba(23,52,144,0.18)] transition-shadow duration-300"
          >
            {/* Calendar Controls (Month Navigation) */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {monthName}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToday}
                  className="px-3.5 py-2 text-xs font-bold text-[#173490] bg-[#173490]/5 hover:bg-[#173490] hover:text-white rounded-xl border border-[#173490]/20 transition-all cursor-pointer shadow-2xs"
                >
                  Today
                </button>
                <button
                  onClick={handlePrevMonth}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-600 hover:bg-[#173490] hover:text-white hover:border-[#173490] shadow-xs hover:shadow-md transition-all cursor-pointer"
                  aria-label="Previous Month"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNextMonth}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-600 hover:bg-[#173490] hover:text-white hover:border-[#173490] shadow-xs hover:shadow-md transition-all cursor-pointer"
                  aria-label="Next Month"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 mb-3 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="py-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {calendarDays.map((item, idx) => {
                const dateKey = formatDateKey(item.date);
                const isToday = dateKey === todayKey;
                const isSelected = dateKey === selectedDateKey;
                const dayEvents = eventsByDate[dateKey] || [];
                const hasEvents = dayEvents.length > 0;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(item.date)}
                    className={`relative min-h-[75px] sm:min-h-[92px] rounded-2xl p-2.5 text-left transition-all duration-200 flex flex-col justify-between border cursor-pointer ${
                      !item.isCurrentMonth
                        ? "bg-slate-50/40 text-slate-300 border-transparent hover:bg-slate-100/60"
                        : isSelected
                          ? "bg-gradient-to-br from-[#173490]/10 to-[#173490]/5 border-[#173490] shadow-[5px_8px_20px_rgba(23,52,144,0.22)] text-slate-900 ring-2 ring-[#173490]/30 -translate-y-0.5"
                          : isToday
                            ? "bg-gradient-to-br from-amber-50 to-amber-100/60 border-[#E7C609] ring-2 ring-[#E7C609]/40 shadow-[4px_6px_16px_rgba(231,198,9,0.3)] text-slate-900 font-bold hover:shadow-[6px_9px_22px_rgba(231,198,9,0.4)] hover:-translate-y-0.5"
                            : hasEvents
                              ? "bg-white border-slate-300/90 text-slate-900 hover:border-[#173490]/50 shadow-xs hover:shadow-[5px_8px_18px_rgba(15,23,42,0.12)] hover:-translate-y-0.5"
                              : "bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs hover:shadow-[5px_8px_18px_rgba(15,23,42,0.1)] hover:-translate-y-0.5"
                    }`}
                  >
                    {/* Top Row: Date Number & Badges */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs sm:text-sm font-bold rounded-xl h-6.5 w-6.5 flex items-center justify-center transition-colors ${
                          isToday
                            ? "bg-[#E7C609] text-[#02076C] shadow-2xs font-extrabold"
                            : isSelected
                              ? "bg-[#173490] text-white shadow-xs"
                              : item.isCurrentMonth
                                ? "text-slate-800"
                                : "text-slate-400"
                        }`}
                      >
                        {item.date.getDate()}
                      </span>

                      {/* Event Count Badge if multiple */}
                      {hasEvents && (
                        <span className="inline-flex items-center justify-center rounded-full bg-[#173490] px-1.5 py-0.5 text-[9px] font-black text-white shrink-0 shadow-2xs">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Middle / Bottom: Event Title Pill Preview & Indicators */}
                    {hasEvents ? (
                      <div className="mt-1.5 space-y-1 overflow-hidden">
                        {dayEvents.slice(0, 2).map((evt) => (
                          <div
                            key={evt.id}
                            className="flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold border border-blue-200 bg-blue-50 text-blue-800 truncate"
                            title={evt.title}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-[#173490] shrink-0" />
                            <span className="truncate">{evt.title}</span>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <p className="text-[9px] font-bold text-slate-400 px-1 truncate">
                            +{dayEvents.length - 2} more
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="h-4" />
                    )}
                  </button>
                );
              })}
            </div>

          </motion.div>

          {/* Selected Date Event List Panel (4 Cols on Desktop) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-4 rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-[12px_18px_40px_-6px_rgba(15,23,42,0.15)] hover:shadow-[14px_20px_45px_-6px_rgba(23,52,144,0.18)] transition-shadow duration-300 sticky top-24"
          >
            <div className="border-b border-slate-200/80 pb-4 mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#173490]">
                  Events for Selected Date
                </p>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h3>
              </div>
              <span className="inline-flex rounded-full bg-[#173490]/10 border border-[#173490]/20 px-3 py-1 text-xs font-bold text-[#173490]">
                {selectedDateEvents.length} {selectedDateEvents.length === 1 ? "Event" : "Events"}
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 border-4 border-[#173490] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : selectedDateEvents.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <svg
                  className="mx-auto h-12 w-12 text-slate-300 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="font-bold text-slate-700 text-sm">No events on this day</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Select another date on the calendar to view scheduled assemblies or dialogues.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                <AnimatePresence mode="popLayout">
                  {selectedDateEvents.map((evt) => {
                    const isUpcoming = new Date(evt.event_date) > new Date();

                    return (
                      <motion.div
                        key={evt.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 shadow-xs hover:shadow-md hover:border-[#173490]/40 hover:bg-white transition-all duration-300"
                      >
                        <div>
                          <div className="mb-2">
                            <h4 className="text-base font-bold text-slate-900 leading-snug group-hover:text-[#173490] transition-colors">
                              {evt.title}
                            </h4>
                          </div>

                          <div className="mt-2.5 space-y-1.5 text-xs text-slate-500">
                            <p className="flex items-center gap-2 font-medium text-slate-600">
                              <svg className="h-4 w-4 text-[#173490] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {new Date(evt.event_date).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </p>
                            <p className="flex items-center gap-2 font-medium text-slate-600">
                              <FaLocationDot className="h-3.5 w-3.5 text-[#173490] shrink-0 ml-0.5" />
                              <span className="truncate">{evt.location || "Campus Venue"}</span>
                            </p>
                          </div>

                          {evt.description && (
                            <p className="mt-3 text-xs leading-relaxed text-slate-600 border-t border-slate-200/60 pt-2.5">
                              {evt.description}
                            </p>
                          )}

                          <div className="mt-3.5 flex items-center justify-between text-[11px] font-bold border-t border-slate-100 pt-2.5">
                            <span className={`inline-flex items-center gap-1.5 ${isUpcoming ? "text-emerald-600" : "text-slate-400"}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${isUpcoming ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                              {isUpcoming ? "Upcoming Event" : "Concluded"}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

        </div>

      </main>
    </GridShell>
  );
}
