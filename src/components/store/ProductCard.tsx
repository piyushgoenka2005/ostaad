"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Eye } from "lucide-react";
import { IProduct } from "@/types";
import { CategoryBadge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";

interface ProductCardProps {
  product: IProduct;
  onInspect: (product: IProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onInspect }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mx", `${x}px`);
    cardRef.current.style.setProperty("--my", `${y}px`);
  };

  const getFallbackUrl = (category: string) => {
    const cat = (category || "").toLowerCase();
    switch (cat) {
      case "cement":
        return "/products/cement";
      case "paint":
        return "/products/paint";
      case "plywood":
        return "/products/plywood";
      case "tiles":
        return "/products/tiles";
      case "waterproofing":
        return "/products/waterproofing";
      default:
        return "/products";
    }
  };

  const targetUrl = product.pageUrl || getFallbackUrl(product.category);

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="spotlight card-hybrid flex flex-col justify-between p-6 group cursor-pointer"
      onClick={(e) => {
        // Prevent navigating if clicking inspect button or link
        if ((e.target as HTMLElement).closest(".no-card-nav")) return;
        window.location.href = targetUrl;
      }}
    >
      <div>
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <CategoryBadge category={product.category} />
          <span className="font-mono text-[11px] text-[#23384F] tracking-wide font-medium bg-[#23384F]/5 px-2 py-0.5 rounded border border-[#23384F]/10">
            {product.standard || product.grade || "IS VERIFIED"}
          </span>
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-lg font-semibold text-[#23384F] tracking-tight leading-snug group-hover:text-[#A87545] transition-colors">
          <Link href={targetUrl} className="no-card-nav" onClick={(e) => e.stopPropagation()}>
            {product.title}
          </Link>
        </h3>
        <p className="text-xs text-[#54524D]/80 mt-1 line-clamp-2 leading-relaxed">
          {product.description || `${product.grade} · ${product.shipper}`}
        </p>

        {/* Product Visual Image */}
        <div className="my-5 h-44 rounded-xl bg-white border border-[#EAE4DE] overflow-hidden flex items-center justify-center p-3 relative shadow-inner">
          <Image
            src={product.image || "/brand/ostaad-logo.png"}
            alt={product.title}
            width={240}
            height={160}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        </div>
      </div>

      {/* Card Bottom: Pricing & Actions */}
      <div className="pt-3 border-t border-[#EAE4DE]/80">
        <div className="flex items-baseline justify-between mb-4">
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-sm text-[#A87545] font-semibold">₹</span>
            <span className="text-2xl font-bold text-[#23384F] tracking-tight font-sans">
              {Number(product.price || 0).toLocaleString("en-IN")}
            </span>
            <span className="font-mono text-[10.5px] text-[#B8A18B] uppercase ml-1">
              {product.unit || ""}
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#7C8764] font-semibold bg-[#7C8764]/10 px-2 py-0.5 rounded-full border border-[#7C8764]/20">
            {product.status === "in_stock" ? "Direct Mill" : "Verified Rate"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 no-card-nav" onClick={(e) => e.stopPropagation()}>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => onInspect(product)}
            className="w-full gap-1.5"
          >
            <Eye size={13} />
            <span>Quick Inspect</span>
          </Button>

          <Link href={targetUrl} className="w-full">
            <Button size="sm" variant="primary" className="w-full gap-1">
              <span>Full Spec</span>
              <ArrowRight size={13} />
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
};
