import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="pt-28 pb-20 px-4 md:px-[4.5%] max-w-[1000px] mx-auto min-h-screen">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#B8A18B] mb-3">
          <span className="w-6 h-[1px] bg-current inline-block" />
          <span>Security & Compliance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-medium text-[#23384F] tracking-tight">
          Privacy Policy & MTC Data Traceability
        </h1>
        <p className="text-xs font-mono text-[#B8A18B] mt-2">
          Effective Date: September 2026 · Ostaad Construction Technologies
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-white border border-[#EAE4DE] space-y-6 text-sm text-[#54524D] leading-relaxed font-sans shadow-sm">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-[#23384F]">1. Technical Data Collection</h2>
          <p>
            Ostaad processes technical drawing metrics, BOQ requirements, contact credentials, and pincode site locations strictly to formulate verifiable direct-to-site mill dispatch pricing and logistics allocations.
          </p>
        </section>

        <section className="space-y-2 border-t border-[#EAE4DE] pt-6">
          <h2 className="text-lg font-semibold text-[#23384F]">2. Manufacturer Test Certificate (MTC) Security</h2>
          <p>
            Batch chemical certificates and 28-day compressive strength laboratory records are stored with cryptographic hash verification to ensure zero tampering across transit corridors.
          </p>
        </section>

        <section className="space-y-2 border-t border-[#EAE4DE] pt-6">
          <h2 className="text-lg font-semibold text-[#23384F]">3. Zero Commercial Resale of Customer Information</h2>
          <p>
            We do not sell, rent, or distribute homeowner or contractor project details to third-party advertising networks. Information is shared exclusively with certified manufacturing grinding mills for order dispatch fulfillment.
          </p>
        </section>

        <section className="space-y-2 border-t border-[#EAE4DE] pt-6">
          <h2 className="text-lg font-semibold text-[#23384F]">4. Contact & Compliance Desk</h2>
          <p>
            For inquiries regarding data erasure or audit trail access, contact our legal desk at{" "}
            <a href="mailto:privacy@ostaad.in" className="text-[#A87545] font-mono hover:underline">
              privacy@ostaad.in
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
