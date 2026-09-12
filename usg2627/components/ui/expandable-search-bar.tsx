"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";

export interface ExpandableSearchBarProps {
  expandDirection?: "left" | "right";
  width?: number;
  placeholder?: string;
  onSearch?: (query: string) => void;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export default function ExpandableSearchBar({
  expandDirection = "left",
  width = 280,
  placeholder = "Search executive...",
  onSearch,
  value: externalValue,
  onChange: externalOnChange,
  className = "",
}: ExpandableSearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [internalValue, setInternalValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const query = externalValue !== undefined ? externalValue : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (externalValue === undefined) {
      setInternalValue(val);
    }
    if (externalOnChange) {
      externalOnChange(e);
    }
    if (onSearch) {
      onSearch(val);
    }
  };

  const handleClear = () => {
    if (externalValue === undefined) {
      setInternalValue("");
    }
    if (onSearch) {
      onSearch("");
    }
    setIsExpanded(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleToggle = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else if (!query) {
      setIsExpanded(false);
      inputRef.current?.blur();
    }
  };

  const isLeft = expandDirection === "left";

  return (
    <div className={`relative inline-flex items-center ${isLeft ? "justify-end" : "justify-start"} ${className}`}>
      <motion.div
        initial={false}
        animate={{
          width: isExpanded || query.length > 0 ? width : 42,
        }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="relative flex items-center h-10 rounded-full bg-white border border-slate-200 shadow-sm overflow-hidden transition-colors hover:border-[#173490]/40 shrink-0"
      >
        <button
          type="button"
          onClick={handleToggle}
          className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-500 hover:text-[#173490] transition cursor-pointer z-10"
          aria-label="Search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsExpanded(true)}
          onBlur={() => {
            if (!query) setIsExpanded(false);
          }}
          placeholder={placeholder}
          className="w-full h-full bg-transparent pl-1 pr-8 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:text-slate-600 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}
      </motion.div>
    </div>
  );
}
