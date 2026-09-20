"use client";

import { Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  productTitle: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  productTitle,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#121C26]/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[20px] border border-[rgba(184,161,139,0.42)] w-full max-w-[480px] p-7 shadow-[0_25px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-start gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-xl bg-red-500/12 text-red-500 grid place-items-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-semibold text-[#23384F] mb-1.5">
              Delete Product Specification
            </h2>
            <p className="text-[13.5px] text-[#54524D] leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-[#23384F] font-semibold">
                &quot;{productTitle}&quot;
              </strong>{" "}
              from the verified database? This change will reflect across the store in real-time.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 mt-6">
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
            type="button"
            onClick={onConfirm}
            style={{
              backgroundColor: "#DC2626",
              color: "#FFFFFF",
              boxShadow: "0 4px 14px rgba(220, 38, 38, 0.28)",
            }}
            className="px-4 py-2 rounded-xl !bg-red-600 hover:!bg-red-700 !text-white text-sm font-semibold transition-all cursor-pointer hover:shadow-lg"
          >
            <span className="!text-white font-semibold">Delete Product</span>
          </button>
        </div>
      </div>
    </div>
  );
}
