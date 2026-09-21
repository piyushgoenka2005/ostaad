"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
  className,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[3000] bg-[#0f172a]/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={twMerge(
          clsx(
            "bg-[#FCFAF7] border border-[#d97706]/25 rounded-2xl shadow-[0_30px_70px_-15px_rgba(15,23,42,0.4),0_0_0_1px_rgba(255,255,255,0.6)_inset] p-6 sm:p-7 relative w-full my-auto max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200",
            maxWidth,
            className
          )
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE4DE] mb-5">
          {title && (
            <h3 className="text-lg font-semibold text-[#23384F] tracking-tight">
              {title}
            </h3>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F4] border border-[#EAE4DE] flex items-center justify-center text-[#54524D] hover:text-[#23384F] hover:bg-[#EAE4DE] transition-colors ml-auto"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
