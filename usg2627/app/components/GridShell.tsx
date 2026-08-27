import type { ReactNode } from "react";

export default function GridShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[#f8fafc] text-slate-900">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e2e8f0 1px, transparent 1px),
            linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
          `,
          backgroundSize: "20px 30px",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
        }}
      />

      <div className="relative">{children}</div>
    </div>
  );
}
