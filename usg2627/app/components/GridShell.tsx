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
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[linear-gradient(180deg,#eef2f6_0%,#ffffff_48%)] text-slate-900">
      {showCircles && <AbstractCircles />}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
