"use client";

import React from "react";
import Image from "next/image";

interface AbstractCirclesProps {
  className?: string;
}

// Side spot configuration for 12.png placements along the background edges
const sideSpots = [
  // Left side spots
  { side: "left", top: "18%", left: "-70px", right: "auto", size: 320, rotate: 0, opacity: 0.22, animDuration: "9s", delay: "0s" },
  { side: "left", top: "36%", left: "15px", right: "auto", size: 210, rotate: 0, opacity: 0.16, animDuration: "13s", delay: "2s" },
  { side: "left", top: "56%", left: "-55px", right: "auto", size: 350, rotate: 0, opacity: 0.24, animDuration: "10s", delay: "1s" },
  { side: "left", top: "76%", left: "10px", right: "auto", size: 240, rotate: 0, opacity: 0.18, animDuration: "12s", delay: "3s" },
  { side: "left", top: "92%", left: "-40px", right: "auto", size: 280, rotate: 0, opacity: 0.15, animDuration: "14s", delay: "0.5s" },
  
  // Right side spots
  { side: "right", top: "22%", left: "auto", right: "-60px", size: 340, rotate: 0, opacity: 0.22, animDuration: "11s", delay: "1.5s" },
  { side: "right", top: "42%", left: "auto", right: "20px", size: 220, rotate: 0, opacity: 0.17, animDuration: "15s", delay: "0.5s" },
  { side: "right", top: "66%", left: "auto", right: "-70px", size: 380, rotate: 0, opacity: 0.25, animDuration: "10s", delay: "2.5s" },
  { side: "right", top: "86%", left: "auto", right: "15px", size: 230, rotate: 0, opacity: 0.16, animDuration: "13s", delay: "1s" },
];

export default function AbstractCircles({ className = "" }: AbstractCirclesProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none z-0 ${className}`}
      aria-hidden="true"
    >

      {/* Scattered 12.png elements replacing abstract circles along the sides */}
      {sideSpots.map((spot, index) => (
        <div
          key={index}
          className="absolute pointer-events-none transition-all duration-700 animate-pulse"
          style={{
            top: spot.top,
            left: spot.left !== "auto" ? spot.left : undefined,
            right: spot.right !== "auto" ? spot.right : undefined,
            width: `${spot.size}px`,
            height: `${spot.size}px`,
            transform: `rotate(${spot.rotate}deg)`,
            opacity: spot.opacity,
            animationDuration: spot.animDuration,
            animationDelay: spot.delay,
          }}
        >
          <Image
            src="/12.png"
            alt=""
            width={spot.size}
            height={spot.size}
            className="w-full h-full object-contain filter brightness-0 dark:brightness-200 drop-shadow-[0_0_12px_rgba(2,7,108,0.25)]"
            priority={index < 2}
          />
        </div>
      ))}
    </div>
  );
}



