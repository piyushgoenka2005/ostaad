"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { saveUserBOQ } from "@/lib/firebase/firestore";

interface PlywoodMeta {
  title: string;
  badge: string;
  rateLabel: string;
  price: number;
  unit: string;
  thickSpec: string;
  specText: string;
  img: string;
  alt: string;
}

const PLYWOOD_DATA: Record<"19" | "12", PlywoodMeta> = {
  "19": {
    title: "IS:710 BWP Grade Marine Hardwood Plywood (19mm)",
    badge: "19MM CALIBRATED BWP",
    rateLabel: "₹118 / Sq Ft (19mm Calibrated)",
    price: 118,
    unit: "/ SQ FT (19MM) · TAX INCLUSIVE",
    thickSpec: "19 MM (Tolerance ±0.1 MM)",
    specText: "CenturyPly Club Prime 19mm Calibrated BWP Marine · IS:710 (₹118/sq ft)",
    img: "/images/products/plywood-19mm.jpg",
    alt: "19mm Calibrated BWP Marine Grade Plywood",
  },
  "12": {
    title: "IS:710 BWP Grade Marine Hardwood Plywood (12mm)",
    badge: "12MM STRUCTURAL BWP",
    rateLabel: "₹92 / Sq Ft (12mm Structural)",
    price: 92,
    unit: "/ SQ FT (12MM) · TAX INCLUSIVE",
    thickSpec: "12 MM (Tolerance ±0.1 MM)",
    specText: "CenturyPly 12mm Structural BWP Marine Plywood · IS:710 (₹92/sq ft)",
    img: "/images/products/plywood-12mm.jpg",
    alt: "12mm Structural BWP Marine Grade Plywood",
  },
};

export default function PlywoodProductPage() {
  const { user, profile } = useAuth();

  // Selected Thickness (19 or 12)
  const [selectedThick, setSelectedThick] = useState<"19" | "12">("19");

  // Sag Simulator State
  const [calcThick, setCalcThick] = useState<number>(19);
  const [shelfSpan, setShelfSpan] = useState<number>(36);
  const [shelfLoad, setShelfLoad] = useState<number>(35);

  // Copy Link Feedback
  const [copied, setCopied] = useState(false);

  // BOQ Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pincode: "",
    projectStage: "Structural RCC Casting",
    quantity: "",
    notes: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.displayName || profile?.displayName || "",
        email: prev.email || user.email || "",
        phone: prev.phone || profile?.phone || "",
        pincode: prev.pincode || profile?.pincode || "",
      }));
    }
  }, [user, profile]);

  const handleThickSelect = (thick: "19" | "12") => {
    setSelectedThick(thick);
    setCalcThick(parseFloat(thick));
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  // Sag computation formula
  const sag = (shelfLoad * Math.pow(shelfSpan / 36, 3) * 0.9) / Math.pow(calcThick / 19, 3);
  const roundedSag = Math.round(sag * 10) / 10;
  const maxBend = Math.min(22, roundedSag * 4);

  let sagStatusText = "STRUCTURAL STATUS: SAFE (Rigid, zero perceptible sagging).";
  let sagStatusColor = "#8E9976";
  if (roundedSag > 2.5) {
    sagStatusText = "STRUCTURAL STATUS: EXCESSIVE SAG (Add a center vertical stiffener or upgrade thickness).";
    sagStatusColor = "#E5A97C";
  } else if (roundedSag > 1.5) {
    sagStatusText = "STRUCTURAL STATUS: ACCEPTABLE (Minor deflection within L/360 code limits).";
    sagStatusColor = "rgba(255,255,255,.85)";
  }

  const { products } = useProducts();

  const dynamic19 = products.find(
    (p) =>
      p.id === "prod_plywood_marine" ||
      (p.category === "Plywood" &&
        (p.id.includes("19") || p.title.includes("19") || p.grade.includes("19"))) ||
      p.category === "Plywood"
  );
  const dynamic12 = products.find(
    (p) =>
      p.category === "Plywood" &&
      (p.id.includes("12") || p.title.includes("12") || p.grade.includes("12"))
  );

  const plywoodData = {
    "19": {
      ...PLYWOOD_DATA["19"],
      ...(dynamic19
        ? {
            title: dynamic19.title || PLYWOOD_DATA["19"].title,
            price: dynamic19.price || PLYWOOD_DATA["19"].price,
            img: dynamic19.image || PLYWOOD_DATA["19"].img,
          }
        : {}),
    },
    "12": {
      ...PLYWOOD_DATA["12"],
      ...(dynamic12
        ? {
            title: dynamic12.title || PLYWOOD_DATA["12"].title,
            price: dynamic12.price || PLYWOOD_DATA["12"].price,
            img: dynamic12.image || PLYWOOD_DATA["12"].img,
          }
        : {}),
    },
  };

  const currentProduct = plywoodData[selectedThick];

  // Modal Submit
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        access_key: "6d71ee60-2f5a-436e-b445-ec657bf48f2a",
        subject: `Bulk Plywood Quote Request - ${currentProduct.specText} - Ostaad`,
        from_name: "Ostaad Plywood Procurement Desk",
        specification: currentProduct.specText,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        pincode: formData.pincode,
        project_stage: formData.projectStage,
        quantity: formData.quantity,
        notes: formData.notes,
      };

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        saveUserBOQ({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          pincode: formData.pincode,
          materialSpec: currentProduct.specText,
          quantity: formData.quantity || `30 Sheets (${selectedThick}mm)`,
          projectType: formData.projectStage,
          notes: formData.notes,
        }).catch((err) => console.warn("Firestore quote logging:", err));

        setIsSuccess(true);
      } else {
        throw new Error(data.message || "Submission failed");
      }
    } catch {
      setErrorMessage("Submission error. Please check your connection or contact us at contact@ostaad.in");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsSuccess(false);
    setErrorMessage("");
  };

  return (
    <main>
      {/* ============================================================
           1. TOP PRODUCT SHOWCASE & SPECS (L&T-SuFin Inspired)
           ============================================================ */}
      <section className="product-showcase-section">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link> <span className="sep">›</span>
            <Link href="/products?cat=plywood">Products</Link> <span className="sep">›</span>
            <span className="current" id="crumbTitle">
              IS:710 BWP Marine Grade Plywood
            </span>
          </div>

          <div className="product-showcase-grid">
            {/* LEFT COLUMN: Product Pack & Consultation */}
            <div className="gallery-col">
              <div className="main-pack-view">
                <span className="pack-badge-grade" id="badgeGrade">
                  {currentProduct.badge}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  id="mainPackImg"
                  src={currentProduct.img}
                  alt={currentProduct.alt}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = "/images/products/plywood-19mm.jpg";
                  }}
                />
                <span className="pack-badge-cert">IS 710 CERTIFIED</span>
              </div>

              {/* Thumbnail selector to toggle between 19mm and 12mm */}
              <div className="pack-thumbnails">
                <button
                  type="button"
                  className={`thumb-btn ${selectedThick === "19" ? "active" : ""}`}
                  id="thumb19"
                  onClick={() => handleThickSelect("19")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={plywoodData["19"].img}
                    alt="19mm Master Carcass"
                    className="thumb-img"
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.src = "/images/products/plywood-19mm.jpg"; }}
                  />
                  <div>
                    <span className="thumb-title">19mm Master Carcass</span>
                    <span className="thumb-sub">₹{plywoodData["19"].price}/sqft · High Rigid</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`thumb-btn ${selectedThick === "12" ? "active" : ""}`}
                  id="thumb12"
                  onClick={() => handleThickSelect("12")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={plywoodData["12"].img}
                    alt="12mm Shutter/Backer"
                    className="thumb-img"
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.src = "/images/products/plywood-12mm.jpg"; }}
                  />
                  <div>
                    <span className="thumb-title">12mm Shutter/Backer</span>
                    <span className="thumb-sub">₹{plywoodData["12"].price}/sqft · Structural</span>
                  </div>
                </button>
              </div>

              <div className="need-help-box">
                <h4>Need Joinery Span Guidance?</h4>
                <p>
                  Unsure whether 16mm or 19mm is required for kitchen carcass vs wardrobe sliding
                  shutters? Our wood engineers will audit your carpentry drawings.
                </p>
                <Link href="/contact" className="btn btn-secondary btn-sm">
                  Submit Enquiry <span>→</span>
                </Link>
              </div>
            </div>

            {/* CENTER COLUMN: Specifications, Offers & Trust */}
            <div className="detail-col">
              <div>
                <h1 className="product-main-title" id="productTitle">
                  {currentProduct.title}
                </h1>
                <div className="detail-meta-bar">
                  <div className="meta-verified-tag">⚡ 410+ Interiors Built · Calibrated Mill Benchmark</div>
                  <button type="button" className="copy-link-btn" id="copyLinkBtn" onClick={handleCopyLink}>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect width="14" height="14" x="8" y="8" rx="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    <span id="copyLinkText">{copied ? "Copied!" : "Copy Link"}</span>
                  </button>
                </div>
              </div>

              {/* Offers / Verification callouts */}
              <div className="offers-card">
                <div className="offers-title">Offers & Procurement Benchmarks</div>
                <div className="offer-item">
                  <span className="chk">✓</span>
                  <div>
                    <strong>Live Verified Rate:</strong>{" "}
                    <span id="rateLabel">{currentProduct.rateLabel}</span> · Direct Mill Benchmark.
                  </div>
                </div>
                <div className="offer-item">
                  <span className="chk">✓</span>
                  <div>
                    <strong>Zero-Core-Gap Assurance:</strong> Composed with 100% full hardwood core veneers
                    and cross-banded layup to eliminate internal air voids.
                  </div>
                </div>
                <div className="offer-item">
                  <span className="chk">✓</span>
                  <div>
                    <strong>72-Hour Boiling Water Proof:</strong> 100% unextended Phenol Formaldehyde (PF)
                    synthetic resin adhesive ensuring zero delamination in high moisture kitchens.
                  </div>
                </div>
              </div>

              {/* Trust Badges Row */}
              <div className="trust-badges-row">
                <div className="trust-pill">
                  <span className="ico">🚚</span>
                  <span className="t-label">Direct Truck Dispatch</span>
                  <span className="t-sub">Site dispatch in 24–48 hrs</span>
                </div>
                <div className="trust-pill">
                  <span className="ico">🛡️</span>
                  <span className="t-label">72-Hour Boiling Proof</span>
                  <span className="t-sub">IS 1734 Part 6 Certified</span>
                </div>
                <div className="trust-pill">
                  <span className="ico">⚖️</span>
                  <span className="t-label">4-Side Calibrated</span>
                  <span className="t-sub">±0.1 mm uniform thickness</span>
                </div>
              </div>

              {/* Technical Specifications Table */}
              <div className="specs-sheet-card">
                <h3>Technical Specifications</h3>
                <table className="specs-sheet-table">
                  <tbody>
                    <tr>
                      <th>Product Grade</th>
                      <td>Boiling Water Proof (BWP) Marine Hardwood</td>
                    </tr>
                    <tr>
                      <th>Standard Compliance</th>
                      <td>IS 710 : 2010 (Marine Plywood Specification)</td>
                    </tr>
                    <tr>
                      <th>Adhesive Resin System</th>
                      <td>100% Unextended Phenol Formaldehyde (PF) Resin</td>
                    </tr>
                    <tr>
                      <th>Sheet Thickness Metric</th>
                      <td id="specThick">{currentProduct.thickSpec}</td>
                    </tr>
                    <tr>
                      <th>Boiling Water Resistance</th>
                      <td>Passes &gt; 72 Hours continuous boiling without glue-line failure</td>
                    </tr>
                    <tr>
                      <th>Moisture Content</th>
                      <td>8 – 12% (Kiln seasoned & conditioned)</td>
                    </tr>
                    <tr>
                      <th>Screw Holding Strength</th>
                      <td>&gt; 280 KGF (Parallel to surface) · &gt; 220 KGF (Perpendicular)</td>
                    </tr>
                    <tr>
                      <th>Anti-Borer & Termite</th>
                      <td>Glue Line Poisoning (GLP) with organophosphorus preservative</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT COLUMN: Procurement Box */}
            <div className="procure-col">
              <div className="procure-card">
                <div className="procure-shipper">
                  Shipped by <strong>Ostaad Verified Logistics</strong>
                  Sold by <strong>Direct Primary Mill Network</strong>
                </div>

                <div className="procure-price-wrap">
                  <div className="lbl">TRANSPARENT PROCUREMENT BENCHMARK</div>
                  <div className="amt" id="procurePrice">
                    ₹{currentProduct.price}
                  </div>
                  <div className="sub" id="procureUnit">
                    {currentProduct.unit}
                  </div>
                </div>

                <button
                  type="button"
                  id="topRequestQuoteBtn"
                  onClick={() => setIsModalOpen(true)}
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center", cursor: "pointer" }}
                >
                  Request Quote for Bulk <span className="arrow">→</span>
                </button>
                <a
                  href="#sagSimulator"
                  className="btn btn-secondary"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Simulate Shelf Sag ↓
                </a>

                <div className="procure-how-it-works">
                  <h4>How does Ostaad Bulk Buying work?</h4>
                  <div className="procure-step">
                    <span className="step-dot">1</span>
                    <div>
                      <strong>Calculate Joinery Spans:</strong> Input shelf span and thickness in our
                      Load Deflection Simulator.
                    </div>
                  </div>
                  <div className="procure-step">
                    <span className="step-dot">2</span>
                    <div>
                      <strong>Transparent Rate:</strong> Direct mill quote per sheet with zero retail
                      middleman markup.
                    </div>
                  </div>
                  <div className="procure-step">
                    <span className="step-dot">3</span>
                    <div>
                      <strong>Site Delivery:</strong> Insured flat-bed transport with caliper gauge
                      thickness inspection.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           2. LOAD DEFLECTION & SHELF SAG SIMULATOR
           ============================================================ */}
      <section
        className="section"
        id="sagSimulator"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--recessed)" }}
      >
        <div className="container">
          <div className="eyebrow">STRUCTURAL JOINERY BENCHMARK</div>
          <h2
            style={{
              fontSize: "clamp(28px,3.8vw,42px)",
              fontWeight: 500,
              color: "var(--slate)",
              letterSpacing: "-.035em",
              marginBottom: "10px",
            }}
          >
            Shelf Span & Load Deflection Simulator
          </h2>
          <p style={{ color: "var(--text)", maxWidth: "680px", lineHeight: 1.6 }}>
            Simulate how shelf thickness and span length impact bending deflection under heavy utensil
            or book loads to specify correct carcass spans.
          </p>

          <div className="sim-grid">
            <div className="card" style={{ padding: "26px" }}>
              <h3 style={{ fontSize: "17px", color: "var(--slate)", marginBottom: "18px" }}>
                Joinery Parameters
              </h3>

              <div className="calc-field">
                <label htmlFor="thickSelect">PLYWOOD THICKNESS</label>
                <select
                  id="thickSelect"
                  className="calc-select"
                  value={calcThick}
                  onChange={(e) => setCalcThick(parseFloat(e.target.value) || 19)}
                >
                  <option value="12">12 mm (Lightweight Drawer Backs)</option>
                  <option value="16">16 mm (Standard Wardrobe Shelves)</option>
                  <option value="19">19 mm (Heavy Modular Kitchen Carcass)</option>
                  <option value="25">25 mm (Ultra Long-Span Floating Shelves)</option>
                </select>
              </div>

              <div className="calc-field">
                <label htmlFor="spanSelect">SHELF CLEAR SPAN (INCHES)</label>
                <select
                  id="spanSelect"
                  className="calc-select"
                  value={shelfSpan}
                  onChange={(e) => setShelfSpan(parseFloat(e.target.value) || 36)}
                >
                  <option value="24">24 Inches (Standard Cabinet Width)</option>
                  <option value="36">36 Inches (Wide Pantry / Wardrobe)</option>
                  <option value="48">48 Inches (Long Display Bookshelf)</option>
                </select>
              </div>

              <div className="calc-field" style={{ marginBottom: 0 }}>
                <label htmlFor="loadInput">UNIFORM DISTRIBUTED LOAD (KG)</label>
                <input
                  type="number"
                  id="loadInput"
                  className="calc-input"
                  value={shelfLoad}
                  min={5}
                  max={120}
                  onChange={(e) => setShelfLoad(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div
              className="card"
              style={{
                background: "var(--slate)",
                color: "#fff",
                borderColor: "var(--slate)",
                padding: "26px",
              }}
            >
              <div className="eyebrow" style={{ color: "rgba(255,255,255,.6)" }}>
                DEFLECTION ANALYSIS
              </div>

              <div className="shelf-visual">
                <div
                  className="shelf-beam"
                  id="shelfBeam"
                  style={{ transform: `translateY(${maxBend}px)` }}
                />
              </div>

              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "28px",
                  fontWeight: 700,
                  margin: "10px 0",
                }}
                id="sagAmount"
              >
                {roundedSag} mm Deflection
              </div>
              <p style={{ fontSize: "13px", color: sagStatusColor }} id="sagStatus">
                {sagStatusText}
              </p>

              <div
                className="calc-res-grid"
                style={{
                  borderTopColor: "rgba(255,255,255,.15)",
                  marginTop: "16px",
                  paddingTop: "16px",
                }}
              >
                <div
                  className="res-box"
                  style={{
                    background: "rgba(255,255,255,.08)",
                    borderColor: "rgba(255,255,255,.15)",
                  }}
                >
                  <div className="lbl" style={{ color: "rgba(255,255,255,.6)" }}>
                    RECOMMENDED SPAN
                  </div>
                  <div className="val" style={{ color: "#fff" }} id="recSpan">
                    {calcThick >= 19 ? 'Max 40"' : 'Max 30"'}
                  </div>
                </div>
                <div
                  className="res-box"
                  style={{
                    background: "rgba(255,255,255,.08)",
                    borderColor: "rgba(255,255,255,.15)",
                  }}
                >
                  <div className="lbl" style={{ color: "rgba(255,255,255,.6)" }}>
                    MODULUS (MOE)
                  </div>
                  <div className="val" style={{ color: "#fff" }}>
                    7,800 N/mm²
                  </div>
                </div>
                <div
                  className="res-box"
                  style={{
                    background: "rgba(255,255,255,.08)",
                    borderColor: "rgba(255,255,255,.15)",
                  }}
                >
                  <div className="lbl" style={{ color: "rgba(255,255,255,.6)" }}>
                    BOND STRENGTH
                  </div>
                  <div className="val" style={{ color: "#fff" }}>
                    Pass 72h Boil
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           3. CHARTS SECTION — BOILING WATER RESISTANCE
           ============================================================ */}
      <section className="section" id="chartsSection" style={{ borderBottom: "1px solid var(--recessed)" }}>
        <div className="container">
          <div className="eyebrow">RESIN ADHESION BENCHMARK</div>
          <h2
            style={{
              fontSize: "clamp(28px,3.8vw,42px)",
              fontWeight: 500,
              color: "var(--slate)",
              letterSpacing: "-.035em",
              marginBottom: "10px",
            }}
          >
            Boiling Water Delamination Endurance (Hours)
          </h2>
          <p style={{ color: "var(--text)", maxWidth: "680px", lineHeight: 1.6, marginBottom: "28px" }}>
            Tested per IS 1734 Part 6: Boiling Water Resistance test measuring hours before synthetic
            resin delaminates or separates plies.
          </p>

          <div className="curve-chart-box">
            <div className="chart-bars">
              <div className="bar-group">
                <div className="bar" style={{ height: "15px", background: "var(--recessed)" }}>
                  <span className="bar-val">0.25h</span>
                </div>
                <span className="bar-lbl">Commercial MR</span>
              </div>
              <div className="bar-group">
                <div className="bar" style={{ height: "45px", background: "var(--taupe)" }}>
                  <span className="bar-val">8h</span>
                </div>
                <span className="bar-lbl">Standard BWR</span>
              </div>
              <div className="bar-group">
                <div className="bar" style={{ height: "90px", background: "var(--slate-light)" }}>
                  <span className="bar-val">24h</span>
                </div>
                <span className="bar-lbl">Extended BWR</span>
              </div>
              <div className="bar-group">
                <div className="bar accent" style={{ height: "210px" }}>
                  <span className="bar-val">&gt; 72 Hours</span>
                </div>
                <span className="bar-lbl">Ostaad IS:710 Marine</span>
              </div>
            </div>

            <div
              style={{
                marginTop: "20px",
                paddingTop: "14px",
                borderTop: "1px solid var(--recessed)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <span style={{ fontSize: "12.5px", color: "var(--text)" }}>
                Bonded exclusively with unextended phenol formaldehyde resin: zero core gaps and zero
                veneer separation even in sunken under-sink cabinet environments.
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--taupe)" }}>
                TEST BENCHMARK: IS 710 : 2010 COMPLIANT
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           4. BENCHMARK MATRIX SECTION
           ============================================================ */}
      <section className="section" id="matrixSection">
        <div className="container">
          <div className="card" style={{ padding: "32px" }}>
            <div className="eyebrow">BIS BENCHMARK MATRIX</div>
            <h2
              style={{
                fontSize: "clamp(28px,3.8vw,42px)",
                fontWeight: 500,
                color: "var(--slate)",
                letterSpacing: "-.035em",
                marginBottom: "10px",
              }}
            >
              Plywood Specification Compliance (IS 710 vs IS 303)
            </h2>
            <p style={{ color: "var(--text)", maxWidth: "680px", lineHeight: 1.6, marginBottom: "16px" }}>
              Bureau of Indian Standards parameter comparison for Marine Grade (IS 710), Boiling Water
              Resistant (IS 303 BWR), and Commercial Moisture Resistant (IS 303 MR).
            </p>

            <div className="table-responsive-wrap">
              <table className="spec-table">
                <thead>
                  <tr>
                    <th>TECHNICAL PARAMETER</th>
                    <th>IS 710 BWP MARINE</th>
                    <th>IS 303 BWR GRADE</th>
                    <th>IS 303 MR COMMERCIAL</th>
                    <th>TEST PROCEDURE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Boiling Water Test</strong>
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", color: "#70533C", fontWeight: 600 }}>
                        Pass 72 Hours Boiling
                      </span>
                    </td>
                    <td>Pass 8 Hours Boiling</td>
                    <td>Fails under 15 minutes</td>
                    <td>IS 1734 (Part 6)</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Adhesive Type</strong>
                    </td>
                    <td>Unextended Phenolic (PF)</td>
                    <td>Fortified Melamine Urea</td>
                    <td>Urea Formaldehyde (UF)</td>
                    <td>Chemical Analysis</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Mycological Resistance</strong>
                    </td>
                    <td>Resistant to wood rot / fungi</td>
                    <td>Moderate Resistance</td>
                    <td>Vulnerable in damp zones</td>
                    <td>IS 1734 (Part 7)</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Screw Holding Force</strong>
                    </td>
                    <td>&gt; 280 KGF (Face) / &gt; 220 KGF (Edge)</td>
                    <td>&gt; 200 KGF (Face)</td>
                    <td>&gt; 150 KGF (Face)</td>
                    <td>IS 1734 (Part 11)</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Ideal Joinery Application</strong>
                    </td>
                    <td>Kitchen Carcasses, Vanities, Roof Decks</td>
                    <td>Bedroom Wardrobes & Paneling</td>
                    <td>Dry Living Furniture Only</td>
                    <td>Application Audit</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mobile-swipe-hint">← Swipe horizontally to view full matrix →</div>
          </div>
        </div>
      </section>

      {/* ============================================================
           REQUEST QUOTE / BOQ INTEGRATION DIALOG MODAL
           ============================================================ */}
      <div
        className={`boq-modal-backdrop ${isModalOpen ? "open" : ""}`}
        id="boqModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="boqModalTitle"
        style={{ display: isModalOpen ? "flex" : "none" }}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div className="boq-modal-dialog">
          <button
            type="button"
            className="boq-modal-close"
            id="closeBoqModal"
            aria-label="Close dialog"
            onClick={closeModal}
          >
            ×
          </button>

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
                You must be logged in to request a verified mill-direct bulk quote and joinery BOQ
                schedule for your project.
              </p>

              <div
                className="boq-spec-badge"
                style={{ maxWidth: "440px", margin: "0 auto 24px", textAlign: "left" }}
              >
                <span className="boq-spec-label">TARGET MATERIAL SPECIFICATION</span>
                <span className="boq-spec-val" id="boqGateSpecVal">
                  {currentProduct.specText}
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
          ) : !isSuccess ? (
            <div id="boqFormContainer">
              <div className="boq-modal-header">
                <span className="boq-eyebrow">MILL-DIRECT PROCUREMENT & BOQ</span>
                <h3 id="boqModalTitle">Request Verified Bulk Quote</h3>
                <p>
                  Connect verified factory rates and laboratory testing baseline directly into your
                  project&apos;s procurement schedule.
                </p>

                <div className="boq-spec-badge" id="boqSpecBadge">
                  <span className="boq-spec-label">TARGET MATERIAL SPECIFICATION</span>
                  <span className="boq-spec-val" id="boqSpecVal">
                    {currentProduct.specText}
                  </span>
                </div>
              </div>

              <form id="boqForm" className="boq-form" onSubmit={handleModalSubmit}>
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
                      <option value="Carpentry & Woodwork Framing">Carpentry & Woodwork Framing</option>
                      <option value="Brickwork & Plastering">Brickwork & Plastering</option>
                      <option value="Structural RCC Casting">Structural RCC Casting</option>
                      <option value="Planning & Architectural Drawings">
                        Planning & Architectural Drawings
                      </option>
                    </select>
                  </div>

                  <div className="boq-field">
                    <label htmlFor="boqQty">ESTIMATED QUANTITY (SHEETS)</label>
                    <input
                      type="text"
                      id="boqQty"
                      name="quantity"
                      placeholder="e.g. ~30 Sheets (8x4 ft)"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    />
                  </div>

                  <div className="boq-field full">
                    <label htmlFor="boqNotes">PROJECT NOTES & CALIBRATION REQUIREMENTS</label>
                    <textarea
                      id="boqNotes"
                      name="notes"
                      rows={3}
                      placeholder="Specify sheet dimensions, thickness mix (12mm/19mm), site delivery timeline."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="boqSubmitBtn"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "14px",
                    fontSize: "14px",
                    borderRadius: "12px",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                  }}
                >
                  <span>
                    {isSubmitting
                      ? "⏳ Sending to Engineering Desk..."
                      : "Submit Quote Request to Engineering Desk"}
                  </span>{" "}
                  {!isSubmitting && <span className="arrow">→</span>}
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
                    Calibrated ±0.1mm · 100% PF Phenolic Resin · Zero Core Gaps
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
                Your marine plywood procurement inquiry for{" "}
                <strong id="boqSuccessSpec">{currentProduct.title}</strong> has been logged. An
                audited quote and test certificates will be sent to{" "}
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
                onClick={closeModal}
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
    </main>
  );
}
