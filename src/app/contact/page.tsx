"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/common/Button";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Engineering Materials Inquiry",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || "6d71ee60-2f5a-436e-b445-ec657bf48f2a";
      const payload = {
        access_key: accessKey,
        from_name: "Ostaad Contact Desk",
        ...formData
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
      setErrorMsg(error.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 md:px-[4.5%] max-w-[1360px] mx-auto min-h-screen">
      <div className="max-w-xl mb-12">
        <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#B8A18B] mb-3">
          <span className="w-6 h-[1px] bg-current inline-block" />
          <span>Materials & Engineering Desk</span>
        </div>
        <h1 className="text-4xl font-medium text-[#23384F] tracking-tight">
          Direct Line to Ostaad Auditors
        </h1>
        <p className="text-sm text-[#54524D] mt-3 leading-relaxed">
          Submit drawing schedules, request regional clinker rate locks, or speak directly with our materials procurement team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Information */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-[#EAE4DE] space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#23384F]/10 text-[#23384F] flex items-center justify-center shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <span className="text-[10.5px] font-mono text-[#B8A18B] uppercase block">Direct Desk Email</span>
                <a href="mailto:contact@ostaad.in" className="text-sm font-medium text-[#23384F] hover:underline">
                  contact@ostaad.in
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3.5 border-t border-[#EAE4DE] pt-4">
              <div className="w-10 h-10 rounded-xl bg-[#7C8764]/10 text-[#7C8764] flex items-center justify-center shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <span className="text-[10.5px] font-mono text-[#B8A18B] uppercase block">Materials Hotline</span>
                <span className="text-sm font-medium text-[#23384F] font-mono">+91 (0) 800-OSTAAD-MTC</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 border-t border-[#EAE4DE] pt-4">
              <div className="w-10 h-10 rounded-xl bg-[#A87545]/10 text-[#A87545] flex items-center justify-center shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <span className="text-[10.5px] font-mono text-[#B8A18B] uppercase block">Regional Mill Hubs</span>
                <span className="text-xs text-[#54524D]">Eastern & Central India Direct Clinker Corridor</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="p-8 rounded-3xl bg-white border border-[#EAE4DE] shadow-sm">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#7C8764]/20 text-[#7C8764] flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#23384F]">Message Dispatched</h3>
                <p className="text-xs text-[#54524D] max-w-sm mx-auto leading-relaxed">
                  Our engineering materials desk will review your inquiry and follow up within 4 business hours.
                </p>
                <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                  Send Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#B8A18B] font-semibold mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE4DE] bg-[#FAF7F4] text-xs text-[#23384F] focus:outline-none focus:border-[#23384F]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#B8A18B] font-semibold mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE4DE] bg-[#FAF7F4] text-xs text-[#23384F] focus:outline-none focus:border-[#23384F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#B8A18B] font-semibold mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE4DE] bg-[#FAF7F4] text-xs text-[#23384F] focus:outline-none focus:border-[#23384F]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#B8A18B] font-semibold mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE4DE] bg-[#FAF7F4] text-xs text-[#23384F] focus:outline-none focus:border-[#23384F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#B8A18B] font-semibold mb-1">
                    Project Requirements / Drawing Notes
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE4DE] bg-[#FAF7F4] text-xs text-[#23384F] focus:outline-none focus:border-[#23384F]"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs font-mono rounded-lg border border-red-200">
                    {errorMsg}
                  </div>
                )}

                <Button type="submit" size="md" variant="primary" disabled={loading} className="gap-2">
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Sending to Desk...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Submit Engineering Message</span>
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
