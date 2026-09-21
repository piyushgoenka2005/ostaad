"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Lock, ArrowRight, Loader2, FileSpreadsheet } from "lucide-react";
import { IProduct, BOQRequestPayload } from "@/types";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { saveUserBOQ } from "@/lib/firebase/firestore";
import { sanitizeString, sanitizeEmail, sanitizePhone } from "@/lib/security/sanitize";

interface BoqModalProps {
  product: IProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BoqModal: React.FC<BoqModalProps> = ({ product, isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState<BOQRequestPayload>({
    name: "",
    email: "",
    phone: "",
    pincode: "",
    materialSpec: "",
    quantity: "",
    projectType: "Residential Villa",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("ostaad_user_profile");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setIsAuthenticated(true);
        setFormData((prev) => ({
          ...prev,
          name: user.displayName || user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          pincode: user.pincode || "",
        }));
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      setIsAuthenticated(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (product) {
      setFormData((prev) => ({
        ...prev,
        materialSpec: `${product.title} (${product.grade || product.standard}) - ₹${product.price} ${product.unit}`,
      }));
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || "6d71ee60-2f5a-436e-b445-ec657bf48f2a";

      const cleanData: BOQRequestPayload = {
        name: sanitizeString(formData.name, 100),
        email: sanitizeEmail(formData.email),
        phone: sanitizePhone(formData.phone),
        pincode: sanitizeString(formData.pincode, 12),
        materialSpec: sanitizeString(formData.materialSpec, 200),
        quantity: sanitizeString(formData.quantity, 60),
        projectType: sanitizeString(formData.projectType, 60),
        notes: sanitizeString(formData.notes, 1500),
      };

      if (!cleanData.name || !cleanData.email || !cleanData.phone) {
        throw new Error("Please enter valid name, email, and contact details.");
      }

      const payload = {
        access_key: accessKey,
        subject: `New BOQ Request: ${product ? product.title : "Materials"} - Ostaad`,
        from_name: "Ostaad BOQ Desk",
        ...cleanData,
        timestamp: new Date().toISOString(),
      };

      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        // Save to Firestore in background
        saveUserBOQ(cleanData).catch((err) => console.warn("BOQ Firestore sync error:", err));
        setSubmitted(true);
      } else {
        throw new Error(data.message || "Failed to submit BOQ request.");
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || "Submission error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setErrorMessage("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Request Bill of Quantities (BOQ)" maxWidth="max-w-lg">
      {!isAuthenticated ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-2xl bg-[#A87545]/15 text-[#A87545] flex items-center justify-center mx-auto mb-4">
            <Lock size={22} />
          </div>
          <h3 className="text-base font-semibold text-[#23384F] mb-1">
            Authentication Required for BOQ Desk
          </h3>
          <p className="text-xs text-[#54524D] max-w-sm mx-auto mb-6 leading-relaxed">
            Please sign in to your Ostaad account to submit technical BOQ requests and track mill dispatch allocations.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="md" variant="primary" className="w-full">
                <span>Sign In to Continue</span>
                <ArrowRight size={14} />
              </Button>
            </Link>
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="md" variant="outline" className="w-full">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      ) : submitted ? (
        <div className="text-center py-8">
          <div className="w-14 h-14 rounded-full bg-[#7C8764]/20 text-[#7C8764] flex items-center justify-center mx-auto mb-4 animate-in zoom-in">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-lg font-bold text-[#23384F] mb-1">
            BOQ Request Dispatched to Engineering Desk
          </h3>
          <p className="text-xs text-[#54524D] max-w-md mx-auto mb-2 leading-relaxed">
            Our structural materials auditor is compiling your site estimate with direct mill clinker allocations.
          </p>
          <p className="font-mono text-[11px] text-[#B8A18B] mb-6">
            A confirmation has been logged for <strong>{formData.email}</strong>.
          </p>
          <Button variant="primary" size="md" onClick={handleClose} className="mx-auto">
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-[#FAF7F4] border border-[#EAE4DE] rounded-xl text-xs flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-[#A87545] shrink-0" />
            <span className="font-mono text-[#23384F] truncate">
              {formData.materialSpec || "General Materials BOQ Integration"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#B8A18B] font-semibold mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE4DE] text-xs text-[#23384F] focus:outline-none focus:border-[#23384F] bg-[#FAF7F4]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#B8A18B] font-semibold mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE4DE] text-xs text-[#23384F] focus:outline-none focus:border-[#23384F] bg-[#FAF7F4]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#B8A18B] font-semibold mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE4DE] text-xs text-[#23384F] focus:outline-none focus:border-[#23384F] bg-[#FAF7F4]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#B8A18B] font-semibold mb-1">
                Delivery Site Pincode
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="700001"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE4DE] text-xs text-[#23384F] focus:outline-none focus:border-[#23384F] bg-[#FAF7F4]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#B8A18B] font-semibold mb-1">
                Estimated Volume / Quantity
              </label>
              <input
                type="text"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="e.g. 500 Bags / 2000 Sq Ft"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE4DE] text-xs text-[#23384F] focus:outline-none focus:border-[#23384F] bg-[#FAF7F4]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#B8A18B] font-semibold mb-1">
                Project Topology
              </label>
              <select
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE4DE] text-xs text-[#23384F] focus:outline-none focus:border-[#23384F] bg-[#FAF7F4]"
              >
                <option value="Residential Villa">Residential Villa / Independent Home</option>
                <option value="Commercial Complex">Commercial / Retail Facility</option>
                <option value="Multi-Story Apartment">Multi-Story RCC Apartment</option>
                <option value="Infrastructure Project">Infrastructure / Warehouse</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-[#B8A18B] font-semibold mb-1">
              Site Notes / Structural Specifications
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              placeholder="e.g. Need MTC batch test certificates prior to unloading..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#EAE4DE] text-xs text-[#23384F] focus:outline-none focus:border-[#23384F] bg-[#FAF7F4]"
            />
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
              {errorMessage}
            </div>
          )}

          <div className="pt-3 flex justify-end gap-3 border-t border-[#EAE4DE]">
            <Button type="button" variant="secondary" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Submitting to Desk...</span>
                </>
              ) : (
                <>
                  <span>Submit BOQ Request</span>
                  <ArrowRight size={14} />
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
