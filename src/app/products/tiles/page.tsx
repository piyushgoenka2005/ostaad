"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { saveUserBOQ } from "@/lib/firebase/firestore";

interface TileMeta {
  title: string;
  badge: string;
  badgeBg: string;
  crumb: string;
  rateLabel: string;
  price: number;
  unit: string;
  metaVerified: string;
  material: string;
  standard: string;
  dim: string;
  absorption: string;
  slip: string;
  breaking: string;
  seal: string;
  pack: string;
  specText: string;
  img: string;
  alt: string;
}

const TILE_DATA: Record<"clay" | "organic", TileMeta> = {
  clay: {
    title: "Kiln-Fired Natural Clay Terracotta Flooring Tiles",
    badge: "TERRACOTTA ACTIVE",
    badgeBg: "var(--terracotta)",
    crumb: "Clay Made Terracotta Tiles",
    rateLabel: "₹88 / Sq Ft (Terracotta)",
    price: 88,
    unit: "/ SQ FT · TAX INCLUSIVE",
    metaVerified: "⚡ 320+ Courtyards & Terraces · Verified Kiln Baseline",
    material: "Natural Refractory Clay (Kiln Fired at 1,050°C)",
    standard: "IS 15622 : 2017 (Group BIIa Pressed Ceramic Tile)",
    dim: '300 × 300 × 16 MM (12" × 12")',
    absorption: "< 6.0% (Natural breathability, zero frost-heaving)",
    slip: "R11 Rating (Micro-frictional natural tooth)",
    breaking: "≥ 1,000 N (High point load endurance)",
    seal: "Unfinished breathable natural terracotta",
    pack: "10 Pieces / Corrugated Box (approx. 9.7 Sq Ft coverage)",
    specText: "Natural Clay Terracotta Tiles · 300 × 300 MM (₹88 / Sq Ft)",
    img: "/images/products/tiles-clay.jpg",
    alt: "Clay Made Terracotta Tiles",
  },
  organic: {
    title: "Organic Mineral Stone Vitrified Flooring Tiles",
    badge: "ORGANIC VITRIFIED",
    badgeBg: "var(--sage)",
    crumb: "Organic Mineral Vitrified Tiles",
    rateLabel: "₹148 / Sq Ft (Organic Vitrified)",
    price: 148,
    unit: "/ SQ FT · TAX INCLUSIVE",
    metaVerified: "⚡ 410+ Living & Bedroom Floors · Zero Porosity Spec",
    material: "Reclaimed Quarry Stone Aggregates (Hydraulic Pressed 4,500T)",
    standard: "IS 15622 : 2017 (Group BIa Fully Vitrified)",
    dim: "600 × 1200 × 9 MM (Satin Full-Body)",
    absorption: "< 0.05% (Impervious to water, wine, and tea stains)",
    slip: "R9 Matte Satin Finish with anti-bacterial nano seal",
    breaking: "≥ 1,300 N (Heavy household load resistance)",
    seal: "Nano-Coated Stain Resistant Satin Seal",
    pack: "2 Pieces / Box (approx. 15.5 Sq Ft coverage)",
    specText: "Organic Mineral Stone Vitrified Flooring Tiles · IS 15622 (₹148 / Sq Ft)",
    img: "/images/products/tiles-organic.jpg",
    alt: "Organic Mineral Vitrified Tiles",
  },
};

const CHART_DATA = {
  absorption: {
    b1: 175,
    b2: 120,
    b3: 55,
    b4: 35,
    v1: "5.5%",
    v2: "3.8%",
    v3: "0.08%",
    v4: "0.04%",
    note: "Terracotta clay natural porosity facilitates breathability and radiant cooling, maintaining an average floor temperature 7–9°C below glazed porcelain.",
  },
  heat: {
    b1: 80,
    b2: 155,
    b3: 195,
    b4: 105,
    v1: "31.2°C",
    v2: "37.8°C",
    v3: "41.5°C",
    v4: "33.4°C",
    note: "Measured under 40°C peak midday ambient solar radiation: natural unglazed terracotta clay reflects ambient heat, remaining significantly cooler to walk on.",
  },
};

export default function TilesProductPage() {
  const { user, profile } = useAuth();

  // Selected tile type
  const [selectedTileType, setSelectedTileType] = useState<"clay" | "organic">("clay");

  // Calculator State
  const [roomLength, setRoomLength] = useState<number>(16);
  const [roomWidth, setRoomWidth] = useState<number>(12);
  const [calcTileType, setCalcTileType] = useState<"clay" | "organic">("clay");
  const [wastageRate, setWastageRate] = useState<number>(0.1);

  // Chart Mode
  const [chartMode, setChartMode] = useState<"absorption" | "heat">("absorption");

  // Pattern Simulator State
  const [simType, setSimType] = useState<"clay" | "organic">("clay");
  const [simPat, setSimPat] = useState<"grid" | "brick">("grid");

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
    projectStage: "Flooring & Tiling",
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

  const handleTileSelect = (type: "clay" | "organic") => {
    setSelectedTileType(type);
    setCalcTileType(type);
    setSimType(type);
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

  // Calculator computations
  const baseArea = roomLength * roomWidth;
  const totalWithWastage = Math.round(baseArea * (1 + wastageRate));
  const rate = calcTileType === "clay" ? 88 : 148;
  const cost = totalWithWastage * rate;
  const boxSqFt = calcTileType === "clay" ? 9.7 : 15.5;
  const boxes = Math.ceil(totalWithWastage / boxSqFt);
  const groutBags = Math.max(1, Math.round(totalWithWastage / 100));

  const { products } = useProducts();

  const dynamicClay = products.find(
    (p) => p.id === "prod_tiles_clay" || (p.category === "Tiles" && p.title.toLowerCase().includes("clay"))
  );
  const dynamicOrganic = products.find(
    (p) =>
      p.id === "prod_tiles_vitrified" ||
      (p.category === "Tiles" &&
        (p.title.toLowerCase().includes("vitrified") || p.title.toLowerCase().includes("organic")))
  );

  const tileData = {
    clay: {
      ...TILE_DATA.clay,
      ...(dynamicClay
        ? {
            title: dynamicClay.title || TILE_DATA.clay.title,
            price: dynamicClay.price || TILE_DATA.clay.price,
            img: dynamicClay.image || TILE_DATA.clay.img,
          }
        : {}),
    },
    organic: {
      ...TILE_DATA.organic,
      ...(dynamicOrganic
        ? {
            title: dynamicOrganic.title || TILE_DATA.organic.title,
            price: dynamicOrganic.price || TILE_DATA.organic.price,
            img: dynamicOrganic.image || TILE_DATA.organic.img,
          }
        : {}),
    },
  };

  const currentProduct = tileData[selectedTileType];
  const chartActive = CHART_DATA[chartMode];

  // Modal Submit
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        access_key: "6d71ee60-2f5a-436e-b445-ec657bf48f2a",
        subject: `Bulk Tiles Quote Request - ${currentProduct.specText} - Ostaad`,
        from_name: "Ostaad Tiles Procurement Desk",
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
          quantity: formData.quantity || `${boxes} Boxes (${totalWithWastage} Sq Ft)`,
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
            <Link href="/products?cat=tiles">Products</Link> <span className="sep">›</span>
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
                    e.currentTarget.src = "/images/products/tiles-clay.jpg";
                  }}
                />
                <span className="pack-badge-cert">IS 15622 CERTIFIED</span>
              </div>

              {/* Thumbnail selector to toggle between Clay and Organic */}
              <div className="pack-thumbnails">
                <button
                  type="button"
                  className={`thumb-btn ${selectedTileType === "clay" ? "active" : ""}`}
                  id="thumbClay"
                  onClick={() => handleTileSelect("clay")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tileData.clay.img}
                    alt="Clay Made Terracotta"
                    className="thumb-img"
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.src = "/images/products/tiles-clay.jpg"; }}
                  />
                  <div>
                    <span className="thumb-title">Clay Terracotta</span>
                    <span className="thumb-sub">₹{tileData.clay.price}/sqft · 300x300</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`thumb-btn ${selectedTileType === "organic" ? "active" : ""}`}
                  id="thumbOrganic"
                  onClick={() => handleTileSelect("organic")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tileData.organic.img}
                    alt="Organic Mineral"
                    className="thumb-img"
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.src = "/images/products/tiles-organic.jpg"; }}
                  />
                  <div>
                    <span className="thumb-title">Organic Mineral</span>
                    <span className="thumb-sub">₹{tileData.organic.price}/sqft · 600x1200</span>
                  </div>
                </button>
              </div>

              <div className="need-help-box">
                <h4>Need Laying & Pattern Guidance?</h4>
                <p>
                  Unsure between stack grid vs herringbone or joint grout spacing? Our tile masonry
                  specialists will audit your flooring layout.
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
                  <div className="meta-verified-tag" id="verifiedMetaTag">
                    {currentProduct.metaVerified}
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
                    <span id="rateLabel">{currentProduct.rateLabel}</span> · Direct Kiln Benchmark.
                  </div>
                </div>
                <div className="offer-item">
                  <span className="chk">✓</span>
                  <div>
                    <strong>Zero-Warpage Guarantee:</strong> Kiln-fired with precision refractory clay to
                    ensure planar accuracy within ±0.2mm tolerance.
                  </div>
                </div>
                <div className="offer-item">
                  <span className="chk">✓</span>
                  <div>
                    <strong>Strapped Corrugated Cartons:</strong> Heavy-duty export packaging with corner
                    protectors preventing transit edge-chipping.
                  </div>
                </div>
              </div>

              {/* Trust Badges Row */}
              <div className="trust-badges-row">
                <div className="trust-pill">
                  <span className="ico">🚚</span>
                  <span className="t-label">Direct Kiln Dispatch</span>
                  <span className="t-sub">Site dispatch in 24–48 hrs</span>
                </div>
                <div className="trust-pill">
                  <span className="ico">❄️</span>
                  <span className="t-label">Thermal Breathability</span>
                  <span className="t-sub">7–9°C cooler in summer</span>
                </div>
                <div className="trust-pill">
                  <span className="ico">🛡️</span>
                  <span className="t-label">BIS Certified Quality</span>
                  <span className="t-sub">IS 15622 Group BIIa/BIa</span>
                </div>
              </div>

              {/* Technical Specifications Table */}
              <div className="specs-sheet-card">
                <h3>Technical Specifications</h3>
                <table className="specs-sheet-table">
                  <tbody>
                    <tr>
                      <th>Material Composition</th>
                      <td id="specMaterial">{currentProduct.material}</td>
                    </tr>
                    <tr>
                      <th>Standard Compliance</th>
                      <td id="specStandard">{currentProduct.standard}</td>
                    </tr>
                    <tr>
                      <th>Nominal Dimensions</th>
                      <td id="specDim">{currentProduct.dim}</td>
                    </tr>
                    <tr>
                      <th>Water Absorption</th>
                      <td id="specAbsorption">{currentProduct.absorption}</td>
                    </tr>
                    <tr>
                      <th>Wet Slip Resistance</th>
                      <td id="specSlip">{currentProduct.slip}</td>
                    </tr>
                    <tr>
                      <th>Breaking Strength</th>
                      <td id="specBreaking">{currentProduct.breaking}</td>
                    </tr>
                    <tr>
                      <th>Surface Seal</th>
                      <td id="specSeal">{currentProduct.seal}</td>
                    </tr>
                    <tr>
                      <th>Standard Packing</th>
                      <td id="specPack">{currentProduct.pack}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT COLUMN: Procurement Box */}
            <div className="procure-col">
              <div className="procure-card">
                <div className="procure-shipper">
                  DISPATCHED FROM CERTIFIED KILN MILLS
                  <strong>Direct Regional Freight · Insured Transit</strong>
                </div>

                <div className="procure-price-wrap">
                  <span className="lbl">VERIFIED UNIT RATE</span>
                  <div className="amt" id="procurePrice">
                    ₹{currentProduct.price}
                  </div>
                  <span className="sub" id="procureUnit">
                    {currentProduct.unit}
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
                    href="#tilesCalc"
                    className="btn btn-secondary"
                    style={{ justifyContent: "center" }}
                  >
                    Calculate Tile Quota ↓
                  </a>
                </div>

                <div className="procure-how-it-works">
                  <h4>How does Ostaad Bulk Buying work?</h4>
                  <div className="procure-step">
                    <span className="step-dot">1</span>
                    <div>
                      <strong>Input Area:</strong> Calculate net square footage with 10% cutting margin.
                    </div>
                  </div>
                  <div className="procure-step">
                    <span className="step-dot">2</span>
                    <div>
                      <strong>Transparent Rate:</strong> Receive verified direct-mill quote with zero
                      middleman markups.
                    </div>
                  </div>
                  <div className="procure-step">
                    <span className="step-dot">3</span>
                    <div>
                      <strong>Site Delivery:</strong> Dispatched in strapped crates with break-free guarantee.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           2. TILES CALCULATOR SECTION
           ============================================================ */}
      <section
        className="section"
        id="tilesCalc"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--recessed)" }}
      >
        <div className="container">
          <div className="eyebrow">TILES CALCULATOR</div>
          <h2
            style={{
              fontSize: "clamp(28px,3.8vw,42px)",
              fontWeight: 500,
              color: "var(--slate)",
              letterSpacing: "-.035em",
              marginBottom: "10px",
            }}
          >
            Tiles Calculator — Room Coverage & Wastage Estimator
          </h2>
          <p style={{ color: "var(--text)", maxWidth: "680px", lineHeight: 1.6 }}>
            Specify your room dimensions to compute net tile square footage, required carton quantities,
            safe cutting allowances, and epoxy joint grout bags.
          </p>

          <div className="sim-grid">
            <div className="card" style={{ padding: "26px" }}>
              <h3 style={{ fontSize: "17px", color: "var(--slate)", marginBottom: "18px" }}>
                Floor Room Parameters
              </h3>

              <div className="calc-row-2">
                <div className="calc-field">
                  <label htmlFor="roomLength">ROOM LENGTH (FEET)</label>
                  <input
                    type="number"
                    id="roomLength"
                    className="calc-input"
                    value={roomLength}
                    min={4}
                    max={80}
                    onChange={(e) => setRoomLength(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="calc-field">
                  <label htmlFor="roomWidth">ROOM WIDTH (FEET)</label>
                  <input
                    type="number"
                    id="roomWidth"
                    className="calc-input"
                    value={roomWidth}
                    min={4}
                    max={80}
                    onChange={(e) => setRoomWidth(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="calc-field">
                <label htmlFor="tileSpecSelect">TILE SPECIFICATION SELECTION</label>
                <select
                  id="tileSpecSelect"
                  className="calc-select"
                  value={calcTileType}
                  onChange={(e) => setCalcTileType(e.target.value as any)}
                >
                  <option value="clay">Clay Terracotta (300×300mm · ₹88 / Sq Ft)</option>
                  <option value="organic">Organic Mineral Vitrified (600×1200mm · ₹148 / Sq Ft)</option>
                </select>
              </div>

              <div className="calc-field" style={{ marginBottom: 0 }}>
                <label htmlFor="wastageSelect">CORNER & SKIRTING WASTAGE</label>
                <select
                  id="wastageSelect"
                  className="calc-select"
                  value={wastageRate}
                  onChange={(e) => setWastageRate(parseFloat(e.target.value) || 0.1)}
                >
                  <option value="0.10">10% Standard Rectangular Wastage</option>
                  <option value="0.15">15% Diagonal / Complex Corner Wastage</option>
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
                id="calcTotalArea"
                suppressHydrationWarning
              >
                {totalWithWastage.toLocaleString("en-IN")} Sq Ft
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,.75)",
                  marginBottom: "20px",
                }}
                id="calcAreaBreakdown"
                suppressHydrationWarning
              >
                Base area: {baseArea.toLocaleString("en-IN")} sq ft + {Math.round(wastageRate * 100)}% wastage
                ({Math.round(baseArea * wastageRate)} sq ft) for perimeter skirting and corner cuts.
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
                    MATERIAL COST
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
                    BOXES REQUIRED
                  </div>
                  <div className="val" style={{ color: "#fff" }} id="calcBoxes">
                    {boxes} Boxes
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
                    EPOXY GROUT
                  </div>
                  <div className="val" style={{ color: "#fff" }} id="calcGrout">
                    {groutBags} Bags ({groutBags * 5} KG)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           3. CHARTS SECTION — THERMAL PERFORMANCE & WATER ABSORPTION
           ============================================================ */}
      <section className="section" id="chartsSection" style={{ borderBottom: "1px solid var(--recessed)" }}>
        <div className="container">
          <div className="eyebrow">SURFACE BEHAVIOR BENCHMARK</div>
          <h2
            style={{
              fontSize: "clamp(28px,3.8vw,42px)",
              fontWeight: 500,
              color: "var(--slate)",
              letterSpacing: "-.035em",
              marginBottom: "10px",
            }}
          >
            Water Absorption & Thermal Retention Simulator
          </h2>
          <p style={{ color: "var(--text)", maxWidth: "680px", lineHeight: 1.6, marginBottom: "28px" }}>
            Compare water porosity percentage and ambient underfoot heat buildup across ceramic,
            terracotta clay, and organic vitrified stone.
          </p>

          <div className="curve-chart-box">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <strong style={{ color: "var(--slate)", fontSize: "15px" }}>
                  Water Absorption Rate (% Porosity by Mass)
                </strong>
                <p style={{ fontSize: "12.5px", color: "var(--taupe)", marginTop: "2px" }}>
                  Tested per IS 13630 Part 2 Vacuum Water Boil Method
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className={`btn btn-sm ${chartMode === "absorption" ? "btn-primary" : "btn-secondary"} chart-toggle`}
                  onClick={() => setChartMode("absorption")}
                >
                  Water Porosity
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${chartMode === "heat" ? "btn-primary" : "btn-secondary"} chart-toggle`}
                  onClick={() => setChartMode("heat")}
                >
                  Summer Underfoot Temp (°C)
                </button>
              </div>
            </div>

            <div className="chart-bars">
              <div className="bar-group">
                <div className="bar" style={{ height: `${chartActive.b1}px` }}>
                  <span className="bar-val">{chartActive.v1}</span>
                </div>
                <span className="bar-lbl">Clay Terracotta</span>
              </div>
              <div className="bar-group">
                <div className="bar secondary" style={{ height: `${chartActive.b2}px` }}>
                  <span className="bar-val">{chartActive.v2}</span>
                </div>
                <span className="bar-lbl">Ceramic Floor</span>
              </div>
              <div className="bar-group">
                <div className="bar secondary" style={{ height: `${chartActive.b3}px` }}>
                  <span className="bar-val">{chartActive.v3}</span>
                </div>
                <span className="bar-lbl">Standard Vitrified</span>
              </div>
              <div className="bar-group">
                <div className="bar" style={{ height: `${chartActive.b4}px`, background: "var(--sage)" }}>
                  <span className="bar-val">{chartActive.v4}</span>
                </div>
                <span className="bar-lbl">Organic Vitrified</span>
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
                {chartActive.note}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--taupe)" }}>
                TEST BENCHMARK: IS 15622 COMPLIANT
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           4. INTERACTIVE PATTERN SIMULATOR
           ============================================================ */}
      <section
        className="section"
        id="patternSection"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--recessed)" }}
      >
        <div className="container">
          <div className="eyebrow">INTERACTIVE SURFACE SIMULATOR</div>
          <h2
            style={{
              fontSize: "clamp(28px,3.8vw,42px)",
              fontWeight: 500,
              color: "var(--slate)",
              letterSpacing: "-.035em",
              marginBottom: "10px",
            }}
          >
            Tile Material & Laying Pattern Visualizer
          </h2>
          <p style={{ color: "var(--text)", maxWidth: "680px", lineHeight: 1.6, marginBottom: "24px" }}>
            Test how natural clay terracotta and organic mineral stone look under standard stack grid
            vs staggered brick-bond patterns.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                className={`btn btn-sm ${simType === "clay" ? "btn-primary" : "btn-secondary"} type-toggle`}
                onClick={() => setSimType("clay")}
              >
                Clay Terracotta
              </button>
              <button
                type="button"
                className={`btn btn-sm ${simType === "organic" ? "btn-primary" : "btn-secondary"} type-toggle`}
                onClick={() => setSimType("organic")}
              >
                Organic Mineral Stone
              </button>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                className={`btn btn-sm ${simPat === "grid" ? "btn-primary" : "btn-secondary"} pat-toggle`}
                onClick={() => setSimPat("grid")}
              >
                Stack Grid
              </button>
              <button
                type="button"
                className={`btn btn-sm ${simPat === "brick" ? "btn-primary" : "btn-secondary"} pat-toggle`}
                onClick={() => setSimPat("brick")}
              >
                Staggered Brick-Bond
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: "16px" }}>
            <div className="pattern-canvas" id="patternCanvas">
              <div className={`tile-grid-view pattern-${simPat} type-${simType}`} id="tileGrid">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="tile-cell" />
                ))}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "14px",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--taupe)",
              }}
            >
              <span id="patternDesc">
                {simType === "clay"
                  ? "NATURAL CLAY TERRACOTTA (300 × 300 MM)"
                  : "ORGANIC MINERAL STONE (600 × 1200 MM)"}{" "}
                · {simPat === "grid" ? "STACK GRID ALIGNMENT" : "STAGGERED BRICK-BOND"}
              </span>
              <span id="ratePreview">
                {simType === "clay" ? "₹88 / SQ FT" : "₹148 / SQ FT"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           5. BENCHMARK MATRIX SECTION
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
              Bureau of Indian Standards (BIS) Ceramic Matrix
            </h3>
            <p
              style={{
                color: "var(--taupe)",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                marginBottom: "16px",
              }}
            >
              IS 15622 CERAMIC & VITRIFIED TILE PHYSICAL AUDIT CRITERIA
            </p>

            <div className="table-responsive-wrap">
              <table className="spec-table">
                <thead>
                  <tr>
                    <th>PROPERTY</th>
                    <th>GROUP BIIA (TERRACOTTA)</th>
                    <th>GROUP BIA (FULL VITRIFIED)</th>
                    <th>GROUP BIII (WALL CERAMIC)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Water Absorption</td>
                    <td>3.0% – 6.0%</td>
                    <td>&le; 0.08%</td>
                    <td>&gt; 10.0%</td>
                  </tr>
                  <tr>
                    <td>Modulus of Rupture (MOR)</td>
                    <td>&ge; 22 N/mm²</td>
                    <td>&ge; 35 N/mm²</td>
                    <td>&ge; 15 N/mm²</td>
                  </tr>
                  <tr>
                    <td>Breaking Strength</td>
                    <td>&ge; 1,000 N</td>
                    <td>&ge; 1,300 N</td>
                    <td>&ge; 600 N</td>
                  </tr>
                  <tr>
                    <td>Surface Hardness (Mohs Scale)</td>
                    <td>5 – 6</td>
                    <td>7 – 8</td>
                    <td>3 – 4</td>
                  </tr>
                  <tr>
                    <td>Thermal Expansion Coefficient</td>
                    <td>&le; 7.0 × 10⁻⁶ / °C</td>
                    <td>&le; 6.0 × 10⁻⁶ / °C</td>
                    <td>&le; 9.0 × 10⁻⁶ / °C</td>
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
                You must be logged in to request a verified kiln-direct bulk quote and flooring schedule
                audit for your project.
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
                  Connect verified factory rates and ceramic laboratory batch testing baseline
                  directly into your project schedule.
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
                      <option value="Flooring & Tiling">Flooring & Tiling</option>
                      <option value="Plastering & Floor Screed">Plastering & Floor Screed</option>
                      <option value="Planning & Architectural Drawings">
                        Planning & Architectural Drawings
                      </option>
                      <option value="Interior Fitouts & Woodwork">Interior Fitouts & Woodwork</option>
                    </select>
                  </div>

                  <div className="boq-field">
                    <label htmlFor="boqQty">ESTIMATED QUANTITY (SQ FT / BOXES)</label>
                    <input
                      type="text"
                      id="boqQty"
                      name="quantity"
                      placeholder="e.g. ~1,200 Sq Ft / 80 Boxes"
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
                      placeholder="Specify project site, laying pattern, border preferences, or target delivery timeline..."
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
                    Verified MTC Guaranteed · Zero Price Tampering · Direct Ceramic Kiln Logistics
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
                Your tiles procurement inquiry for{" "}
                <strong id="boqSuccessSpec">{currentProduct.title}</strong> has been logged. An
                audited quote and batch test reports will be sent to{" "}
                <strong id="boqSuccessEmail">{formData.email || user?.email}</strong>.
              </p>

              <div className="boq-sla-box">
                <div className="boq-sla-item">
                  <span className="sla-label">ESTIMATED RESPONSE TIME</span>
                  <span className="sla-val">&lt; 3 Business Hours</span>
                </div>
                <div className="boq-sla-item">
                  <span className="sla-label">LOGISTICS AUDIT</span>
                  <span className="sla-val">Direct Kiln Freight</span>
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
