"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  Building2,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/hooks/useAuth";

const INQUIRY_TYPES = [
  "Material Procurement",
  "Clinker Rate Lock",
  "BOQ & Spec Verification",
  "Site Quality Audit",
  "General Inquiry"
];

export default function ContactPage() {
  const { user, profile, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Material Procurement",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Auto-fill logged in user info
  useEffect(() => {
    if (isAuthenticated && (user || profile)) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user?.displayName || profile?.displayName || "",
        email: prev.email || user?.email || profile?.email || ""
      }));
    }
  }, [isAuthenticated, user, profile]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const accessKey =
        process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ||
        process.env.WEB3FORMS_ACCESS_KEY ||
        "6d71ee60-2f5a-436e-b445-ec657bf48f2a";

      const payload = {
        access_key: accessKey,
        from_name: "Ostaad Direct Desk",
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        subject: `[Ostaad Contact] ${formData.subject} - ${formData.name}`
      };

      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        throw new Error(data.message || "Failed to send message.");
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Submission failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-24 px-4 md:px-[4.5%] max-w-[1360px] mx-auto min-h-screen">
      {/* Header Banner */}
      <div className="max-w-2xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F4] border border-[#EAE4DE] font-mono text-[11px] uppercase tracking-[0.16em] text-[#A87545] mb-4 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#7C8764] animate-pulse" />
          <span>Materials & Engineering Desk</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-semibold text-[#23384F] tracking-tight leading-[1.15]">
          Direct Line to Ostaad Auditors
        </h1>
        <p className="text-sm md:text-base text-[#54524D] mt-4 leading-relaxed font-normal">
          Submit drawing schedules, lock mill-direct clinker rates, or schedule an on-site structural material quality audit with our certified engineers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Side: Contact Information & Desk Details */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Info Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-white border border-[#EAE4DE] shadow-[0_10px_30px_rgba(35,56,79,0.04)] space-y-6">
            <h2 className="text-xs font-mono uppercase tracking-[0.18em] text-[#B8A18B] font-semibold">
              Verified Direct Channels
            </h2>

            {/* Email Contact Item */}
            <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[#FAF7F4] border border-[#EAE4DE]/80 hover:border-[#23384F]/30 transition-colors">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#23384F] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Mail size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#B8A18B] uppercase tracking-wider block font-medium">
                    Direct Desk Email
                  </span>
                  <a
                    href="mailto:contact@ostaad.in"
                    className="text-sm font-semibold text-[#23384F] hover:text-[#A87545] transition-colors block mt-0.5"
                  >
                    contact@ostaad.in
                  </a>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard("contact@ostaad.in", "email")}
                className="p-2 rounded-lg bg-white border border-[#EAE4DE] text-[#54524D] hover:text-[#23384F] hover:border-[#23384F] transition-all"
                title="Copy Email"
              >
                {copiedField === "email" ? (
                  <Check size={14} className="text-emerald-600" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>

            {/* Phone Contact Item */}
            <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[#FAF7F4] border border-[#EAE4DE]/80 hover:border-[#23384F]/30 transition-colors">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#7C8764] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Phone size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#B8A18B] uppercase tracking-wider block font-medium">
                    Materials Hotline (Toll-Free)
                  </span>
                  <a
                    href="tel:+918006782236"
                    className="text-sm font-semibold text-[#23384F] font-mono hover:text-[#7C8764] transition-colors block mt-0.5"
                  >
                    +91 (0) 800-OSTAAD-MTC
                  </a>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard("+918006782236", "phone")}
                className="p-2 rounded-lg bg-white border border-[#EAE4DE] text-[#54524D] hover:text-[#23384F] hover:border-[#23384F] transition-all"
                title="Copy Phone"
              >
                {copiedField === "phone" ? (
                  <Check size={14} className="text-emerald-600" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>

            {/* Location Corridor Item */}
            <div className="p-4 rounded-2xl bg-[#FAF7F4] border border-[#EAE4DE]/80 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#A87545] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <MapPin size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#B8A18B] uppercase tracking-wider block font-medium">
                    Regional Mill Corridor
                  </span>
                  <span className="text-xs font-semibold text-[#23384F] block">
                    Eastern & Central India Direct Clinker Corridor
                  </span>
                </div>
              </div>
              <p className="text-[11.5px] text-[#54524D] pl-[52px] leading-relaxed">
                Dispatch points: Kolkata Port Hub, Durgapur Industrial Corridor & Raipur Clinker Exchange.
              </p>
            </div>

            {/* SLA & Service Hours Info */}
            <div className="pt-2 border-t border-[#EAE4DE] grid grid-cols-2 gap-3 text-xs text-[#54524D]">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-[#7C8764] shrink-0" />
                <span>Mon–Sat, 8am–8pm</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-[#23384F] shrink-0" />
                <span>ISO 9001 Audited</span>
              </div>
            </div>
          </div>

          {/* Quick BOQ Action Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#23384F] to-[#162433] text-white shadow-lg space-y-3 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10">
              <Building2 size={140} />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white font-mono text-[10px] tracking-wider uppercase backdrop-blur-sm">
              <Sparkles size={11} className="text-[#BA8B5E]" />
              <span>Instant Estimation</span>
            </div>
            <h3 className="text-lg font-medium tracking-tight">Need a quick bill of quantities?</h3>
            <p className="text-xs text-white/80 leading-relaxed max-w-sm">
              Use our live material quantity estimator to compute bag counts, sand volumes, and tile requirements in real-time.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#FAF7F4] hover:text-[#BA8B5E] pt-2 transition-colors group"
            >
              <span>Explore Materials & Live Estimator</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Right Side: Enhanced Contact & Submission Form */}
        <div className="lg:col-span-7">
          <div className="p-6 md:p-10 rounded-3xl bg-white border border-[#EAE4DE] shadow-[0_12px_36px_rgba(35,56,79,0.06)] relative">
            {submitted ? (
              <div className="text-center py-12 px-4 space-y-5">
                <div className="w-16 h-16 rounded-full bg-[#7C8764]/15 text-[#7C8764] flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 size={36} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#23384F] tracking-tight">
                    Inquiry Dispatched Successfully
                  </h3>
                  <p className="text-sm text-[#54524D] max-w-md mx-auto leading-relaxed">
                    Thank you, <span className="font-semibold text-[#23384F]">{formData.name}</span>. Your requirements have been routed directly to our materials engineering desk.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF7F4] border border-[#EAE4DE] max-w-sm mx-auto text-left space-y-2 text-xs">
                  <div className="flex justify-between text-[#B8A18B] font-mono text-[10px] uppercase">
                    <span>Target Response SLA</span>
                    <span className="text-[#7C8764] font-semibold">Under 4 Hours</span>
                  </div>
                  <div className="text-[#23384F] font-medium">
                    Subject: <span className="text-[#54524D]">{formData.subject}</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap justify-center gap-3">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: user?.displayName || "",
                        email: user?.email || "",
                        phone: "",
                        subject: "Material Procurement",
                        message: ""
                      });
                    }}
                  >
                    Send Another Message
                  </Button>
                  <Link href="/products">
                    <Button variant="primary" size="md" hasArrow>
                      View Product Catalog
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-[#23384F] tracking-tight">
                    Send a Direct Specification Note
                  </h2>
                  <p className="text-xs text-[#54524D] mt-1">
                    Fill in your project parameters and an auditor will reply with technical data and delivery terms.
                  </p>
                </div>

                {/* Name and Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B8A18B] font-semibold mb-1.5">
                      Your Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Piyush Goenka"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#EAE4DE] bg-[#FAF7F4] text-xs md:text-sm text-[#23384F] placeholder-[#B8A18B] focus:outline-none focus:ring-2 focus:ring-[#23384F]/10 focus:border-[#23384F] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B8A18B] font-semibold mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. you@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#EAE4DE] bg-[#FAF7F4] text-xs md:text-sm text-[#23384F] placeholder-[#B8A18B] focus:outline-none focus:ring-2 focus:ring-[#23384F]/10 focus:border-[#23384F] transition-all"
                    />
                  </div>
                </div>

                {/* Phone and Inquiry Category Dropdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B8A18B] font-semibold mb-1.5">
                      Phone / WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#EAE4DE] bg-[#FAF7F4] text-xs md:text-sm text-[#23384F] placeholder-[#B8A18B] focus:outline-none focus:ring-2 focus:ring-[#23384F]/10 focus:border-[#23384F] transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B8A18B] font-semibold mb-1.5">
                      Inquiry Category / Topic <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border border-[#EAE4DE] bg-[#FAF7F4] text-xs md:text-sm text-[#23384F] font-medium focus:outline-none focus:ring-2 focus:ring-[#23384F]/10 focus:border-[#23384F] transition-all cursor-pointer"
                      >
                        {INQUIRY_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B8A18B] pointer-events-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Message / Specifications */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#B8A18B] font-semibold">
                      Project Requirements / Drawing Notes <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10.5px] text-[#B8A18B] font-mono">Min 10 characters</span>
                  </div>
                  <textarea
                    rows={4}
                    required
                    minLength={10}
                    placeholder="Provide details such as project location, square footage, structural grade required (e.g. OPC 53, IS 710 Plywood), or timeline..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#EAE4DE] bg-[#FAF7F4] text-xs md:text-sm text-[#23384F] placeholder-[#B8A18B] focus:outline-none focus:ring-2 focus:ring-[#23384F]/10 focus:border-[#23384F] transition-all resize-y"
                  />
                </div>

                {errorMsg && (
                  <div className="p-4 bg-red-50 text-red-700 text-xs font-mono rounded-xl border border-red-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* High Contrast, Bold Submit Button with Tactile Hover */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#23384F] text-white text-sm font-semibold hover:bg-[#162433] active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(35,56,79,0.28)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-white" />
                        <span>Transmitting to Engineering Desk...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} className="text-white" />
                        <span>Submit Engineering Inquiry</span>
                        <ArrowRight size={15} className="text-white/70" />
                      </>
                    )}
                  </button>

                  <span className="text-[11px] text-[#B8A18B] font-mono flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#7C8764]" />
                    <span>Direct end-to-end encrypted dispatch</span>
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
