"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { saveUserBOQ } from "@/lib/firebase/firestore";

interface WaterproofingMeta {
  title: string;
  badge: string;
  badgeBg: string;
  crumb: string;
  rateLabel: string;
  price: number;
  unit: string;
  typeSpec: string;
  coverageSpec: string;
  specText: string;
  img: string;
  alt: string;
}

const WATERPROOFING_DATA: Record<"2k" | "integral", WaterproofingMeta> = {
  "2k": {
    title: "2-Component Elastomeric Polymer Slurry Waterproofing Membrane",
    badge: "2K POLYMER SLURRY",
    badgeBg: "#244464",
    crumb: "2K Elastomeric Waterproofing Slurry",
    rateLabel: "₹2,450 / 20 KG Kit (2K Slurry)",
    price: 2450,
    unit: "/ 20 KG KIT · TAX INCLUSIVE",
    typeSpec: "2-Part Polymer Modified Cementitious Membrane (Liquid + Powder)",
    coverageSpec: "Approx. 240–280 Sq Ft for 2 Coats (20 KG Pack)",
    specText: "2K Elastomeric Slurry · Acrylic Polymer (₹2,450 / 20 KG Kit)",
    img: "/images/products/waterproofing-2k.jpg",
    alt: "2K Elastomeric Waterproofing Slurry",
  },
  integral: {
    title: "Integral Waterproofing Liquid Chemical Admixture",
    badge: "INTEGRAL LIQUID ACTIVE",
    badgeBg: "var(--slate)",
    crumb: "Integral Waterproofing Liquid Admixture",
    rateLabel: "₹145 / Litre (Integral Additive)",
    price: 145,
    unit: "/ LITRE · TAX INCLUSIVE",
    typeSpec: "Concentrated Hydrophobic Liquid Pore-Blocking Admixture",
    coverageSpec: "200 ml per 50 KG Cement Bag (Approx 1 Litre per 5 Bags)",
    specText: "Integral Waterproofing Liquid · Plasticizer Additive (₹145 / Litre)",
    img: "/images/products/waterproofing-2k.jpg",
    alt: "Integral Waterproofing Liquid Admixture",
  },
};

const LAYERS = [
  {
    level: "l5",
    code: "LAYER 5",
    name: "Tiling & Final Screed Protection",
    desc: "15–20mm protective cementitious mortar bed safeguarding the membrane against puncturing from subsequent floor tiling.",
  },
  {
    level: "l4",
    code: "LAYER 4",
    name: "2nd Coat: 2K Elastomeric Slurry",
    desc: "Brush or roller applied perpendicular to the 1st coat at 1.0mm thickness, achieving a seamless monolithic barrier.",
  },
  {
    level: "l3",
    code: "LAYER 3",
    name: "Non-Woven Glass Fibre Reinforcement Mesh",
    desc: "Embedded 45 GSM alkali-resistant glass fibre mesh at all 90° pipe penetrations, floor-to-wall fillets, and construction joints.",
  },
  {
    level: "l2",
    code: "LAYER 2",
    name: "1st Coat: 2K Slurry + Primer Penetration",
    desc: "Deep penetrating acrylic polymer primer locking into substrate pores, forming an anchor bridge with high cohesive bond strength.",
  },
  {
    level: "l1",
    code: "LAYER 1",
    name: "Prepared RCC Substrate (Cleaned & Cured)",
    desc: "Mechanically wire-brushed, acid-etched, saturated surface dry (SSD) parent concrete base free from dust, oil, and loose honeycombs.",
  },
];

export default function WaterproofingProductPage() {
  const { user, profile } = useAuth();

  // Selected system (2k or integral)
  const [selectedSystem, setSelectedSystem] = useState<"2k" | "integral">("2k");

  // Calculator State
  const [treatArea, setTreatArea] = useState<number>(1000);
  const [treatZone, setTreatZone] = useState<string>("sunken");
  const [calcSystem, setCalcSystem] = useState<"2k" | "integral">("2k");

  // Layer Explorer State
  const [activeLayer, setActiveLayer] = useState(LAYERS[1]);

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
    projectStage: "Sunken Slab & Wet Areas",
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

  const handleSystemSelect = (sys: "2k" | "integral") => {
    setSelectedSystem(sys);
    setCalcSystem(sys);
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

  // Calculator calculations
  const kits = Math.ceil(treatArea / 260);
  const cost = calcSystem === "2k" ? kits * 2450 : Math.round(treatArea * 0.35 * 145);
  const meshRft = Math.round(Math.sqrt(treatArea) * 4.5);
  const integralLitres = Math.round((treatArea / 100) * 4 * 0.2 * 10) / 10;

  const { products } = useProducts();

  const dynamicWaterproofing = products.find(
    (p) =>
      p.id === "prod_waterproofing_2k" ||
      p.category === "Waterproofing"
  );

  const waterproofingData = {
    "2k": {
      ...WATERPROOFING_DATA["2k"],
      ...(dynamicWaterproofing
        ? {
            title: dynamicWaterproofing.title || WATERPROOFING_DATA["2k"].title,
            price: dynamicWaterproofing.price || WATERPROOFING_DATA["2k"].price,
            img: dynamicWaterproofing.image || WATERPROOFING_DATA["2k"].img,
          }
        : {}),
    },
    integral: {
      ...WATERPROOFING_DATA.integral,
      ...(dynamicWaterproofing
        ? {
            img: dynamicWaterproofing.image || WATERPROOFING_DATA.integral.img,
          }
        : {}),
    },
  };

  const currentProduct = waterproofingData[selectedSystem];

  // Modal Submit
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        access_key: "6d71ee60-2f5a-436e-b445-ec657bf48f2a",
        subject: `Bulk Waterproofing Quote Request - ${currentProduct.specText} - Ostaad`,
        from_name: "Ostaad Chemical Procurement Desk",
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
          quantity: formData.quantity || `${kits} Kits (${treatArea} Sq Ft)`,
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
            <Link href="/products?cat=waterproofing">Products</Link> <span className="sep">›</span>
            <span className="current" id="crumbTitle">
              {currentProduct.crumb}
            </span>
          </div>

          <div className="product-showcase-grid">
            {/* LEFT COLUMN: Product Pack & Consultation */}
            <div className="gallery-col">
              <div className="main-pack-view">
                <span
                  className="pack-badge-grade"
                  id="badgeGrade"
                  style={{ background: currentProduct.badgeBg }}
                >
                  {currentProduct.badge}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  id="mainPackImg"
                  src={currentProduct.img}
                  alt={currentProduct.alt}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = "/images/products/waterproofing-2k.jpg";
                  }}
                />
                <span className="pack-badge-cert">IS 2645 / IS 101</span>
              </div>

              {/* Thumbnail selector to toggle between 2K Slurry and Integral */}
              <div className="pack-thumbnails">
                <button
                  type="button"
                  className={`thumb-btn ${selectedSystem === "2k" ? "active" : ""}`}
                  id="thumb2K"
                  onClick={() => handleSystemSelect("2k")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={waterproofingData["2k"].img}
                    alt="2K Elastomeric Slurry"
                    className="thumb-img"
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.src = "/images/products/waterproofing-2k.jpg"; }}
                  />
                  <div>
                    <span className="thumb-title">2K Polymer Slurry</span>
                    <span className="thumb-sub">₹{waterproofingData["2k"].price.toLocaleString("en-IN")}/Kit · Sunken/Terrace</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`thumb-btn ${selectedSystem === "integral" ? "active" : ""}`}
                  id="thumbIntegral"
                  onClick={() => handleSystemSelect("integral")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={waterproofingData.integral.img}
                    alt="Integral Liquid"
                    className="thumb-img"
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.src = "/images/products/waterproofing-2k.jpg"; }}
                  />
                  <div>
                    <span className="thumb-title">Integral Liquid</span>
                    <span className="thumb-sub">₹{waterproofingData.integral.price}/Litre · Plasticizer</span>
                  </div>
                </button>
              </div>

              <div className="need-help-box">
                <h4>Need Chemical Specification Guidance?</h4>
                <p>
                  Unsure whether your terrace requires 2K cementitious slurry or polyurethane hybrid
                  elastomer? Our construction chemicals engineer will audit your drawings.
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
                  <div className="meta-verified-tag">
                    ⚡ 380+ Wet Envelopes Sealed · Certified Chemical Baseline
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
                    <span id="rateLabel">{currentProduct.rateLabel}</span> · Direct Specialty Plant.
                  </div>
                </div>
                <div className="offer-item">
                  <span className="chk">✓</span>
                  <div>
                    <strong>Elastomeric Crack-Bridging:</strong> High-solids pure acrylic copolymer
                    bridges micro-fissures up to 1.2mm without tensile rupture.
                  </div>
                </div>
                <div className="offer-item">
                  <span className="chk">✓</span>
                  <div>
                    <strong>Positive & Negative Side Resistance:</strong> Resists hydrostatic water head
                    pressure up to 5 bar in sunken bathrooms and water retaining tanks.
                  </div>
                </div>
              </div>

              {/* Trust Badges Row */}
              <div className="trust-badges-row">
                <div className="trust-pill">
                  <span className="ico">🚚</span>
                  <span className="t-label">Direct Plant Freight</span>
                  <span className="t-sub">Site dispatch in 24–48 hrs</span>
                </div>
                <div className="trust-pill">
                  <span className="ico">🛡️</span>
                  <span className="t-label">5 Bar Hydrostatic Proof</span>
                  <span className="t-sub">DIN 1048 Certified</span>
                </div>
                <div className="trust-pill">
                  <span className="ico">🌿</span>
                  <span className="t-label">Potable Water Safe</span>
                  <span className="t-sub">Non-toxic certified slurry</span>
                </div>
              </div>

              {/* Technical Specifications Table */}
              <div className="specs-sheet-card">
                <h3>Technical Specifications</h3>
                <table className="specs-sheet-table">
                  <tbody>
                    <tr>
                      <th>Chemical Formulation</th>
                      <td id="specType">{currentProduct.typeSpec}</td>
                    </tr>
                    <tr>
                      <th>Standard Compliance</th>
                      <td>IS 2645 : 2003 / ASTM C1305 / DIN 1048</td>
                    </tr>
                    <tr>
                      <th>Tensile Elongation @ Break</th>
                      <td>&gt; 120% Elastic Recovery at 28 days</td>
                    </tr>
                    <tr>
                      <th>Hydrostatic Resistance</th>
                      <td>Passes 5 Bar (50m Head Pressure)</td>
                    </tr>
                    <tr>
                      <th>Adhesion Bond Strength</th>
                      <td>&gt; 1.5 N/mm² to concrete substrate</td>
                    </tr>
                    <tr>
                      <th>Theoretical Coverage</th>
                      <td id="specCoverage">{currentProduct.coverageSpec}</td>
                    </tr>
                    <tr>
                      <th>Pot Life @ 30°C</th>
                      <td>45 Minutes after liquid-powder mixing</td>
                    </tr>
                    <tr>
                      <th>Packaging Metric</th>
                      <td>20 KG Kit (10 KG Liquid Polymer + 10 KG Reactive Powder)</td>
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
                  Sold by <strong>Direct Specialty Chemical Plant</strong>
                </div>

                <div className="procure-price-wrap">
                  <div className="lbl">TRANSPARENT PROCUREMENT BENCHMARK</div>
                  <div className="amt" id="procurePrice">
                    ₹{currentProduct.price.toLocaleString()}
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
                  href="#chemCalc"
                  className="btn btn-secondary"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Calculate Chemical Quota ↓
                </a>

                <div className="procure-how-it-works">
                  <h4>How does Ostaad Bulk Buying work?</h4>
                  <div className="procure-step">
                    <span className="step-dot">1</span>
                    <div>
                      <strong>Input Treatment Area:</strong> Calculate net square footage with 2-coat
                      application and corner mesh.
                    </div>
                  </div>
                  <div className="procure-step">
                    <span className="step-dot">2</span>
                    <div>
                      <strong>Transparent Rate:</strong> Direct chemical plant benchmark with zero
                      distributor tier inflation.
                    </div>
                  </div>
                  <div className="procure-step">
                    <span className="step-dot">3</span>
                    <div>
                      <strong>Site Delivery:</strong> Sealed poly pails with batch lab certificates
                      delivered to your site.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           2. WATERPROOFING CALCULATOR SECTION
           ============================================================ */}
      <section
        className="section"
        id="chemCalc"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--recessed)" }}
      >
        <div className="container">
          <div className="eyebrow">WATERPROOFING CALCULATOR</div>
          <h2
            style={{
              fontSize: "clamp(28px,3.8vw,42px)",
              fontWeight: 500,
              color: "var(--slate)",
              letterSpacing: "-.035em",
              marginBottom: "10px",
            }}
          >
            Chemical Dosage & Coverage Estimator
          </h2>
          <p style={{ color: "var(--text)", maxWidth: "680px", lineHeight: 1.6 }}>
            Input your sunken bathroom, roof terrace, or basement area to estimate total 2K polymer
            kits, fiber mesh reinforcement running feet, and integral liquid plasticizer litres.
          </p>

          <div className="sim-grid">
            <div className="card" style={{ padding: "26px" }}>
              <h3 style={{ fontSize: "17px", color: "var(--slate)", marginBottom: "18px" }}>
                Treatment Area & Zone
              </h3>

              <div className="calc-field">
                <label htmlFor="treatArea">TOTAL SURFACE TREATMENT AREA (SQ FT)</label>
                <input
                  type="number"
                  id="treatArea"
                  className="calc-input"
                  value={treatArea}
                  min={50}
                  max={25000}
                  onChange={(e) => setTreatArea(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="calc-field">
                <label htmlFor="zoneSelect">STRUCTURAL WET ZONE</label>
                <select
                  id="zoneSelect"
                  className="calc-select"
                  value={treatZone}
                  onChange={(e) => setTreatZone(e.target.value)}
                >
                  <option value="sunken">Sunken Bathroom & Wet Toilet Slab</option>
                  <option value="terrace">Exposed Roof Terrace & Parapet Walls</option>
                  <option value="tank">Underground / Overhead Water Tank</option>
                  <option value="basement">Basement Retaining Wall & Footing</option>
                </select>
              </div>

              <div className="calc-field" style={{ marginBottom: 0 }}>
                <label htmlFor="chemSpecSelect">CHEMICAL SYSTEM SPECIFICATION</label>
                <select
                  id="chemSpecSelect"
                  className="calc-select"
                  value={calcSystem}
                  onChange={(e) => setCalcSystem(e.target.value as any)}
                >
                  <option value="2k">2K Elastomeric Polymer Slurry (₹2,450 / 20 KG Kit)</option>
                  <option value="integral">Integral Waterproofing Liquid Admixture (₹145 / Litre)</option>
                </select>
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
                CALCULATED PROCUREMENT QUOTA
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "36px",
                  fontWeight: 700,
                  lineHeight: 1,
                  margin: "12px 0",
                }}
                id="calcKits"
                suppressHydrationWarning
              >
                {calcSystem === "2k"
                  ? `${kits} Kits Required`
                  : `${Math.ceil(treatArea * 0.08)} Litres Required`}
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,.75)",
                  marginBottom: "20px",
                }}
                id="calcAreaDesc"
                suppressHydrationWarning
              >
                Based on {treatArea.toLocaleString("en-IN")} sq ft treatment area with 2 perpendicular cross-coats.
              </p>

              <div className="calc-res-grid" style={{ borderTopColor: "rgba(255,255,255,.15)" }}>
                <div
                  className="res-box"
                  style={{
                    background: "rgba(255,255,255,.08)",
                    borderColor: "rgba(255,255,255,.15)",
                  }}
                >
                  <div className="lbl" style={{ color: "rgba(255,255,255,.6)" }}>
                    TOTAL COST
                  </div>
                  <div className="val" style={{ color: "#fff" }} id="calcCost" suppressHydrationWarning>
                    ₹{cost.toLocaleString("en-IN")}
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
                    CORNER MESH
                  </div>
                  <div className="val" style={{ color: "#fff" }} id="calcMesh">
                    {meshRft} RFT
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
                    INTEGRAL ADDITIVE
                  </div>
                  <div className="val" style={{ color: "#fff" }} id="calcIntegral">
                    {integralLitres} Litres
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           3. CUTAWAY LAYER EXPLORER
           ============================================================ */}
      <section
        className="section"
        id="layerExplorer"
        style={{ borderBottom: "1px solid var(--recessed)" }}
      >
        <div className="container">
          <div className="eyebrow">APPLICATION METHODOLOGY</div>
          <h2
            style={{
              fontSize: "clamp(28px,3.8vw,42px)",
              fontWeight: 500,
              color: "var(--slate)",
              letterSpacing: "-.035em",
              marginBottom: "10px",
            }}
          >
            Multi-Layer Wet Envelope Cutaway Explorer
          </h2>
          <p style={{ color: "var(--text)", maxWidth: "680px", lineHeight: 1.6, marginBottom: "28px" }}>
            Click through each layer to inspect the engineering sequencing required for 100% leak-proof
            sunken slabs and podium decks.
          </p>

          <div className="sim-grid">
            <div className="layer-cutaway">
              {LAYERS.map((layer) => (
                <div
                  key={layer.level}
                  className={`layer-strip ${layer.level} ${
                    activeLayer.level === layer.level ? "active" : ""
                  }`}
                  onClick={() => setActiveLayer(layer)}
                >
                  <span>
                    <strong>{layer.code}:</strong> {layer.name}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                    {activeLayer.level === layer.level ? "▶ SELECTED" : "SELECT →"}
                  </span>
                </div>
              ))}
            </div>

            <div className="layer-desc-box">
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--taupe)",
                  letterSpacing: ".08em",
                }}
              >
                LAYER SPECIFICATION & METHOD STATEMENT
              </span>
              <h3 style={{ fontSize: "20px", color: "var(--slate)", margin: "8px 0" }} id="layerTitle">
                {activeLayer.name}
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text)", lineHeight: 1.6 }} id="layerDesc">
                {activeLayer.desc}
              </p>
              <div
                style={{
                  marginTop: "16px",
                  paddingTop: "14px",
                  borderTop: "1px solid var(--recessed)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--sage)",
                }}
              >
                ● 100% ZERO-POROSITY MEMBRANE INTEGRITY AUDIT
              </div>
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
            <div className="eyebrow">TECHNICAL COMPLIANCE AUDIT</div>
            <h3
              style={{
                fontSize: "22px",
                color: "var(--slate)",
                marginBottom: "6px",
                letterSpacing: "-.02em",
              }}
            >
              Waterproofing Membrane Compliance Matrix
            </h3>
            <p
              style={{
                color: "var(--taupe)",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                marginBottom: "16px",
              }}
            >
              IS 2645 & ASTM CHEMICAL PERFORMANCE SPECIFICATION COMPARISON
            </p>

            <div className="table-responsive-wrap">
              <table className="spec-table">
                <thead>
                  <tr>
                    <th>TECHNICAL PARAMETER</th>
                    <th>2K ELASTOMERIC SLURRY</th>
                    <th>INTEGRAL WATERPROOFING LIQUID</th>
                    <th>BITUMINOUS FELT / TAR</th>
                    <th>TEST PROTOCOL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Permeability Reduction</strong>
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", color: "#244464", fontWeight: 600 }}>
                        100% Water Impervious
                      </span>
                    </td>
                    <td>&gt; 60% Reduction in fresh concrete</td>
                    <td>Subject to joint seam leaks</td>
                    <td>IS 2645 (Clause 8.1)</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Crack-Bridging Ability</strong>
                    </td>
                    <td>Bridges up to 1.2 mm fissures</td>
                    <td>Rigid (Pore sealer only)</td>
                    <td>Fails under thermal shear</td>
                    <td>ASTM C1305</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Tensile Elongation</strong>
                    </td>
                    <td>&gt; 120% Elastic Recovery</td>
                    <td>N/A (Crystalline matrix)</td>
                    <td>&lt; 30% (Becomes brittle in summer)</td>
                    <td>ASTM D412</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Chloride Penetration</strong>
                    </td>
                    <td>&lt; 1,000 Coulombs (Very Low)</td>
                    <td>&lt; 2,000 Coulombs (Low)</td>
                    <td>High around overlap seams</td>
                    <td>ASTM C1202 Rapid Test</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Typical Target Area</strong>
                    </td>
                    <td>Sunken Toilets, Terraces, Retaining Walls</td>
                    <td>Foundations, Plaster Mortar, Slabs</td>
                    <td>Temporary Sheds Only</td>
                    <td>Specification Guidance</td>
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
                You must be logged in to request a verified chemical plant bulk quote and waterproofing
                BOQ audit for your project.
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
                  Connect verified factory rates and chemical lab batch testing baseline directly
                  into your project schedule.
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
                      <option value="Sunken Slab & Wet Areas">Sunken Slab & Wet Areas</option>
                      <option value="Terrace & Parapet Envelope">Terrace & Parapet Envelope</option>
                      <option value="Basement Retaining Wall">Basement Retaining Wall</option>
                      <option value="Structural Concrete Pour">Structural Concrete Pour</option>
                    </select>
                  </div>

                  <div className="boq-field">
                    <label htmlFor="boqQty">ESTIMATED QUANTITY (KITS / LITRES)</label>
                    <input
                      type="text"
                      id="boqQty"
                      name="quantity"
                      placeholder="e.g. ~10 Kits / 2,500 sq ft"
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
                      placeholder="Specify project site, required dispatch timeline, or technical membrane preferences..."
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
                    Verified MTC Guaranteed · Zero Price Tampering · Direct Specialty Plant Logistics
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
                Your waterproofing chemical procurement inquiry for{" "}
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
                  <span className="sla-val">Direct Plant Dispatch</span>
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
