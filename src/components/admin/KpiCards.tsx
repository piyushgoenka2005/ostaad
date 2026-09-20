"use client";

import { IProduct } from "@/types";

interface KpiCardsProps {
  products: IProduct[];
}

export function KpiCards({ products }: KpiCardsProps) {
  const activeSkus = products.length;

  const uniqueCategories = new Set(
    products.map((p) => p.category).filter(Boolean)
  ).size;

  const avgPrice = activeSkus
    ? Math.round(
        products.reduce((acc, p) => acc + (Number(p.price) || 0), 0) / activeSkus
      )
    : 0;

  const inStockCount = products.filter(
    (p) => p.status === "in_stock" || !p.status
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-7">
      <div className="bg-white border border-[rgba(184,161,139,0.42)] rounded-2xl p-5 shadow-[0_2px_8px_rgba(35,56,79,0.04)] flex flex-col gap-2 hover:-translate-y-0.5 transition-transform">
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#B8A18B]">
            Active SKUs
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#23384F]/5 text-[#23384F] grid place-items-center text-sm">
            📦
          </div>
        </div>
        <div className="font-mono text-2xl sm:text-[26px] font-bold text-[#23384F] leading-tight">
          {activeSkus}
        </div>
        <div className="text-[11.5px] text-[#586343] flex items-center gap-1 font-medium">
          Verified & Published
        </div>
      </div>

      <div className="bg-white border border-[rgba(184,161,139,0.42)] rounded-2xl p-5 shadow-[0_2px_8px_rgba(35,56,79,0.04)] flex flex-col gap-2 hover:-translate-y-0.5 transition-transform">
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#B8A18B]">
            Material Categories
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#23384F]/5 text-[#23384F] grid place-items-center text-sm">
            🏷️
          </div>
        </div>
        <div className="font-mono text-2xl sm:text-[26px] font-bold text-[#23384F] leading-tight">
          {uniqueCategories}
        </div>
        <div className="text-[11.5px] text-[#586343] flex items-center gap-1 font-medium">
          Cement, Steel, Paint, Tiles...
        </div>
      </div>

      <div className="bg-white border border-[rgba(184,161,139,0.42)] rounded-2xl p-5 shadow-[0_2px_8px_rgba(35,56,79,0.04)] flex flex-col gap-2 hover:-translate-y-0.5 transition-transform">
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#B8A18B]">
            Avg Benchmark Rate
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#23384F]/5 text-[#23384F] grid place-items-center font-mono font-bold text-sm">
            ₹
          </div>
        </div>
        <div className="font-mono text-2xl sm:text-[26px] font-bold text-[#23384F] leading-tight">
          ₹{avgPrice.toLocaleString("en-IN")}
        </div>
        <div className="text-[11.5px] text-[#586343] flex items-center gap-1 font-medium">
          Direct Mill Baseline
        </div>
      </div>

      <div className="bg-white border border-[rgba(184,161,139,0.42)] rounded-2xl p-5 shadow-[0_2px_8px_rgba(35,56,79,0.04)] flex flex-col gap-2 hover:-translate-y-0.5 transition-transform">
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#B8A18B]">
            Ready for Site Dispatch
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#23384F]/5 text-[#23384F] grid place-items-center text-sm">
            🚚
          </div>
        </div>
        <div className="font-mono text-2xl sm:text-[26px] font-bold text-[#23384F] leading-tight">
          {inStockCount}
        </div>
        <div className="text-[11.5px] text-[#586343] flex items-center gap-1 font-medium">
          24–48 Hr Turnaround
        </div>
      </div>
    </div>
  );
}
