import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "terracotta" | "secondary" | "outline" | "danger" | "dark" | "light";
  size?: "sm" | "md" | "lg";
  hasArrow?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  hasArrow = false,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium tracking-wide rounded-xl transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed text-center";

  const sizeStyles = {
    sm: "px-4 py-2 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base font-semibold",
  };

  const variantStyles = {
    primary:
      "bg-[#23384F] text-white hover:bg-[#162433] shadow-[0_4px_16px_rgba(35,56,79,0.28)] active:scale-[0.98] border border-[#31465F]",
    terracotta:
      "bg-[#A87545] text-white hover:bg-[#8B5C30] shadow-[0_4px_16px_rgba(168,117,69,0.3)] active:scale-[0.98] border border-[#BA8B5E]",
    secondary:
      "bg-white text-[#23384F] border border-[#EAE4DE] hover:border-[#23384F] hover:bg-[#FAF7F4] shadow-sm active:scale-[0.98]",
    outline:
      "bg-transparent text-[#23384F] border-2 border-[#23384F] hover:bg-[#23384F] hover:text-white active:scale-[0.98]",
    danger:
      "bg-red-600 text-white hover:bg-red-700 shadow-[0_4px_14px_rgba(220,38,38,0.25)] active:scale-[0.98]",
    dark:
      "bg-[#162433] text-white hover:bg-[#23384F] shadow-[0_6px_20px_rgba(0,0,0,0.15)]",
    light:
      "bg-[#FAF7F4] text-[#23384F] border border-[#EAE4DE] hover:bg-white hover:border-[#B8A18B]",
  };

  return (
    <button
      className={twMerge(
        clsx(baseStyles, sizeStyles[size], variantStyles[variant], className)
      )}
      {...props}
    >
      <span className="inline-flex items-center gap-2">{children}</span>
      {hasArrow && (
        <span className="inline-block transition-transform duration-200 group-hover:translate-x-1 font-bold">
          →
        </span>
      )}
    </button>
  );
};

