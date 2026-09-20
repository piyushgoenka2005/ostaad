import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "dark" | "light";
  size?: "sm" | "md" | "lg";
  hasArrow?: boolean;
  asChild?: boolean;
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
    "inline-flex items-center justify-center gap-2 font-medium tracking-wide rounded-xl transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeStyles = {
    sm: "px-3.5 py-2 text-xs",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  const variantStyles = {
    primary:
      "bg-[#23384F] text-white hover:bg-[#31465F] shadow-[0_10px_24px_rgba(35,56,79,0.22)] active:scale-[0.98]",
    secondary:
      "bg-[rgba(253,251,249,0.7)] text-[#23384F] border border-[#B8A18B] hover:bg-[#FDFBF9] hover:border-[#23384F] active:scale-[0.98]",
    outline:
      "bg-transparent text-[#23384F] border border-[#B8A18B] hover:border-[#23384F] hover:bg-[#FAF7F4]",
    danger:
      "bg-red-600 text-white hover:bg-red-700 shadow-[0_4px_14px_rgba(220,38,38,0.25)] active:scale-[0.98]",
    dark:
      "bg-[#192C40] text-white hover:bg-[#23384F] shadow-[0_6px_20px_rgba(0,0,0,0.15)]",
    light:
      "bg-white text-[#23384F] border border-[rgba(184,161,139,0.42)] hover:border-[#23384F]",
  };

  return (
    <button
      className={twMerge(
        clsx(baseStyles, sizeStyles[size], variantStyles[variant], className)
      )}
      {...props}
    >
      <span>{children}</span>
      {hasArrow && (
        <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
          →
        </span>
      )}
    </button>
  );
};
