"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface FiledBill {
  number: string;
  title: string;
  description?: string;
}

export interface ProfileCardProps {
  name: string;
  role: string;
  department?: string;
  sectionLabel?: string;
  directLine?: string;
  email?: string;
  roomAddress?: string;
  avatarSrc?: string;
  filedBills?: FiledBill[];
  initiatives?: string[];
  facebookUrl?: string;
  xUrl?: string;
  instagramUrl?: string;
  websiteUrl?: string;
}

function toTitleCase(str: string): string {
  if (!str) return "";
  return str
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (!word) return "";
      if (/^(iii|ii|iv|v|vi|vii|viii|ix|x)$/i.test(word)) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function formatPhoneNumber(phone?: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.length === 11 && cleaned.startsWith("09")) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

export default function ProfileCard({
  name,
  role,
  department = "University Student Government",
  sectionLabel,
  directLine,
  email,
  roomAddress = "Room 502, Legislative Building",
  avatarSrc,
  filedBills,
  facebookUrl = "#",
  xUrl = "#",
  instagramUrl = "#",
  websiteUrl = "#",
}: ProfileCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const formattedName = toTitleCase(name);

  // Compute upper right section label automatically if not explicitly provided
  const roleLower = (role || "").toLowerCase().trim();
  const isExecutive =
    roleLower === "usg adviser" ||
    roleLower === "adviser" ||
    roleLower === "usg president" ||
    roleLower === "president" ||
    roleLower === "usg vice president" ||
    roleLower === "vice president" ||
    roleLower === "usg executive secretary" ||
    roleLower === "executive secretary" ||
    roleLower === "usg treasurer" ||
    roleLower === "treasurer" ||
    roleLower === "usg auditor" ||
    roleLower === "auditor";

  const computedSectionLabel =
    sectionLabel || (isExecutive ? "USG Executive" : "Legislative Member");

  // Default sample filed bills if none provided
  const activeFiledBills: FiledBill[] = filedBills || [
    {
      number: "Senate Bill No. 2627-021",
      title: "AN ACT ESTABLISHING COLLEGE-BASED MEDICAL RESPONSE TEAMS IN EACH COLLEGE OF CARAGA STATE UNIVERSITY – MAIN CAMPUS",
      description: "Mandates the creation and training of certified student first-responder units equipped with basic emergency kits across all college departments to ensure immediate health care support during campus activities.",
    },
    {
      number: "Senate Bill No. 2627-022",
      title: "AN ACT INSTITUTIONALIZING A SEMESTRAL MENTAL HEALTH AND WELLNESS TRIVIA CHALLENGE FOR STUDENTS OF CARAGA STATE UNIVERSITY – MAIN CAMPUS",
      description: "Establishes semestral campus-wide mental health advocacy events and interactive wellness trivia programs aimed at promoting psychological well-being and student support awareness.",
    },
  ];

  return (
    <>
      <motion.div
        whileHover={{
          y: -5,
          boxShadow: "0 20px 30px -10px rgba(23,52,144,0.12)",
          transition: { type: "spring", stiffness: 350, damping: 25 },
        }}
        whileTap={{ scale: 0.99 }}
        className="group overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:border-[#173490]/40 flex flex-col sm:flex-row h-full min-h-[260px] relative"
      >
        {/* Left Side: Full-height Portrait Photo */}
        <div className="relative w-full sm:w-2/5 md:w-5/12 flex-shrink-0 bg-slate-100 min-h-[220px] sm:min-h-full overflow-hidden">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={formattedName}
              className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full min-h-[220px] items-center justify-center bg-gradient-to-br from-[#173490] to-[#1e4bb8] text-3xl font-extrabold text-white">
              {formattedName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
          )}
        </div>

        {/* Right Side: Details & Actions */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between min-w-0">
          <div>
            {/* Top Right Section Badge & Name Row */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight group-hover:text-[#173490] transition line-clamp-2">
                {formattedName}
              </h3>
              <span className="inline-flex items-center gap-1 shrink-0 rounded-full bg-[#173490]/10 border border-[#173490]/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#173490] shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E7C609]" />
                {computedSectionLabel}
              </span>
            </div>

            {/* Role Badge */}
            <div className="mt-2 inline-block">
              <span className="inline-block rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-[#173490] border border-blue-100/80">
                {role}
              </span>
            </div>

            {/* Divider Line */}
            <div className="my-3 border-t border-slate-100" />

            {/* Contact Information List */}
            <div className="space-y-3 text-sm text-slate-800 font-sans">
              {department && (
                <div className="flex items-start gap-2.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#173490] flex-shrink-0 mt-0.5"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <div className="leading-snug">
                    <span className="font-bold text-slate-900">Department: </span>
                    <span className="text-slate-700 font-medium">{department}</span>
                  </div>
                </div>
              )}

              {directLine && (
                <div className="flex items-start gap-2.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#173490] flex-shrink-0 mt-0.5"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.96a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <div className="leading-snug">
                    <span className="font-bold text-slate-900">Phone Number: </span>
                    <span className="font-medium">{formatPhoneNumber(directLine)}</span>
                  </div>
                </div>
              )}

              {email && (
                <div className="flex items-start gap-2.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#173490] flex-shrink-0 mt-0.5"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <div className="leading-snug truncate">
                    <span className="text-[#173490] font-bold hover:underline cursor-pointer">
                      {email}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Section: Social Icons & View Profile Button */}
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
            {/* Social Media Buttons Row */}
            <div className="flex items-center justify-center">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full hover:opacity-80 transition"
                aria-label="Facebook Profile"
              >
                <img src="/facebook-icon.svg" alt="Facebook Profile" className="h-8 w-8" />
              </a>
            </div>

            {/* View Profile Pill Outline Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 rounded-full border-2 border-[#173490] bg-white px-5 py-2 text-xs sm:text-sm font-bold text-[#173490] hover:bg-[#173490] hover:text-white transition-colors duration-200 cursor-pointer shadow-2xs group/btn"
            >
              <span>View Profile</span>
              <span className="text-base leading-none transition-transform group-hover/btn:translate-x-1">›</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* View Profile Modal with Framer Motion AnimatePresence */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 pt-20 sm:pt-24 bg-slate-900/75 backdrop-blur-md overflow-y-auto"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="relative my-auto w-full max-w-3xl sm:max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-5 top-5 z-10 rounded-full bg-white/90 p-2 text-slate-600 hover:bg-white hover:text-slate-900 shadow-md transition cursor-pointer"
                aria-label="Close modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>

              {/* Modal Header Banner */}
              <div className="relative bg-gradient-to-r from-sky-100 via-blue-50 to-indigo-100 p-6 sm:p-8 border-b border-sky-200/60">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 pr-8">
                  {/* Large Avatar */}
                  <div className="h-28 w-28 sm:h-32 sm:w-32 flex-shrink-0 rounded-full border-4 border-white ring-4 ring-[#173490]/25 shadow-md overflow-hidden bg-gradient-to-br from-[#173490] to-[#1e4bb8]">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white">
                        {name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                    )}
                  </div>

                  {/* Member Title Banner Pill */}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="inline-block rounded-2xl bg-white/80 backdrop-blur-sm px-5 py-3 shadow-xs border border-sky-200/80">
                      <h2 className="text-2xl sm:text-3xl font-black tracking-wide text-slate-900">
                        {formattedName}
                      </h2>
                      <p className="mt-1 text-sm sm:text-base font-bold italic text-[#173490]">
                        {role}
                      </p>
                    </div>
                    <p className="mt-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600">
                      {department}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto space-y-6">

                {/* FILED BILL / FILED BILLS SECTION */}
                <div>
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[#173490]"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" x2="8" y1="13" y2="13" />
                      <line x1="16" x2="8" y1="17" y2="17" />
                    </svg>
                    <span>FILED BILL:</span>
                  </h3>

                  <div className="space-y-4">
                    {activeFiledBills.map((bill, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08, duration: 0.3 }}
                        whileHover={{ y: -2, backgroundColor: "rgba(248,250,252,1)" }}
                        className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-center shadow-xs transition hover:border-slate-300"
                      >
                        <h4 className="text-sm sm:text-base font-bold text-slate-900">
                          {bill.number}
                        </h4>
                        <p className="mt-2 text-xs sm:text-sm font-semibold uppercase leading-relaxed text-slate-800 tracking-wide max-w-2xl mx-auto">
                          {bill.title}
                        </p>
                        {bill.description && (
                          <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/80 pt-2.5 max-w-2xl mx-auto italic font-medium">
                            "{bill.description}"
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="pt-2 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Officer Contact Details
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {directLine && (
                      <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Direct Contact
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-800">{directLine}</p>
                      </div>
                    )}

                    {email && (
                      <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Official Email
                        </p>
                        <p className="mt-1 text-xs font-bold text-[#173490] truncate">{email}</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:px-8 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl bg-[#173490] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#102a72] cursor-pointer shadow-md"
                >
                  Close Profile
                </motion.button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
