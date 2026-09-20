"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ArrowRight, ShieldCheck, FileSpreadsheet } from "lucide-react";
import { IProduct } from "@/types";
import { CategoryBadge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";

interface QuickInspectDrawerProps {
  product: IProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestBOQ: (product: IProduct) => void;
}

export const QuickInspectDrawer: React.FC<QuickInspectDrawerProps> = ({
  product,
  isOpen,
  onClose,
  onRequestBOQ,
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

  if (!isOpen || !product) return null;

  const specRows = [
    { label: "Standard Compliance", value: product.standard || "IS / BIS Verified Standard" },
    { label: "Verified Unit Rate", value: `₹${Number(product.price || 0).toLocaleString("en-IN")}` },
    { label: "Packaging / Metric", value: product.unit || "Standard Packaging Unit" },
    { label: "Dispatch Origin", value: product.shipper || "Direct Regional Mill" },
    {
      label: "Stock & Dispatch",
      value: product.status === "in_stock" ? "In Stock (Direct Mill Dispatch)" : "On Demand Batch",
    },
    { label: "Site Lead Time", value: product.leadTime || "24–48 Hours" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-[#162433]/60 backdrop-blur-sm flex justify-end transition-opacity duration-300 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col justify-between border-l border-[#EAE4DE] animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="p-6 pb-4 border-b border-[#EAE4DE] flex items-start justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CategoryBadge category={product.category} />
                <span className="font-mono text-xs text-[#7C8764] font-semibold bg-[#7C8764]/10 px-2 py-0.5 rounded border border-[#7C8764]/20 flex items-center gap-1">
                  <ShieldCheck size={12} />
                  <span>MTC Audited</span>
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#23384F] tracking-tight">{product.title}</h2>
              <p className="font-mono text-xs text-[#B8A18B] mt-0.5">
                {product.grade} · {product.shipper}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[#B8A18B] hover:text-[#23384F] p-2 rounded-xl hover:bg-[#FAF7F4] transition-colors"
              aria-label="Close drawer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6">
            {/* Visual & Price Hero */}
            <div className="p-4 rounded-2xl bg-[#FAF7F4] border border-[#EAE4DE] flex items-center gap-5">
              <div className="w-24 h-24 rounded-xl bg-white border border-[#EAE4DE] p-2 shrink-0 flex items-center justify-center">
                <Image
                  src={product.image || "/brand/ostaad-logo.png"}
                  alt={product.title}
                  width={96}
                  height={96}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>
              <div>
                <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#B8A18B] block">
                  Verified Unit Rate
                </span>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="font-mono text-base text-[#A87545] font-semibold">₹</span>
                  <span className="text-3xl font-bold text-[#23384F]">
                    {Number(product.price || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <span className="font-mono text-xs text-[#54524D]">{product.unit || ""}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-mono text-xs uppercase tracking-wider text-[#B8A18B] mb-2 font-semibold">
                Engineering Specification
              </h3>
              <p className="text-sm text-[#54524D] leading-relaxed font-sans bg-white p-4 rounded-xl border border-[#EAE4DE]">
                {product.description ||
                  `${product.title} adheres to strict regional compliance standards with zero retail mixing and verified batch test certificates.`}
              </p>
            </div>

            {/* Technical Specification Matrix */}
            <div>
              <h3 className="font-mono text-xs uppercase tracking-wider text-[#B8A18B] mb-2.5 font-semibold">
                Audit Compliance Matrix
              </h3>
              <div className="rounded-xl border border-[#EAE4DE] overflow-hidden">
                <table className="w-full text-xs text-left">
                  <tbody>
                    {specRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? "bg-[#FAF7F4]" : "bg-white"}
                      >
                        <th className="py-2.5 px-4 font-mono font-normal text-[#54524D] border-b border-[#EAE4DE]/60 w-1/2">
                          {row.label}
                        </th>
                        <td className="py-2.5 px-4 font-mono font-medium text-[#23384F] border-b border-[#EAE4DE]/60">
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Engineering Use Notes */}
            <div>
              <h3 className="font-mono text-xs uppercase tracking-wider text-[#B8A18B] mb-2 font-semibold">
                Recommended Applications
              </h3>
              <ul className="text-xs text-[#54524D] space-y-2 list-disc list-inside font-sans pl-1">
                <li>Direct site procurement with transparent bill-of-quantities costing.</li>
                <li>Complies with regional structural engineering standards and tolerances.</li>
                <li>Factory sealed batch testing with manufacturer test certificate (MTC).</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#EAE4DE] bg-white sticky bottom-0 flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1 gap-2"
            onClick={() => onRequestBOQ(product)}
          >
            <FileSpreadsheet size={15} />
            <span>Request BOQ Integration</span>
          </Button>

          {product.pageUrl && (
            <Link href={product.pageUrl} className="flex-1">
              <Button variant="primary" className="w-full gap-2">
                <span>View Full Page</span>
                <ArrowRight size={15} />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
