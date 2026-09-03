"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function NavigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideNavAndFooter = pathname?.startsWith("/admin") || pathname?.startsWith("/login");

  return (
    <>
      {!hideNavAndFooter && <Header />}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">{children}</main>
      {!hideNavAndFooter && <Footer />}
    </>
  );
}
