import React from "react";
import Link from "next/link";
import { ShieldCheck, CheckCircle2, Building, Scale, ArrowRight } from "lucide-react";
import { Button } from "@/components/common/Button";

export default function AboutPage() {
  return (
    <div className="pt-28 pb-20 px-4 md:px-[4.5%] max-w-[1360px] mx-auto min-h-screen">
      <div className="max-w-3xl mb-16">
        <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#B8A18B] mb-3">
          <span className="w-6 h-[1px] bg-current inline-block" />
          <span>Engineering Integrity & Origins</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-medium text-[#23384F] tracking-tight leading-tight">
          Restoring technical transparency to building material procurement.
        </h1>
        <p className="text-base sm:text-lg text-[#54524D] mt-6 leading-relaxed font-sans">
          Ostaad was founded by structural engineers to eliminate the multi-tiered dealer network that inflates construction budgets and compromises fresh clinker hydration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="p-8 rounded-2xl bg-white border border-[#EAE4DE] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#23384F]/10 text-[#23384F] flex items-center justify-center">
            <Building size={20} />
          </div>
          <h3 className="text-lg font-semibold text-[#23384F]">Direct Mill Consignments</h3>
          <p className="text-xs text-[#54524D] leading-relaxed">
            Eliminates intermediate stockyard moisture degradation and transit handling breakages.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white border border-[#EAE4DE] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#7C8764]/10 text-[#7C8764] flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <h3 className="text-lg font-semibold text-[#23384F]">Verified Lab MTC Protocols</h3>
          <p className="text-xs text-[#54524D] leading-relaxed">
            Every batch is tracked with laboratory test certificates guaranteeing 28-day compressive strength.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white border border-[#EAE4DE] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#A87545]/10 text-[#A87545] flex items-center justify-center">
            <Scale size={20} />
          </div>
          <h3 className="text-lg font-semibold text-[#23384F]">Zero Spec Compromise</h3>
          <p className="text-xs text-[#54524D] leading-relaxed">
            Transparent BOQ integration that saves 12–18% on structural bills by eliminating retail markups.
          </p>
        </div>
      </div>

      <div className="p-10 rounded-3xl bg-[#192C40] text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h3 className="text-2xl font-bold">Have an ongoing project or upcoming roof casting?</h3>
          <p className="text-sm text-white/70 mt-1">
            Submit your structural drawing to our materials desk for a complimentary BOQ diagnostic.
          </p>
        </div>
        <Link href="/contact">
          <Button size="lg" variant="light" hasArrow>
            <span>Consult Engineering Desk</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
