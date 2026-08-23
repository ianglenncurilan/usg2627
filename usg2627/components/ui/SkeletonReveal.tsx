"use client";

import { ReactNode } from "react";

interface SkeletonRevealProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  className?: string;
  isPulsing?: boolean;
}

export function SkeletonReveal({
  isLoading,
  skeleton,
  children,
  className = "",
  isPulsing = true,
}: SkeletonRevealProps) {
  return (
    <div
      className={`t-skel ${!isLoading ? "is-revealed" : ""} ${className}`}
      data-state={isLoading ? "loading" : "revealed"}
    >
      <div className={`t-skel-skeleton ${isPulsing && isLoading ? "is-pulsing" : ""}`}>
        {skeleton}
      </div>
      <div className="t-skel-content">{children}</div>
    </div>
  );
}

export default SkeletonReveal;
