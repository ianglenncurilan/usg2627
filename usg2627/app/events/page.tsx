"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import GridShell from "../components/GridShell";

// Mock fallbacks if Supabase table does not exist or is empty
const staticEvents = [
  {
    id: "1",
    title: "USG Leadership Assembly",
    description: "Annual gathering of student leaders to align on campus priorities, present legislative agenda proposals, and formulate welfare plans.",
    event_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(), // 4.5 days from now
    location: "Student Center Assembly Hall",
  },
  {
    id: "2",
    title: "Constitution Day Forum",
    description: "Panel discussion on representative representation, amendments, and governance procedures governing student organization charters.",
    event_date: "2026-08-02T14:00:00.000Z",
    location: "Senate Hall Annex",
  },
  {
    id: "3",
    title: "Student Services Fair",
    description: "Interactive fair connecting students with student-led committees, auxiliary organizations, and student welfare support services.",
    event_date: "2026-07-17T09:00:00.000Z",
    location: "Campus Plaza",
  }
];

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
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

  return (
    <div className="mt-6 grid grid-cols-4 gap-2 text-center">
      <div className="rounded-2xl bg-slate-950 p-3 shadow-md border border-slate-800 flex flex-col justify-center min-w-[60px] animate-pulse">
        <span className="text-2xl font-black tracking-tight text-white">{timeLeft.days}</span>
        <span className="text-[9px] font-bold tracking-wider text-[#E7C609] uppercase">Days</span>
      </div>
      <div className="rounded-2xl bg-slate-950 p-3 shadow-md border border-slate-800 flex flex-col justify-center min-w-[60px]">
        <span className="text-2xl font-black tracking-tight text-white">{String(timeLeft.hours).padStart(2, "0")}</span>
        <span className="text-[9px] font-bold tracking-wider text-[#E7C609] uppercase">Hours</span>
      </div>
      <div className="rounded-2xl bg-slate-950 p-3 shadow-md border border-slate-800 flex flex-col justify-center min-w-[60px]">
        <span className="text-2xl font-black tracking-tight text-white">{String(timeLeft.minutes).padStart(2, "0")}</span>
        <span className="text-[9px] font-bold tracking-wider text-[#E7C609] uppercase">Mins</span>
      </div>
      <div className="rounded-2xl bg-slate-950 p-3 shadow-md border border-slate-800 flex flex-col justify-center min-w-[60px]">
        <span className="text-2xl font-black tracking-tight text-rose-500">{String(timeLeft.seconds).padStart(2, "0")}</span>
        <span className="text-[9px] font-bold tracking-wider text-[#E7C609] uppercase">Secs</span>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [events, setEvents] = useState<any[]>(staticEvents);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("event_date", { ascending: true });

        if (error) {
          console.error("Error fetching events:", error);
          return;
        }

        if (data && data.length > 0) {
          setEvents(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchEvents();
  }, []);

  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.event_date) > now);
  const pastEvents = events.filter((e) => new Date(e.event_date) <= now).reverse(); // Show most recent past events first

  const displayedEvents = activeTab === "upcoming" ? upcomingEvents : pastEvents;

  return (
    <GridShell>
      <main className="mx-auto max-w-6xl px-6 py-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-slate-200 pb-8">
          <div>
            <h1 className="text-5xl font-black tracking-[-0.06em] text-slate-900">
              Campus Events & Forums
            </h1>
            <p className="mt-3 text-lg text-slate-600">
              Keep track of student assemblies, policy dialogues, and committee summits
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1.5 self-start">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition cursor-pointer ${
                activeTab === "upcoming"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Upcoming ({upcomingEvents.length})
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition cursor-pointer ${
                activeTab === "past"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Past Events ({pastEvents.length})
            </button>
          </div>
        </div>

        {/* Events Grid List */}
        {displayedEvents.length === 0 ? (
          <div className="mt-16 text-center text-slate-500 py-12 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <svg
              className="mx-auto h-12 w-12 text-slate-400 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-bold text-slate-800">No events scheduled</h3>
            <p className="mt-1 text-slate-500">There are no {activeTab} events registered in the system right now.</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {displayedEvents.map((event) => (
              <div
                key={event.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm hover:shadow-md transition hover:-translate-y-0.5 duration-300"
              >
                <div>
                  {/* Badge & Location */}
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                        activeTab === "upcoming"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {activeTab === "upcoming" && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                      )}
                      {activeTab === "upcoming" ? "Upcoming" : "Past Event"}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-medium max-w-[140px] truncate" title={event.location}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      {event.location}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-[#173490] transition">
                    {event.title}
                  </h2>

                  {/* Date Display */}
                  <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    {new Date(event.event_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>

                  {/* Description */}
                  <p className="mt-4 text-sm leading-6 text-slate-600 line-clamp-4">
                    {event.description}
                  </p>
                </div>

                {/* Countdown Timer Animation */}
                {activeTab === "upcoming" && (
                  <CountdownTimer targetDate={event.event_date} />
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </GridShell>
  );
}
