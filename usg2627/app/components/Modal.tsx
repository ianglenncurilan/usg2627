"use client";

import { useEffect, useState, ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  backdropClassName?: string;
}

function readMs(name: string, fallback: number): number {
  if (typeof document === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  className = "",
  backdropClassName = "",
}: ModalProps) {
  // "closed" | "open" | "closing"
  const [state, setState] = useState<"closed" | "open" | "closing">("closed");

  useEffect(() => {
    if (isOpen) {
      setState("open");
    } else if (state === "open") {
      setState("closing");
    }
  }, [isOpen]);

  useEffect(() => {
    if (state !== "closing") return;
    const ms = readMs("--modal-close-dur", 150);
    const id = window.setTimeout(() => {
      setState("closed");
      onClose();
    }, ms);
    return () => window.clearTimeout(id);
  }, [state, onClose]);

  if (state === "closed") return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md transition-opacity duration-200 ${
        state === "open" ? "opacity-100" : "opacity-0"
      } ${backdropClassName}`}
      onClick={() => setState("closing")}
    >
      <div
        className={`t-modal ${state === "open" ? "is-open" : ""} ${
          state === "closing" ? "is-closing" : ""
        } ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
