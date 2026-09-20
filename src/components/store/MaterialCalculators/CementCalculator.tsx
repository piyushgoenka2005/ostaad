"use client";

import React, { useState } from "react";
import { Calculator, ArrowRight } from "lucide-react";
import { Button } from "@/components/common/Button";

interface CementCalculatorProps {
  onQuoteRequest?: (bags: number, totalCost: number) => void;
}

export const CementCalculator: React.FC<CementCalculatorProps> = ({ onQuoteRequest }) => {
  const [areaSqFt, setAreaSqFt] = useState<number>(1200);
  const [thicknessInch, setThicknessInch] = useState<number>(5);
  const [mixRatio, setMixRatio] = useState<string>("M20");
  const [unitRate, setUnitRate] = useState<number>(385);

  // Structural formula: Volume (cu ft) = (SqFt * (thicknessInch / 12))
  // Cement bags = Volume * Mix Coefficient
  // M20 (1:1.5:3) -> approx 8.2 bags per 100 cu ft
  // M25 (1:1:2) -> approx 11.1 bags per 100 cu ft
  const volumeCuFt = (areaSqFt * (thicknessInch / 12));
  const multiplier = mixRatio === "M25" ? 0.111 : mixRatio === "M20" ? 0.082 : 0.065;
  const bagsRequired = Math.max(1, Math.ceil(volumeCuFt * multiplier));
  const estimatedTotal = bagsRequired * unitRate;

  return (
    <div className="p-6 rounded-2xl bg-white border border-[#EAE4DE] shadow-sm font-sans space-y-5">
      <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#A87545] font-semibold">
        <Calculator size={16} />
        <span>Structural Cement Volume Estimator</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] font-mono uppercase text-[#B8A18B] mb-1.5 font-medium">
            Slab Surface Area (Sq Ft)
          </label>
          <input
            type="number"
            value={areaSqFt}
            onChange={(e) => setAreaSqFt(Math.max(1, Number(e.target.value)))}
            className="w-full px-3.5 py-2 rounded-xl border border-[#EAE4DE] bg-[#FAF7F4] text-sm text-[#23384F] font-mono focus:outline-none focus:border-[#23384F]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase text-[#B8A18B] mb-1.5 font-medium">
            Slab Thickness (Inches)
          </label>
          <input
            type="number"
            value={thicknessInch}
            onChange={(e) => setThicknessInch(Math.max(1, Number(e.target.value)))}
            className="w-full px-3.5 py-2 rounded-xl border border-[#EAE4DE] bg-[#FAF7F4] text-sm text-[#23384F] font-mono focus:outline-none focus:border-[#23384F]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase text-[#B8A18B] mb-1.5 font-medium">
            Concrete Design Mix
          </label>
          <select
            value={mixRatio}
            onChange={(e) => setMixRatio(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-[#EAE4DE] bg-[#FAF7F4] text-sm text-[#23384F] font-mono focus:outline-none focus:border-[#23384F]"
          >
            <option value="M25">M25 (1:1:2) - Heavy RCC Roof</option>
            <option value="M20">M20 (1:1.5:3) - Standard Slab</option>
            <option value="M15">M15 (1:2:4) - Floor Screed</option>
          </select>
        </div>
      </div>

      {/* Output Summary Card */}
      <div className="p-4 rounded-xl bg-[#FAF7F4] border border-[#EAE4DE] flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-[11px] font-mono text-[#B8A18B] uppercase block">
            Calculated Requirement ({mixRatio} Grade)
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-bold text-[#23384F] font-sans">{bagsRequired} Bags</span>
            <span className="font-mono text-xs text-[#54524D]">({(bagsRequired * 0.05).toFixed(1)} MT)</span>
          </div>
        </div>

        <div className="text-right sm:text-right w-full sm:w-auto">
          <span className="text-[11px] font-mono text-[#B8A18B] uppercase block">
            Direct Mill Est. Cost
          </span>
          <div className="text-2xl font-bold text-[#A87545] font-sans">
            ₹{estimatedTotal.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {onQuoteRequest && (
        <Button
          type="button"
          size="md"
          variant="primary"
          onClick={() => onQuoteRequest(bagsRequired, estimatedTotal)}
          className="w-full gap-2"
        >
          <span>Request Dispatch Quote for {bagsRequired} Bags</span>
          <ArrowRight size={14} />
        </Button>
      )}
    </div>
  );
};
