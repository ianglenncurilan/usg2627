"use client";

import Link from "next/link";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Legislative", href: "/legislative" },
  { name: "Cabinet", href: "/cabinet" },
  { name: "Documents", href: "/documents" },
  { name: "Events", href: "/events" },
  { name: "Transparency", href: "/budgetary-transparency" },
];

interface HeaderProps {
  subtitle?: string;
}

export default function Header({ subtitle = "Official Portal" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-[#173490]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            src="/usg.jpg"
            alt="USG Logo"
            className="h-12 w-12 rounded-full object-cover"
          />
          <div>
            <p className="text-lg font-bold text-white">
              University Student Government
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300">
              {subtitle}
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-7 text-sm font-medium text-white md:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="transition hover:text-[#E7C609]"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <button className="rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
      </div>
    </header>
  );
}
