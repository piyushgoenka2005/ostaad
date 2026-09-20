"use client";

import React, { useRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hasBeam?: boolean;
  theme?: "default" | "slate" | "sage" | "terracotta";
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className,
  hasBeam = false,
  theme = "default",
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mx", `${x}px`);
    cardRef.current.style.setProperty("--my", `${y}px`);
  };

  const themeStyles = {
    default: "card-hybrid",
    slate: "bg-[#23384F] text-white/95 border-[#23384F] shadow-[9px_9px_24px_rgba(15,25,36,0.35)]",
    sage: "bg-[#7C8764] text-white/95 border-[#7C8764]",
    terracotta: "bg-[#A87545] text-white/95 border-[#A87545]",
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={twMerge(
        clsx(
          "spotlight relative rounded-[18px] p-6 transition-all duration-300",
          themeStyles[theme],
          hasBeam && "beam",
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
