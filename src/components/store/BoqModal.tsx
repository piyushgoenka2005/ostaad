"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IProduct, BOQRequestPayload } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { saveUserBOQ } from "@/lib/firebase/firestore";
import { sanitizeString, sanitizeEmail, sanitizePhone } from "@/lib/security/sanitize";

interface BoqModalProps {
  product: IProduct | null;
  isOpen: boolean;
  onClose: () => void;
  targetSpec?: string;
}

export const BoqModal: React.FC<BoqModalProps> = ({
  product,
  isOpen,
  onClose,
  targetSpec,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pincode: "",
    projectStage: "Structural RCC Casting",
    quantity: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Populate user data when available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.displayName || "",
        email: prev.email || user.email || "",
      }));
    } else {
      try {
        const saved = localStorage.getItem("ostaad_user_profile");
        if (saved) {
          const parsed = JSON.parse(saved);
          setFormData((prev) => ({
            ...prev,
            name: prev.name || parsed.displayName || parsed.name || "",
            email: prev.email || parsed.email || "",
          }));
        }
      } catch {
        // ignore JSON parse error
      }
    }
  }, [user, isOpen]);

  // Lock scroll on open
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

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setSubmitted(false);
    setErrorMessage("");
    onClose();
  };

  const currentSpec =
    targetSpec ||
    (product
      ? `${product.title} (${product.standard || product.grade || "IS Standard"}${
          product.price ? ` · ₹${Number(product.price).toLocaleString("en-IN")}` : ""
        }${product.unit ? ` ${product.unit}` : ""})`
      : "Verified Construction Specification");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const accessKey =
        process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || "6d71ee60-2f5a-436e-b445-ec657bf48f2a";

      const cleanData: BOQRequestPayload = {
        name: sanitizeString(formData.name, 100),
        email: sanitizeEmail(formData.email),
        phone: sanitizePhone(formData.phone),
        pincode: sanitizeString(formData.pincode, 12),
        materialSpec: sanitizeString(currentSpec, 200),
        quantity: sanitizeString(formData.quantity, 60),
        projectType: sanitizeString(formData.projectStage, 60),
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

  if (!isOpen) return null;

  return (
    <div
      className={`boq-modal-backdrop ${isOpen ? "open" : ""}`}
      id="boqModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="boqModalTitle"
      style={{ display: isOpen ? "flex" : "none" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="boq-modal-dialog">
        <button
          type="button"
          className="boq-modal-close"
          id="closeBoqModal"
          aria-label="Close dialog"
          onClick={handleClose}
        >
          ×
        </button>

        {/* Authentication Required Gate */}
        {!user ? (
          <div id="boqAuthGate" style={{ textAlign: "center", padding: "24px 12px 14px" }}>
            <div
              style={{
                width: "58px",
                height: "58px",
                borderRadius: "50%",
                background: "rgba(200,109,59,.12)",
                color: "#C86D3B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="28"
                height="28"
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h3
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--slate)",
                margin: "0 0 8px",
              }}
            >
              Authentication Required
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "var(--taupe)",
                maxWidth: "440px",
                margin: "0 auto 20px",
                lineHeight: 1.5,
              }}
            >
              You must be logged in to request a verified mill-direct bulk quote and engineering BOQ
              audit for your project.
            </p>

            <div
              className="boq-spec-badge"
              style={{ maxWidth: "440px", margin: "0 auto 24px", textAlign: "left" }}
            >
              <span className="boq-spec-label">
                {product?.category ? `TARGET ${product.category.toUpperCase()} SPECIFICATION` : "TARGET SPECIFICATION"}
              </span>
              <span className="boq-spec-val" id="boqGateSpecVal">
                {currentSpec}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/login"
                className="btn btn-primary"
                style={{
                  padding: "12px 24px",
                  fontSize: "13.5px",
                  borderRadius: "12px",
                  textDecoration: "none",
                }}
              >
                <span>Sign In to Continue</span> <span className="arrow">→</span>
              </Link>
              <Link
                href="/signup"
                className="btn btn-secondary"
                style={{
                  padding: "12px 24px",
                  fontSize: "13.5px",
                  borderRadius: "12px",
                  textDecoration: "none",
                }}
              >
                Create New Account
              </Link>
            </div>
          </div>
        ) : !submitted ? (
          /* Form Container */
          <div id="boqFormContainer">
            <div className="boq-modal-header">
              <span className="boq-eyebrow">MILL-DIRECT PROCUREMENT & BOQ</span>
              <h3 id="boqModalTitle">Request Verified Bulk Quote</h3>
              <p>
                Connect verified factory rates and laboratory testing baseline directly into your
                project&apos;s procurement schedule.
              </p>

              <div className="boq-spec-badge" id="boqSpecBadge">
                <span className="boq-spec-label">
                  {product?.category ? `TARGET ${product.category.toUpperCase()} SPECIFICATION` : "TARGET MATERIAL SPECIFICATION"}
                </span>
                <span className="boq-spec-val" id="boqSpecVal">
                  {currentSpec}
                </span>
              </div>
            </div>

            <form id="boqForm" className="boq-form" onSubmit={handleSubmit}>
              <div className="boq-grid">
                <div className="boq-field">
                  <label htmlFor="boqName">FULL NAME *</label>
                  <input
                    type="text"
                    id="boqName"
                    name="name"
                    required
                    placeholder="e.g. Rahul Sen"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="boq-field">
                  <label htmlFor="boqEmail">WORK / PERSONAL EMAIL *</label>
                  <input
                    type="email"
                    id="boqEmail"
                    name="email"
                    required
                    placeholder="e.g. rahul@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="boq-field">
                  <label htmlFor="boqPhone">PHONE / WHATSAPP *</label>
                  <input
                    type="tel"
                    id="boqPhone"
                    name="phone"
                    required
                    placeholder="+91 98300 XXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="boq-field">
                  <label htmlFor="boqPincode">PROJECT PIN CODE *</label>
                  <input
                    type="text"
                    id="boqPincode"
                    name="pincode"
                    required
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="e.g. 700091"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  />
                </div>

                <div className="boq-field">
                  <label htmlFor="boqStage">CURRENT PROJECT STAGE</label>
                  <select
                    id="boqStage"
                    name="project_stage"
                    value={formData.projectStage}
                    onChange={(e) => setFormData({ ...formData, projectStage: e.target.value })}
                  >
                    <option value="Structural RCC Casting">Structural RCC Casting</option>
                    <option value="Planning & Architectural Drawings">
                      Planning & Architectural Drawings
                    </option>
                    <option value="Excavation & Footing Foundation">
                      Excavation & Footing Foundation
                    </option>
                    <option value="Brickwork & Plastering">Brickwork & Plastering</option>
                    <option value="Flooring, Tiling & Finishing">
                      Flooring, Tiling & Finishing
                    </option>
                  </select>
                </div>

                <div className="boq-field">
                  <label htmlFor="boqQty">ESTIMATED QUANTITY</label>
                  <input
                    type="text"
                    id="boqQty"
                    name="quantity"
                    placeholder="e.g. ~350 Bags / 1,500 sq ft slab"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>

                <div className="boq-field full">
                  <label htmlFor="boqNotes">PROJECT NOTES & BLUEPRINT REQUIREMENTS</label>
                  <textarea
                    id="boqNotes"
                    name="notes"
                    rows={3}
                    placeholder="Specify project site, required dispatch timeline, or structural grade preferences."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                id="boqSubmitBtn"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "14px",
                  fontSize: "14px",
                  borderRadius: "12px",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                <span>
                  {loading
                    ? "⏳ Sending to Engineering Desk..."
                    : "Submit Quote Request to Engineering Desk"}
                </span>{" "}
                {!loading && <span className="arrow">→</span>}
              </button>

              <div className="boq-trust-note">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>
                  Verified MTC Guaranteed · Zero Price Tampering · Direct Mill Logistics
                </span>
              </div>

              {errorMessage && (
                <div className="boq-error-msg" id="boqErrorMsg">
                  {errorMessage}
                </div>
              )}
            </form>
          </div>
        ) : (
          /* Success State */
          <div id="boqSuccessState" className="boq-success">
            <div className="boq-success-icon">
              <svg
                viewBox="0 0 24 24"
                width="32"
                height="32"
                stroke="#059669"
                fill="none"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3>Quote Request Submitted!</h3>
            <p>
              Your procurement inquiry for{" "}
              <strong id="boqSuccessSpec">{product?.title || "Materials"}</strong> has been logged with our
              Civil Engineering Desk. An audited quote and test certificates will be sent to{" "}
              <strong id="boqSuccessEmail">{formData.email || user?.email}</strong>.
            </p>

            <div className="boq-sla-box">
              <div className="boq-sla-item">
                <span className="sla-label">ESTIMATED RESPONSE TIME</span>
                <span className="sla-val">&lt; 3 Business Hours</span>
              </div>
              <div className="boq-sla-item">
                <span className="sla-label">LOGISTICS AUDIT</span>
                <span className="sla-val">Direct Mill Dispatch</span>
              </div>
            </div>

            <button
              type="button"
              id="boqSuccessCloseBtn"
              onClick={handleClose}
              className="btn btn-secondary"
              style={{
                padding: "10px 24px",
                fontSize: "13.5px",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
