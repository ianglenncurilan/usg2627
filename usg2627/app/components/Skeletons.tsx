"use client";

import React from "react";
import { Ripple } from "@/components/ui/ripple";
import AdminSidebar from "./AdminSidebar";

export { Ripple };

export function RippleLoader({ text = "Loading USG System..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 text-center my-auto">
      <Ripple className="w-16 h-16 text-[#173490]" />
      {text && (
        <p className="text-xs font-bold text-slate-600 tracking-wider uppercase font-mono animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

export function PageSkeleton({ text }: { text?: string }) {
  return (
    <div className="min-h-[calc(100vh-140px)] w-full flex flex-col items-center justify-center p-6 my-auto">
      <RippleLoader text={text || "Loading Page Content..."} />
    </div>
  );
}

export function AdminSkeleton({ text }: { text?: string }) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <main className="flex-1 min-w-0 flex items-center justify-center p-6 sm:p-12 min-h-screen my-auto">
        <RippleLoader text={text || "Loading Admin Portal..."} />
      </main>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return <RippleLoader text="Fetching Records..." />;
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return <RippleLoader text="Loading Table Data..." />;
}

export function OrgChartSkeleton() {
  return <RippleLoader text="Loading Organizational Charts..." />;
}

export function HeroSkeleton() {
  return (
    <div className="relative overflow-hidden bg-[#02076C] py-20 text-white shadow-xl flex flex-col items-center justify-center">
      <Ripple className="w-14 h-14 text-[#E7C609] mb-4" />
      <p className="text-xs font-mono font-bold uppercase tracking-wider text-blue-200 animate-pulse">
        Loading Section...
      </p>
    </div>
  );
}
