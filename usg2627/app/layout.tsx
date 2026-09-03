import type { Metadata } from "next";
import { Roboto_Condensed, Lora, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "./components/Header";
import Footer from "./components/Footer";

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  variable: "--font-roboto-condensed",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "University Student Government | Official Institutional Portal",
  description:
    "Official institutional portal for the University Student Government of Caraga State University, featuring news, documents, legislative leadership, cabinet, and events.",
  icons: {
    icon: "/usg.jpg",
    shortcut: "/usg.jpg",
    apple: "/usg.jpg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        robotoCondensed.variable,
        lora.variable,
        plusJakartaSans.variable,
        geistMono.variable,
        "font-sans"
      )}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-slate-50 text-slate-900 w-full max-w-full overflow-x-hidden">
        <Header />
        <main className="flex-1 w-full max-w-full overflow-x-hidden">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
