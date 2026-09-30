"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="relative bg-[#02076C] text-white bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: `url('/bot.png')` }}
    >
      {/* Dark overlay to ensure contrast and readability over nav.png */}
      <div className="absolute inset-0 bg-[#02076C]/85 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <img
                src="/usg.webp"
                alt="USG Logo"
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain shrink-0 rounded-full"
              />
              <img
                src="/osr.webp"
                alt="OSR Logo"
                className="h-10 sm:h-12 w-auto object-contain shrink-0 rounded-xl"
              />
              <img
                src="/rise-logo.webp"
                alt="RISE Logo"
                className="h-10 sm:h-12 w-auto object-contain shrink-0 rounded-xl"
              />
              <div className="space-y-0.5">
                <p className="text-xl font-bold leading-tight">USG PORTAL</p>
                <p className="text-xs uppercase tracking-widest text-slate-300">
                  Official Records & Publications
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Providing transparency, legislative accessibility, and official executive action tracking for the entire undergraduate and graduate student body.
            </p>
          </div>

          {/* Documents */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#E7C609]">
              Documents
            </h3>
            <ul className="grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-2 text-sm text-slate-300">
              <li>
                <Link href="/documents?category=Resolution" className="transition hover:text-white block">
                  Resolutions
                </Link>
              </li>
              <li>
                <Link href="/documents?category=Executive Order" className="transition hover:text-white block">
                  Executive Orders
                </Link>
              </li>
              <li>
                <Link href="/documents?category=Administrative Order" className="transition hover:text-white block">
                  Administrative Orders
                </Link>
              </li>
              <li>
                <Link href="/documents?category=Memorandum" className="transition hover:text-white block">
                  Memorandums
                </Link>
              </li>
              <li>
                <Link href="/documents?category=Special Order" className="transition hover:text-white block">
                  Special Orders
                </Link>
              </li>
              <li>
                <Link href="/documents?category=Advisory" className="transition hover:text-white block">
                  Advisories
                </Link>
              </li>
              <li>
                <Link href="/documents?category=Financial Documents" className="transition hover:text-white block">
                  Financial Documents
                </Link>
              </li>
              <li>
                <Link href="/budgetary-transparency" className="transition hover:text-white text-slate-300 block">
                  Budgetary Transparency
                </Link>
              </li>
            </ul>
          </div>

          {/* About Us */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#E7C609]">
              About Us
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link href="/cabinet" className="transition hover:text-white">
                  Executive Branch
                </Link>
              </li>
              <li>
                <Link href="/legislative" className="transition hover:text-white">
                  Legislative Branch
                </Link>
              </li>
              <li>
                <Link href="/about#judiciary" className="transition hover:text-white">
                  Judiciary Branch
                </Link>
              </li>

            </ul>
          </div>

          {/* Contact Office */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#E7C609]">
              Contact Office
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>
                  Ampayon, Butuan City, Philippines, 8600
                </span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Mon - Fri, 9:00 AM - 5:00 PM</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26 a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:usg@carsu.edu.ph" className="transition hover:text-white">
                  usg@carsu.edu.ph
                </a>
              </li>
            </ul>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-700 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-slate-400">
              © 2026 University Student Government. All Rights Reserved. Official Publication Portal.
            </p>
            <div className="flex items-center gap-4">
              {/* Facebook */}
              <a href="https://www.facebook.com/csumain.usg" target="_blank" rel="noopener noreferrer" className="transition hover:opacity-80" aria-label="Facebook">
                <img src="/facebook-icon.svg" alt="Facebook" className="h-5 w-5" />
              </a>
              {/* Admin Login */}
              <Link
                href="/login"
                className="rounded-full bg-[#E7C609] px-4 py-2 text-xs font-bold text-[#02076C] transition hover:brightness-95"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
