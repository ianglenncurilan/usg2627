import type { ReactNode } from "react";
import AbstractCircles from "./AbstractCircles";

export default function GridShell({
  children,
  showCircles = false,
}: {
  children: ReactNode;
  showCircles?: boolean;
}) {
  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[#ffffff] text-slate-900">
      {/* Animated Ambient Glowing Orbs Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Base Static Radial Gradient Overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
              radial-gradient(620px 320px at 0% 0%, rgba(0,29,61,0.1), transparent 60%),
              radial-gradient(620px 320px at 100% 100%, rgba(255,195,0,0.22), transparent 60%)
            `,
          }}
        />

        {/* Top-Left Animated Deep Blue Floating Glow Orb */}
        <div
          className="absolute -top-[140px] -left-[140px] w-[750px] h-[550px] rounded-full animate-ambient-float-slow opacity-80 filter blur-3xl pointer-events-none z-0"
          style={{
            background: "radial-gradient(circle, rgba(0,29,61,0.18) 0%, rgba(2,7,108,0.05) 45%, transparent 70%)",
          }}
        />

        {/* Bottom-Right Animated Gold Floating Glow Orb */}
        <div
          className="absolute -bottom-[140px] -right-[140px] w-[800px] h-[600px] rounded-full animate-ambient-float-reverse opacity-90 filter blur-3xl pointer-events-none z-0"
          style={{
            background: "radial-gradient(circle, rgba(255,195,0,0.28) 0%, rgba(245,158,11,0.12) 45%, transparent 70%)",
          }}
        />

        {/* Center Accent Pulse Aura */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] rounded-full animate-ambient-pulse-glow opacity-50 filter blur-3xl pointer-events-none z-0"
          style={{
            background: "radial-gradient(circle, rgba(0,29,61,0.06) 0%, rgba(255,195,0,0.08) 50%, transparent 70%)",
          }}
        />
      </div>

      {showCircles && <AbstractCircles />}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
