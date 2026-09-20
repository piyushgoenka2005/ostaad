import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { StockStatus } from "@/types";

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className }) => {
  const catKey = (category || "cement").toLowerCase();
  return (
    <span className={twMerge(clsx("category-badge", `cat-${catKey}`, className))}>
      {category}
    </span>
  );
};

interface StatusBadgeProps {
  status: StockStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const statusKey = status || "in_stock";
  const label =
    statusKey === "in_stock"
      ? "In Stock (Direct)"
      : statusKey === "low_stock"
      ? "Low Stock"
      : statusKey === "backorder"
      ? "On Demand"
      : "Archived";

  return (
    <span className={twMerge(clsx("status-badge", statusKey, className))}>
      <span className="status-dot" />
      <span>{label}</span>
    </span>
  );
};
