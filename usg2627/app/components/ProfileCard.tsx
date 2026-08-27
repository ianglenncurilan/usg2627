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
  directLine?: string;
  email?: string;
  roomAddress?: string;
  avatarSrc?: string;
  filedBills?: FiledBill[];
  initiatives?: string[];
}

export default function ProfileCard({
  name,
  role,
  department = "University Student Government",
  directLine,
  email,
  avatarSrc,
  filedBills,
}: ProfileCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          y: -6,
          scale: 1.015,
          boxShadow: "0 20px 30px -10px rgba(23,52,144,0.12)",
          transition: { type: "spring", stiffness: 350, damping: 25 },
        }}
        whileTap={{ scale: 0.99 }}
        className="group overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-300 hover:border-[#173490]/40 flex flex-col justify-between"
      >
        <div>
          <div className="flex gap-4 items-start">
            {/* Avatar Container with Motion */}
            <motion.div
              whileHover={{ scale: 1.08 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="flex-shrink-0"
            >
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-[#173490] to-[#1e4bb8] ring-4 ring-[#173490]/10 overflow-hidden shadow-md">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                    {name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Member Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#173490] transition truncate">
                {name}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <span className="inline-block rounded-full bg-[#173490]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#173490] group-hover:bg-[#173490] group-hover:text-white transition-colors duration-200">
                  {role}
                </span>
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-500 flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#173490] flex-shrink-0"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span className="truncate">{department}</span>
              </p>
            </div>
          </div>

          {/* Contact Line */}
          <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
            {directLine && (
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#173490] flex-shrink-0"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.96a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>Phone Number: {directLine}</span>
              </div>
            )}
            {email && (
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#173490] flex-shrink-0"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span className="truncate">{email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Bar: Social Icon & View Profile Modal Trigger */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <motion.a
            href="#"
            whileHover={{ scale: 1.12, rotate: 4 }}
            whileTap={{ scale: 0.9 }}
            className="rounded-full bg-[#1877F2] p-2 text-white shadow-sm transition hover:bg-[#166fe5]"
            aria-label="Facebook Profile"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </motion.a>

          <motion.button
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#173490] hover:text-[#E7C609] transition cursor-pointer group/btn"
          >
            <span>View Profile</span>
            <span className="transition-transform group-hover/btn:translate-x-1">→</span>
          </motion.button>
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
                      <h2 className="text-2xl sm:text-3xl font-black tracking-wide text-slate-900 uppercase">
                        {name}
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
