"use client";

import Link from "next/link";
import React from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    href: string;
  };
  children?: React.ReactNode;
}

export default function SectionHeader({
  title,
  subtitle,
  action,
  children,
}: SectionHeaderProps) {
  return (
    <div className="w-screen relative left-1/2 -translate-x-1/2 mb-10 bg-white px-6 py-8 sm:py-10 text-center shadow-sm border-y border-slate-200/80 overflow-hidden select-none">
      {/* Distinct Large Curved Background Circles in subtle blue tint */}
      <div className="absolute -top-[200px] -left-[160px] w-[520px] h-[520px] rounded-full bg-[#02076C]/[0.04] pointer-events-none" />
      <div className="absolute -bottom-[220px] -right-[140px] w-[500px] h-[500px] rounded-full bg-[#02076C]/[0.04] pointer-events-none" />
      <div className="absolute -bottom-[280px] -right-[60px] w-[580px] h-[580px] rounded-full bg-blue-500/[0.03] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto px-6">
        {/* Modern clean Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#02076C] tracking-tight uppercase">
          {title}
        </h2>

        {/* Simple modern subtitle */}
        {subtitle && (
          <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium tracking-wide max-w-xl">
            {subtitle}
          </p>
        )}

        {/* Modern simple action button */}
        {action && (
          <div className="mt-4">
            <Link
              href={action.href}
              className="inline-flex items-center gap-2 rounded-lg bg-[#02076C] px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#173490] hover:shadow-md active:scale-95"
            >
              <span>{action.label}</span>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
