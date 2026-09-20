"use client";

import { useState, useEffect, FormEvent } from "react";
import { IProduct, ProductCategory, StockStatus } from "@/types";
import { X } from "lucide-react";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: IProduct) => void;
  initialProduct: IProduct | null;
}

export function ProductFormModal({
  isOpen,
  onClose,
  onSave,
  initialProduct,
}: ProductFormModalProps) {
  const [formData, setFormData] = useState<Partial<IProduct>>({
    title: "",
    category: "Cement",
    grade: "",
    price: 385,
    unit: "/ 50 KG BAG · TAX INCLUSIVE",
    standard: "IS 12269 : 2013 & BIS Certified",
    shipper: "Direct Regional Cement Plant",
    status: "in_stock",
    leadTime: "24–48 Hours",
    image: "",
    pageUrl: "",
    description: "",
  });

  useEffect(() => {
    if (initialProduct) {
      setFormData({ ...initialProduct });
    } else {
      setFormData({
        title: "",
        category: "Cement",
        grade: "",
        price: 385,
        unit: "/ 50 KG BAG · TAX INCLUSIVE",
        standard: "IS 12269 : 2013 & BIS Certified",
        shipper: "Direct Regional Cement Plant",
        status: "in_stock",
        leadTime: "24–48 Hours",
        image: "",
        pageUrl: "",
        description: "",
      });
    }
  }, [initialProduct, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price) return;

    const productToSave: IProduct = {
      id: initialProduct?.id || "prod_" + Date.now(),
      title: formData.title || "",
      category: formData.category || "Cement",
      grade: formData.grade || "",
      price: Number(formData.price) || 0,
      unit: formData.unit || "",
      standard: formData.standard || "",
      shipper: formData.shipper || "",
      status: (formData.status as StockStatus) || "in_stock",
      leadTime: formData.leadTime || "24–48 Hours",
      image:
        formData.image ||
        "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=500&q=80",
      pageUrl: formData.pageUrl || "",
      description: formData.description || "",
      lastUpdated: Date.now(),
      isDeleted: false,
    };

    onSave(productToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#121C26]/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[20px] border border-[rgba(184,161,139,0.42)] w-full max-w-[640px] max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.25)] relative my-8">
        <div className="flex justify-between items-center pb-3.5 mb-5 border-b border-[#EAE4DE]">
          <h2 className="text-xl font-semibold text-[#23384F]">
            {initialProduct ? "Edit Product Specification" : "Add New Product"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F4] border border-[rgba(184,161,139,0.42)] grid place-items-center text-[#B8A18B] hover:text-[#23384F] hover:border-[#23384F] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 flex flex-col gap-1.5 text-left">
              <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#B8A18B] font-semibold">
                Product Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g. JK Super Ordinary Portland Cement (OPC 53)"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-[rgba(184,161,139,0.42)] bg-[#FAF7F4] text-[#23384F] text-[13.5px] focus:outline-none focus:border-[#23384F] focus:bg-white transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#B8A18B] font-semibold">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as ProductCategory,
                  })
                }
                required
                className="w-full px-3 py-2.5 rounded-xl border border-[rgba(184,161,139,0.42)] bg-[#FAF7F4] text-[#23384F] text-[13.5px] focus:outline-none focus:border-[#23384F] focus:bg-white transition-colors cursor-pointer"
              >
                <option value="Cement">Cement</option>
                <option value="Paint">Paint</option>
                <option value="Plywood">Plywood</option>
                <option value="Tiles">Tiles</option>
                <option value="Waterproofing">Waterproofing</option>
                <option value="Steel">Steel</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#B8A18B] font-semibold">
                Grade / Specification Subtype
              </label>
              <input
                type="text"
                value={formData.grade}
                onChange={(e) =>
                  setFormData({ ...formData, grade: e.target.value })
                }
                placeholder="e.g. OPC 53 Grade / IS 710 Marine"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-[rgba(184,161,139,0.42)] bg-[#FAF7F4] text-[#23384F] text-[13.5px] focus:outline-none focus:border-[#23384F] focus:bg-white transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#B8A18B] font-semibold">
                Verified Unit Rate (₹)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                placeholder="385"
                step="0.5"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-[rgba(184,161,139,0.42)] bg-[#FAF7F4] text-[#23384F] text-[13.5px] focus:outline-none focus:border-[#23384F] focus:bg-white transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#B8A18B] font-semibold">
                Unit / Packaging Metric
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                placeholder="e.g. / 50 KG BAG · TAX INCLUSIVE"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-[rgba(184,161,139,0.42)] bg-[#FAF7F4] text-[#23384F] text-[13.5px] focus:outline-none focus:border-[#23384F] focus:bg-white transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#B8A18B] font-semibold">
                Standard Compliance
              </label>
              <input
                type="text"
                value={formData.standard}
                onChange={(e) =>
                  setFormData({ ...formData, standard: e.target.value })
                }
                placeholder="e.g. IS 12269 : 2013 & BIS Certified"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-[rgba(184,161,139,0.42)] bg-[#FAF7F4] text-[#23384F] text-[13.5px] focus:outline-none focus:border-[#23384F] focus:bg-white transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#B8A18B] font-semibold">
                Dispatch Origin / Shipper
              </label>
              <input
                type="text"
                value={formData.shipper}
                onChange={(e) =>
                  setFormData({ ...formData, shipper: e.target.value })
                }
                placeholder="e.g. Direct Regional Cement Plant"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-[rgba(184,161,139,0.42)] bg-[#FAF7F4] text-[#23384F] text-[13.5px] focus:outline-none focus:border-[#23384F] focus:bg-white transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#B8A18B] font-semibold">
                Inventory / Dispatch Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as StockStatus,
                  })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-[rgba(184,161,139,0.42)] bg-[#FAF7F4] text-[#23384F] text-[13.5px] focus:outline-none focus:border-[#23384F] focus:bg-white transition-colors cursor-pointer"
              >
                <option value="in_stock">In Stock (Direct Dispatch)</option>
                <option value="low_stock">Low Inventory</option>
                <option value="backorder">On Demand Batch</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#B8A18B] font-semibold">
                Site Delivery Lead Time
              </label>
              <input
                type="text"
                value={formData.leadTime}
                onChange={(e) =>
                  setFormData({ ...formData, leadTime: e.target.value })
                }
                placeholder="24–48 Hours"
                className="w-full px-3 py-2.5 rounded-xl border border-[rgba(184,161,139,0.42)] bg-[#FAF7F4] text-[#23384F] text-[13.5px] focus:outline-none focus:border-[#23384F] focus:bg-white transition-colors"
              />
            </div>

            <div className="sm:col-span-2 flex flex-col gap-1.5 text-left">
              <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#B8A18B] font-semibold">
                Image URL
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="https://..."
                required
                className="w-full px-3 py-2.5 rounded-xl border border-[rgba(184,161,139,0.42)] bg-[#FAF7F4] text-[#23384F] text-[13.5px] focus:outline-none focus:border-[#23384F] focus:bg-white transition-colors"
              />
            </div>

            <div className="sm:col-span-2 flex flex-col gap-1.5 text-left">
              <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#B8A18B] font-semibold">
                Dedicated Spec Page Link (Optional)
              </label>
              <input
                type="text"
                value={formData.pageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, pageUrl: e.target.value })
                }
                placeholder="/products/cement"
                className="w-full px-3 py-2.5 rounded-xl border border-[rgba(184,161,139,0.42)] bg-[#FAF7F4] text-[#23384F] text-[13.5px] focus:outline-none focus:border-[#23384F] focus:bg-white transition-colors"
              />
            </div>

            <div className="sm:col-span-2 flex flex-col gap-1.5 text-left">
              <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#B8A18B] font-semibold">
                Key Engineering Specification / Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                placeholder="High early compressive strength, verified clinker MTC..."
                className="w-full px-3 py-2.5 rounded-xl border border-[rgba(184,161,139,0.42)] bg-[#FAF7F4] text-[#23384F] text-[13.5px] focus:outline-none focus:border-[#23384F] focus:bg-white transition-colors resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#EAE4DE]">
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "rgba(184, 161, 139, 0.42)",
                color: "#23384F",
              }}
              className="px-4 py-2 rounded-xl border border-[rgba(184,161,139,0.42)] bg-white text-[#23384F] hover:bg-[#FAF7F4] text-sm font-medium transition-colors cursor-pointer shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                backgroundColor: "#23384F",
                color: "#FFFFFF",
                boxShadow: "0 4px 14px rgba(35, 56, 79, 0.28)",
              }}
              className="px-5 py-2.5 rounded-xl !bg-[#23384F] hover:!bg-[#31465F] !text-white text-sm font-semibold transition-all cursor-pointer hover:shadow-lg"
            >
              <span className="!text-white font-semibold">{initialProduct ? "Update Product" : "Save Product"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
