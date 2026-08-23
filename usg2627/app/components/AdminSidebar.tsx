"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const navigation = [
  { name: "Dashboard", href: "/admin" },
  { name: "Documents", href: "/admin/documents" },
  { name: "News & Press", href: "/admin/news" },
  { name: "Events", href: "/admin/events" },
  { name: "Budget Transparency", href: "/admin/budgetary-transparency" },
  { name: "Users", href: "/admin#users" },
  { name: "Settings", href: "/admin#settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="flex h-screen w-64 flex-col bg-[#173490] text-white">


      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (pathname === "/admin" && item.name === "Dashboard");
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${isActive
                      ? "bg-[#E7C609] text-[#173490]"
                      : "text-slate-200 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-4 space-y-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
          Logout
        </button>
        <p className="text-xs text-slate-400">System Version 2.4.0</p>
      </div>
    </aside>
  );
}
