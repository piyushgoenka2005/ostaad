"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { saveUserBOQ } from "@/lib/firebase/firestore";

interface FinishMeta {
  title: string;
  badge: string;
  badgeBg: string;
  rateLabel: string;
  price: number;
  unit: string;
  scrub: string;
  sheen: string;
  specText: string;
  img: string;
  alt: string;
}

const FINISH_DATA: Record<"eggshell" | "silk", FinishMeta> = {
  eggshell: {
    title: "Architectural Low-VOC Micro-Porous Acrylic Emulsion (Matt Eggshell)",
    badge: "LOW-VOC EGGSHELL",
    badgeBg: "var(--sage)",
    rateLabel: "₹34 / Sq Ft Applied (Eggshell)",
    price: 34,
    unit: "/ SQ FT (2 COATS) · TAX INCL.",
    scrub: "> 2,000 Wet Cycles without sheen degradation",
    sheen: "8–12% (Muted Warm Eggshell)",
    specText: "Architectural Low-VOC Interior Emulsion · Class A IS 15489 (₹34/sq ft)",
    img: "/images/products/paint-lowvoc.jpg",
    alt: "Architectural Low-VOC Matt Eggshell Paint",
  },
  silk: {
    title: "Architectural Satin Silk Luxury Interior Emulsion",
    badge: "SATIN SILK ACTIVE",
    badgeBg: "var(--slate)",
    rateLabel: "₹42 / Sq Ft Applied (Satin Silk)",
    price: 42,
    unit: "/ SQ FT (2 COATS) · TAX INCL.",
    scrub: "> 3,500 Wet Scrub Cycles (Ultra Scrub Resistance)",
    sheen: "22–28% (Rich Satin Silk)",
    specText: "Architectural Satin Silk Interior Luxury Emulsion · IS 15489 (₹42/sq ft)",
    img: "/images/products/paint-lowvoc.jpg",
    alt: "Architectural Satin Silk Luxury Paint",
  },
};

const SWATCHES = [
  { color: "#EDE8DF", name: "Raw Calico" },
  { color: "#E2DDD4", name: "Limestone Neutral" },
  { color: "#D6CFBE", name: "Oatmeal Mineral" },
  { color: "#C4BDAE", name: "Clay Taupe" },
  { color: "#7C8764", name: "Earthy Sage" },
  { color: "#23384F", name: "Deep Midnight Slate" },
];

export default function PaintProductPage() {
  const { user, profile } = useAuth();

  // Selected Finish: eggshell or silk
  const [selectedFinish, setSelectedFinish] = useState<"eggshell" | "silk">("eggshell");

  // Palette State
  const [activeSwatch, setActiveSwatch] = useState(SWATCHES[0]);

  // Calculator State
  const [carpetArea, setCarpetArea] = useState<number>(1200);
  const [surfaceCondition, setSurfaceCondition] = useState<"fresh" | "repaint">("fresh");

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

  // Calculator computations (2.8 standard residential height multiplier)
  const wallSurface = Math.round(carpetArea * 2.8);
  const { products } = useProducts();

  const dynamicPaint = products.find(
    (p) =>
      p.id === "prod_paint_primer" ||
      p.category === "Paint"
  );

  const finishData = {
    eggshell: {
      ...FINISH_DATA.eggshell,
      ...(dynamicPaint
        ? {
            title: dynamicPaint.title || FINISH_DATA.eggshell.title,
            price: dynamicPaint.price || FINISH_DATA.eggshell.price,
            img: dynamicPaint.image || FINISH_DATA.eggshell.img,
          }
        : {}),
    },
    silk: {
      ...FINISH_DATA.silk,
      ...(dynamicPaint
        ? {
            img: dynamicPaint.image || FINISH_DATA.silk.img,
          }
        : {}),
    },
  };

  const currentFinishObj = finishData[selectedFinish];
  const rateSqFt = currentFinishObj.price;
  const totalCost = wallSurface * rateSqFt;
  const emulsionLiters = Math.ceil(wallSurface / 150);
  const primerLiters = surfaceCondition === "fresh" ? Math.ceil(wallSurface / 200) : Math.ceil(wallSurface / 350);

  // Modal Submit
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        access_key: "6d71ee60-2f5a-436e-b445-ec657bf48f2a",
        subject: `Bulk Paint Quote Request - ${currentFinishObj.specText} - Ostaad`,
        from_name: "Ostaad Paint Procurement Desk",
        specification: currentFinishObj.specText,
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
          materialSpec: currentFinishObj.specText,
          quantity: formData.quantity || `${emulsionLiters} Litres Emulsion`,
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
            <Link href="/products?cat=paint">Products</Link> <span className="sep">›</span>
            <span className="current" id="crumbTitle">
              Architectural Low-VOC Paint
            </span>
          </div>

          <div className="product-showcase-grid">
            {/* LEFT COLUMN: Product Pack & Consultation */}
            <div className="gallery-col">
              <div className="main-pack-view">
                <span
                  className="pack-badge-grade"
                  id="badgeGrade"
                  style={{ background: currentFinishObj.badgeBg }}
                >
                  {currentFinishObj.badge}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  id="mainPackImg"
                  src={currentFinishObj.img}
                  alt={currentFinishObj.alt}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = "/images/products/paint-lowvoc.jpg";
                  }}
                />
                <span className="pack-badge-cert">IS 15489 CLASS A</span>
              </div>

              {/* Thumbnail selector to toggle between Matt Eggshell and Satin Silk */}
              <div className="pack-thumbnails">
                <button
                  type="button"
                  className={`thumb-btn ${selectedFinish === "eggshell" ? "active" : ""}`}
                  id="thumbEggshell"
                  onClick={() => setSelectedFinish("eggshell")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={finishData.eggshell.img}
                    alt="Matt Eggshell"
                    className="thumb-img"
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.src = "/images/products/paint-lowvoc.jpg"; }}
                  />
                  <div>
                    <span className="thumb-title">Matt Eggshell</span>
                    <span className="thumb-sub">₹{finishData.eggshell.price}/sqft · Low Sheen</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`thumb-btn ${selectedFinish === "silk" ? "active" : ""}`}
                  id="thumbSilk"
                  onClick={() => setSelectedFinish("silk")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={finishData.silk.img}
                    alt="Satin Silk"
                    className="thumb-img"
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.src = "/images/products/paint-lowvoc.jpg"; }}
                  />
                  <div>
                    <span className="thumb-title">Satin Silk</span>
                    <span className="thumb-sub">₹{finishData.silk.price}/sqft · Washable</span>
                  </div>
                </button>
              </div>

              <div className="need-help-box">
                <h4>Need Shade Card Consultation?</h4>
                <p>
                  Our architectural finishes team provides physical swatch boxes and on-site wall
                  moisture testing before primer application.
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
                  {currentFinishObj.title}
                </h1>
                <div className="detail-meta-bar">
                  <div className="meta-verified-tag" id="verifiedMetaTag">
                    ⚡ 540+ Homes Painted · Verified Direct Mill Baseline
                  </div>
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
                    <span id="rateLabel">{currentFinishObj.rateLabel}</span> · Direct Factory Benchmark.
                  </div>
                </div>
                <div className="offer-item">
                  <span className="chk">✓</span>
                  <div>
                    <strong>Zero-Chalking Guarantee:</strong> Formulated with 100% pure cross-linking
                    acrylic copolymers preventing surface dust shedding.
                  </div>
                </div>
                <div className="offer-item">
                  <span className="chk">✓</span>
                  <div>
                    <strong>Tamper-Proof Hermetic Pails:</strong> High-density poly pails with tear-strip
                    tamper-proof seals preventing adulteration with excess water.
                  </div>
                </div>
              </div>

              {/* Trust Badges Row */}
              <div className="trust-badges-row">
                <div className="trust-pill">
                  <span className="ico">🚚</span>
                  <span className="t-label">Assured Direct Delivery</span>
                  <span className="t-sub">Site dispatch in 24–48 hrs</span>
                </div>
                <div className="trust-pill">
                  <span className="ico">🌿</span>
                  <span className="t-label">Ultra Low-VOC (&lt;15 g/L)</span>
                  <span className="t-sub">Child-safe & immediate occupancy</span>
                </div>
                <div className="trust-pill">
                  <span className="ico">🛡️</span>
                  <span className="t-label">BIS Certified Quality</span>
                  <span className="t-sub">IS 15489 Class A Premium</span>
                </div>
              </div>

              {/* Technical Specifications Table */}
              <div className="specs-sheet-card">
                <h3>Technical Specifications</h3>
                <table className="specs-sheet-table">
                  <tbody>
                    <tr>
                      <th>Coating System</th>
                      <td id="specType">Pure Acrylic Copolymer Micro-Porous Emulsion</td>
                    </tr>
                    <tr>
                      <th>Standard Compliance</th>
                      <td id="specStandard">IS 15489 : 2013 Class A Interior Specification</td>
                    </tr>
                    <tr>
                      <th>VOC Emissions</th>
                      <td>&lt; 15 g/L (Meets IGBC & GRIHA Green Building norms)</td>
                    </tr>
                    <tr>
                      <th>Scrub Washability</th>
                      <td id="specScrub">{currentFinishObj.scrub}</td>
                    </tr>
                    <tr>
                      <th>Theoretical Coverage</th>
                      <td>140–160 Sq Ft / Litre (2 coats on primed masonry)</td>
                    </tr>
                    <tr>
                      <th>Drying Time (30°C)</th>
                      <td>Surface Touch: 30–45 mins · Recoat: 4 hours</td>
                    </tr>
                    <tr>
                      <th>Sheen Value (@60°)</th>
                      <td id="specSheen">{currentFinishObj.sheen}</td>
                    </tr>
                    <tr>
                      <th>Bio-Inhibitor</th>
                      <td>Zinc-pyrithione anti-fungal & anti-mildew additive</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT COLUMN: Procurement Box */}
            <div className="procure-col">
              <div className="procure-card">
                <div className="procure-shipper">
                  DISPATCHED FROM BATCH CHEMICAL PLANTS
                  <strong>Fresh Batch Clinker Milling · Seal Inspected</strong>
                </div>

                <div className="procure-price-wrap">
                  <span className="lbl">VERIFIED APPLIED RATE</span>
                  <div className="amt" id="procurePrice">
                    ₹{currentFinishObj.price}
                  </div>
                  <span className="sub" id="procureUnit">
                    {currentFinishObj.unit}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button
                    type="button"
                    id="topRequestQuoteBtn"
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary"
                    style={{ justifyContent: "center", cursor: "pointer" }}
                  >
                    Request Quote for Bulk <span className="arrow">→</span>
                  </button>
                  <a
                    href="#paintCalc"
                    className="btn btn-secondary"
                    style={{ justifyContent: "center" }}
                  >
                    Calculate Paint Quota ↓
                  </a>
                </div>

                <div className="procure-how-it-works">
                  <h4>How does Ostaad Bulk Buying work?</h4>
                  <div className="procure-step">
                    <span className="step-dot">1</span>
                    <div>
                      <strong>Input Carpet Area:</strong> Our multiplier calculates exact 2-coat wall volume.
                    </div>
                  </div>
                  <div className="procure-step">
                    <span className="step-dot">2</span>
                    <div>
                      <strong>Transparent Rate:</strong> Transparent direct-mill pricing with zero paint dealer markups.
                    </div>
                  </div>
                  <div className="procure-step">
                    <span className="step-dot">3</span>
                    <div>
                      <strong>Site Delivery:</strong> Factory sealed pails delivered directly to your project site.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           2. PAINT CALCULATOR SECTION
           ============================================================ */}
      <section
        className="section"
        id="paintCalc"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--recessed)" }}
      >
        <div className="container">
          <div className="eyebrow">PAINT CALCULATOR</div>
          <h2
            style={{
              fontSize: "clamp(28px,3.8vw,42px)",
              fontWeight: 500,
              color: "var(--slate)",
              letterSpacing: "-.035em",
              marginBottom: "10px",
            }}
          >
            Paint Calculator — Surface Coverage & Primer Estimator
          </h2>
          <p style={{ color: "var(--text)", maxWidth: "680px", lineHeight: 1.6 }}>
            Input your home carpet area to estimate net paintable wall surface (using standard 2.8×
            multiplier for 10ft ceiling height), required primer litres, and total emulsion volume.
          </p>

          <div className="sim-grid">
            <div className="card" style={{ padding: "26px" }}>
              <h3 style={{ fontSize: "17px", color: "var(--slate)", marginBottom: "18px" }}>
                Space Dimensions & Finish
              </h3>

              <div className="calc-field">
                <label htmlFor="carpetArea">FLOOR CARPET AREA (SQ FT)</label>
                <input
                  type="number"
                  id="carpetArea"
                  className="calc-input"
                  value={carpetArea}
                  min={100}
                  max={25000}
                  onChange={(e) => setCarpetArea(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="calc-field">
                <label htmlFor="finishSelect">DESIRED SHEEN / FORMULATION</label>
                <select
                  id="finishSelect"
                  className="calc-select"
                  value={selectedFinish}
                  onChange={(e) => setSelectedFinish(e.target.value as any)}
                >
                  <option value="eggshell">Low-VOC Matt Eggshell (₹34 / sq ft applied)</option>
                  <option value="silk">Satin Silk Luxury (₹42 / sq ft applied)</option>
                </select>
              </div>

              <div className="calc-field">
                <label htmlFor="surfaceSelect">SURFACE CONDITION</label>
                <select
                  id="surfaceSelect"
                  className="calc-select"
                  value={surfaceCondition}
                  onChange={(e) => setSurfaceCondition(e.target.value as any)}
                >
                  <option value="fresh">Fresh Plaster / Bare Wall (Needs Acrylic Primer)</option>
                  <option value="repaint">Repainting over Sound Old Surface</option>
                </select>
              </div>
            </div>

            <div className="card" style={{ background: "var(--slate)", color: "#fff", padding: "26px" }}>
              <div className="eyebrow" style={{ color: "rgba(255,255,255,.6)" }}>
                CALCULATED PROCUREMENT QUOTA
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 600,
                  fontFamily: "var(--font-mono)",
                  margin: "10px 0",
                }}
                id="calcWallArea"
                suppressHydrationWarning
              >
                {wallSurface.toLocaleString("en-IN")} Sq Ft
              </div>
              <p
                style={{
                  fontSize: "13.5px",
                  color: "rgba(255,255,255,.75)",
                  marginBottom: "20px",
                }}
                id="calcAreaDesc"
                suppressHydrationWarning
              >
                Estimated wall & ceiling surface: {carpetArea.toLocaleString("en-IN")} sq ft carpet × 2.8 standard residential height multiplier.
              </p>

              <div className="calc-res-grid">
                <div
                  className="res-box"
                  style={{
                    background: "rgba(255,255,255,.1)",
                    borderColor: "rgba(255,255,255,.15)",
                  }}
                >
                  <div className="lbl" style={{ color: "rgba(255,255,255,.6)" }}>
                    EMULSION REQD
                  </div>
                  <div className="val" style={{ color: "#fff" }} id="calcEmulsion" suppressHydrationWarning>
                    {emulsionLiters} Litres
                  </div>
                </div>
                <div
                  className="res-box"
                  style={{
                    background: "rgba(255,255,255,.1)",
                    borderColor: "rgba(255,255,255,.15)",
                  }}
                >
                  <div className="lbl" style={{ color: "rgba(255,255,255,.6)" }}>
                    PRIMER REQD
                  </div>
                  <div className="val" style={{ color: "#fff" }} id="calcPrimer" suppressHydrationWarning>
                    {primerLiters} Litres
                  </div>
                </div>
                <div
                  className="res-box"
                  style={{
                    background: "rgba(255,255,255,.1)",
                    borderColor: "rgba(255,255,255,.15)",
                  }}
                >
                  <div className="lbl" style={{ color: "rgba(255,255,255,.6)" }}>
                    TOTAL EST. COST
                  </div>
                  <div className="val" style={{ color: "#fff" }} id="calcTotalCost" suppressHydrationWarning>
                    ₹{totalCost.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           3. INTERACTIVE PALETTE & SHADE PREVIEW
           ============================================================ */}
      <section className="section" id="paletteSection">
        <div className="container">
          <div className="eyebrow">ARCHITECTURAL PALETTE</div>
          <h2
            style={{
              fontSize: "clamp(28px,3.8vw,42px)",
              fontWeight: 500,
              color: "var(--slate)",
              letterSpacing: "-.035em",
              marginBottom: "10px",
            }}
          >
            Curated Mineral Pigments
          </h2>
          <p style={{ color: "var(--text)", maxWidth: "620px", marginBottom: "30px" }}>
            Test curated architectural tones under simulated neutral daylight illumination. All shades
            are calibrated with non-fading lightfast inorganic oxides.
          </p>

          <div className="card" style={{ padding: "32px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "20px",
                flexWrap: "wrap",
                marginBottom: "24px",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10.5px",
                    color: "var(--taupe)",
                    letterSpacing: ".08em",
                  }}
                >
                  SELECTED PIGMENT TONE
                </div>
                <h3 style={{ fontSize: "20px", color: "var(--slate)", marginTop: "4px" }} id="swatchTitle">
                  {activeSwatch.name} ({activeSwatch.color})
                </h3>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                {SWATCHES.map((swatch) => (
                  <button
                    key={swatch.name}
                    type="button"
                    className={`swatch-btn ${activeSwatch.name === swatch.name ? "active" : ""}`}
                    style={{ background: swatch.color }}
                    data-color={swatch.color}
                    data-name={swatch.name}
                    title={swatch.name}
                    onClick={() => setActiveSwatch(swatch)}
                  />
                ))}
              </div>
            </div>

            <div
              id="paletteBox"
              style={{
                height: "180px",
                borderRadius: "14px",
                background: activeSwatch.color,
                border: "1px solid var(--recessed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background .35s var(--ease)",
                boxShadow: "inset 0 2px 8px rgba(0,0,0,.04)",
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,.85)",
                  backdropFilter: "blur(8px)",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "var(--slate)",
                }}
              >
                ⚡ 100% Lightfast Inorganic Pigmentation
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           4. BENCHMARK MATRIX (BIS IS 15489 COMPLIANCE)
           ============================================================ */}
      <section
        className="section"
        id="matrixSection"
        style={{ background: "var(--surface)", borderTop: "1px solid var(--recessed)" }}
      >
        <div className="container">
          <div className="card" style={{ padding: "32px" }}>
            <div className="eyebrow">TECHNICAL COMPLIANCE AUDIT</div>
            <h3
              style={{
                fontSize: "22px",
                color: "var(--slate)",
                marginBottom: "6px",
                letterSpacing: "-.02em",
              }}
            >
              Bureau of Indian Standards (BIS) Paint Matrix
            </h3>
            <p
              style={{
                color: "var(--taupe)",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                marginBottom: "16px",
              }}
            >
              IS 15489 PLASTIC EMULSION PHYSICAL AUDIT CRITERIA
            </p>

            <div className="table-responsive-wrap">
              <table className="spec-table">
                <thead>
                  <tr>
                    <th>TECHNICAL PARAMETER</th>
                    <th style={{ color: "var(--slate)", background: "rgba(35,56,79,.08)" }}>
                      CLASS A (PREMIUM OSTAAD BENCHMARK)
                    </th>
                    <th>CLASS B (STANDARD COMMERCIAL)</th>
                    <th>UNBRANDED DISTEMPER</th>
                    <th>TEST METHOD</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>VOC Content</strong>
                    </td>
                    <td style={{ color: "var(--sage)", fontWeight: 600 }}>
                      &lt; 25 g/L (Green Seal Certified)
                    </td>
                    <td>&lt; 85 g/L</td>
                    <td>&gt; 200 g/L</td>
                    <td>ASTM D3960 / IS 101</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Wet Scrub Resistance</strong>
                    </td>
                    <td style={{ color: "var(--slate)", fontWeight: 600 }}>
                      &gt; 2,000 Cycles (Class 1 Washable)
                    </td>
                    <td>&gt; 1,000 Cycles</td>
                    <td>&lt; 100 Cycles (Chalks & rubs off)</td>
                    <td>IS 101 (Part 5 / Sec 2)</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Recoat Time</strong>
                    </td>
                    <td>3 – 4 Hours</td>
                    <td>6 – 8 Hours</td>
                    <td>12 Hours</td>
                    <td>IS 101 (Part 3 / Sec 1)</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Theoretical Coverage</strong>
                    </td>
                    <td style={{ color: "var(--slate)", fontWeight: 600 }}>
                      140 – 160 sq ft / litre (2 coats)
                    </td>
                    <td>100 – 120 sq ft / litre</td>
                    <td>60 – 80 sq ft / litre</td>
                    <td>BIS Standard Spread Rate</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Anti-Fungal Efficacy</strong>
                    </td>
                    <td>Rating 1 (Zero Growth in 28 Days)</td>
                    <td>Rating 2 (Slight Growth)</td>
                    <td>Rating 3 (Fails in Humid Zones)</td>
                    <td>IS 101 (Part 7 / Sec 3)</td>
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
                You must be logged in to request a verified mill-direct bulk quote and paint schedule
                audit for your project.
              </p>

              <div
                className="boq-spec-badge"
                style={{ maxWidth: "440px", margin: "0 auto 24px", textAlign: "left" }}
              >
                <span className="boq-spec-label">TARGET MATERIAL SPECIFICATION</span>
                <span className="boq-spec-val" id="boqGateSpecVal">
                  {currentFinishObj.specText}
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
                    {currentFinishObj.specText}
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
                      <option value="Flooring, Tiling & Finishing">
                        Flooring, Tiling & Finishing
                      </option>
                      <option value="Brickwork & Plastering">Brickwork & Plastering</option>
                      <option value="Structural RCC Casting">Structural RCC Casting</option>
                      <option value="Planning & Architectural Drawings">
                        Planning & Architectural Drawings
                      </option>
                    </select>
                  </div>

                  <div className="boq-field">
                    <label htmlFor="boqQty">ESTIMATED QUANTITY (LITRES / SQ FT)</label>
                    <input
                      type="text"
                      id="boqQty"
                      name="quantity"
                      placeholder="e.g. ~40 Litres / 1,200 sq ft home"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    />
                  </div>

                  <div className="boq-field full">
                    <label htmlFor="boqNotes">PROJECT NOTES & SHADE PREFERENCES</label>
                    <textarea
                      id="boqNotes"
                      name="notes"
                      rows={3}
                      placeholder="Specify shade names, site location, required timeline, or plaster condition."
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
                Your architectural paint procurement inquiry for{" "}
                <strong id="boqSuccessSpec">{currentFinishObj.title}</strong> has been logged. An
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
                  <span className="sla-val">Direct Factory Dispatch</span>
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
