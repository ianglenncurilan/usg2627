"use client";

import { useState } from "react";
import Link from "next/link";
import { DropdownMenuSelect } from "@/components/ui/dropdown-menu";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Senate", href: "/senate" },
  { name: "Committees", href: "/committees" },
  { name: "Events", href: "/events" },
];

const categoryOptions = [
  "Memorandum",
  "Resolutions",
  "Executive Order",
  "Special Order",
];

interface HeaderProps {
  subtitle?: string;
}

export default function Header({ subtitle = "Official Portal" }: HeaderProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-[#173490]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E7C609] text-sm font-black text-[#173490] shadow-sm">
            USG
          </div>
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
          <DropdownMenuSelect
            variant="header"
            triggerLabel="USG Documents"
            options={categoryOptions}
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            placeholder="Filter by category"
          />
        </nav>

        <Link
          href="/admin"
          className="rounded-full bg-[#E7C609] px-5 py-2.5 text-sm font-bold text-[#173490] transition hover:brightness-95"
        >
          Admin Login
        </Link>
      </div>
    </header>
  );
}
