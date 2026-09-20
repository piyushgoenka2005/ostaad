"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";

export const CookieConsent: React.FC = () => {
  const pathname = usePathname();
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("ostaad_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setShowConsent(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("ostaad_cookie_consent", "accepted");
    setShowConsent(false);
  };

  const handleDecline = () => {
    localStorage.setItem("ostaad_cookie_consent", "declined");
    setShowConsent(false);
  };

  if (pathname === "/admin" || (pathname?.startsWith("/admin/") && pathname !== "/admin-login")) {
    return null;
  }

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-5 right-5 left-5 md:left-auto md:max-w-md z-50 bg-[#162433] text-white p-5 rounded-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.35)] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-3.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#A87545]/20 text-[#A87545] flex items-center justify-center shrink-0">
          <ShieldCheck size={18} />
        </div>
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider font-semibold text-white">
            Engineering Telemetry & Cookies
          </h4>
          <p className="text-xs text-white/70 mt-1 leading-relaxed">
            We use technical session storage and performance cookies to maintain verified material rate caches and security sessions.
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-2 text-xs font-mono">
        <button
          type="button"
          onClick={handleDecline}
          className="px-3 py-1.5 rounded-lg border border-white/20 text-white/70 hover:text-white transition-colors"
        >
          Essential Only
        </button>
        <button
          type="button"
          onClick={handleAccept}
          className="px-4 py-1.5 rounded-lg bg-[#A87545] text-white font-medium hover:bg-[#8B5C30] transition-colors"
        >
          Accept All
        </button>
      </div>
    </div>
  );
};
