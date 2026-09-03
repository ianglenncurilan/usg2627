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
            <div className="flex items-center gap-3">
              <img
                src="/usg.jpg"
                alt="USG Logo"
                className="h-10 w-10 sm:h-11 sm:w-11 object-contain shrink-0"
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
                  Cabinet
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
              <a href="https://www.facebook.com/csumain.usg" className="text-slate-400 transition hover:text-white" aria-label="Facebook">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              {/* Twitter */}
              <a href="#" className="text-slate-400 transition hover:text-white" aria-label="Twitter">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="text-slate-400 transition hover:text-white" aria-label="LinkedIn">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
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
