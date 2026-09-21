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
    <div className="fixed bottom-[84px] md:bottom-5 right-4 left-4 md:left-auto md:right-5 md:max-w-md z-[200] bg-[#162433] text-white p-5 rounded-2xl border border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-3.5 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[#A87545]/20 text-[#A87545] flex items-center justify-center shrink-0 border border-[#A87545]/30">
          <ShieldCheck size={20} />
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
      <div className="flex items-center justify-end gap-2.5 text-xs font-mono">
        <button
          type="button"
          onClick={handleDecline}
          className="px-3.5 py-2 rounded-xl border border-white/20 text-white/80 hover:text-white hover:bg-white/10 active:scale-[0.98] transition-all cursor-pointer font-medium"
        >
          Essential Only
        </button>
        <button
          type="button"
          onClick={handleAccept}
          className="px-4 py-2 rounded-xl bg-[#A87545] text-white font-semibold hover:bg-[#BA8B5E] active:scale-[0.98] shadow-md transition-all cursor-pointer"
        >
          Accept All
        </button>
      </div>
    </div>
  );
};
