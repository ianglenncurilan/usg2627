"use client";

import { useState } from "react";

interface ProfileCardProps {
  name: string;
  role: string;
  department?: string;
  directLine?: string;
  email?: string;
  roomAddress?: string;
  avatarSrc?: string;
  bio?: string;
  initiatives?: string[];
}

export default function ProfileCard({
  name,
  role,
  department = "University Student Government",
  directLine,
  email,
  roomAddress,
  avatarSrc,
  bio,
  initiatives = [
    "Student representation and policy enactment",
    "Campus welfare and administrative oversight",
    "Institutional resolution advocacy",
  ],
}: ProfileCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#173490]/30 hover:shadow-md flex flex-col justify-between">
        <div>
          <div className="flex gap-4 items-start">
            {/* Avatar Container */}
            <div className="flex-shrink-0">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-[#173490] to-[#1e4bb8] ring-4 ring-[#173490]/10 overflow-hidden shadow-sm">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={name}
                    className="h-full w-full object-cover"
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
            </div>

            {/* Member Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#173490] transition truncate">
                {name}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <span className="inline-block rounded-full bg-[#173490]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#173490]">
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

          {/* Contact & Office Info (Single Phone Line) */}
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
                <span>Direct Line: {directLine}</span>
              </div>
            )}
            {roomAddress && (
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
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>{roomAddress}</span>
              </div>
            )}
          </div>
        </div>

        {/* Social Icon & View Profile Modal Trigger */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <a
            href="#"
            className="rounded-full bg-[#1877F2] p-2 text-white transition hover:bg-[#166fe5]"
            aria-label="Facebook"
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
          </a>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#173490] hover:text-[#E7C609] transition cursor-pointer group/btn"
          >
            <span>View Profile</span>
            <span className="transition-transform group-hover/btn:translate-x-1">→</span>
          </button>
        </div>
      </div>

      {/* View Profile Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>

            {/* Profile Header */}
            <div className="flex flex-col items-center text-center">
              <div className="h-28 w-28 rounded-full bg-gradient-to-br from-[#173490] to-[#1e4bb8] ring-4 ring-[#173490]/15 overflow-hidden shadow-md">
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

              <h2 className="mt-4 text-2xl font-black text-slate-900">{name}</h2>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                <span className="rounded-full bg-[#173490]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#173490]">
                  {role}
                </span>
              </div>
              <p className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                {department}
              </p>
            </div>

            {/* Detailed Info Cards */}
            <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4 border border-slate-100 text-xs sm:text-sm text-slate-700">
              {directLine && (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-xs text-[#173490]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.96a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Direct Contact</p>
                    <p className="font-semibold text-slate-800">{directLine}</p>
                  </div>
                </div>
              )}

              {roomAddress && (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-xs text-[#173490]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Office Location</p>
                    <p className="font-semibold text-slate-800">{roomAddress}</p>
                  </div>
                </div>
              )}

              {email && (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-xs text-[#173490]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Official Email</p>
                    <p className="font-semibold text-slate-800">{email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Key Focus & Responsibilities */}
            <div className="mt-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#173490] mb-2">
                Mandate & Core Responsibilities
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {initiatives.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#173490] mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Close Modal Footer Action */}
            <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl bg-[#173490] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#1e4bb8] cursor-pointer shadow-md"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
