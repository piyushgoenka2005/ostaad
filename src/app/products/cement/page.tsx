"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { saveUserBOQ } from "@/lib/firebase/firestore";

interface GradeMeta {
  note: string;
  title: string;
  spec: string;
  price: number;
  rateLabel: string;
  str28: string;
  str3: string;
  img: string;
  alt: string;
}

const GRADE_DATA: Record<string, GradeMeta> = {
  "53": {
    note: "OPC Grade 53 achieves rapid 27 MPa strength at 3 days, reaching 54.5 MPa for high-load multi-story framing.",
    title: "JK Super Ordinary Portland Cement (OPC 53)",
    spec: "JK Super OPC 53 Grade Cement · IS 12269 (₹385 / 50 KG Bag)",
    price: 385,
    rateLabel: "₹385 / 50 KG Bag (Grade 53)",
    str28: "≥ 53.0 MPa (Achieved: 54.5 MPa)",
    str3: "≥ 27.0 MPa (Achieved: 28.2 MPa)",
    img: "/images/products/cement-jk53.jpg",
    alt: "JK Super OPC 53 Grade Cement",
  },
  "43": {
    note: "OPC Grade 43 achieves 23 MPa at 3 days, reaching 44.8 MPa with lower hydration heat for masonry & plaster.",
    title: "JK Super Ordinary Portland Cement (OPC 43)",
    spec: "JK Super OPC 43 Grade Cement · IS 8112 (₹360 / 50 KG Bag)",
    price: 360,
    rateLabel: "₹360 / 50 KG Bag (Grade 43)",
    str28: "≥ 43.0 MPa (Achieved: 45.2 MPa)",
    str3: "≥ 23.0 MPa (Achieved: 24.1 MPa)",
    img: "/images/products/cement-jk43.png",
    alt: "JK Super OPC 43 Grade Cement",
  },
  ppc: {
    note: "PPC Pozzolana cures steadily from 16.5 MPa to 38.2 MPa, developing dense hydration gels highly resistant to sulfates.",
    title: "Portland Pozzolana Cement (PPC)",
    spec: "PPC Pozzolana Cement · IS 1489 (₹345 / 50 KG Bag)",
    price: 345,
    rateLabel: "₹345 / 50 KG Bag (PPC)",
    str28: "≥ 33.0 MPa (Achieved: 38.2 MPa)",
    str3: "≥ 16.0 MPa (Achieved: 16.5 MPa)",
    img: "/images/products/cement-jk53.jpg",
    alt: "Portland Pozzolana Cement (PPC)",
  },
};

export default function CementProductPage() {
  const { user, profile } = useAuth();

  // Selected grade for product showcase (53 or 43)
  const [selectedProductGrade, setSelectedProductGrade] = useState<"53" | "43">("53");
  // Active curve for Curing Simulator and Benchmark Matrix (53, 43, or ppc)
  const [activeKineticsGrade, setActiveKineticsGrade] = useState<"53" | "43" | "ppc">("53");

  // Copy link feedback state
  const [copied, setCopied] = useState(false);

  // Concrete Mix Calculator State
  const [calcElement, setCalcElement] = useState<"slab" | "column" | "beam" | "plaster">("slab");
  const [calcArea, setCalcArea] = useState<number>(1000);
  const [calcGrade, setCalcGrade] = useState<"53" | "43">("53");

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

  // Pre-fill user details on auth change
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

  const handleGradeSelect = (grade: "53" | "43") => {
    setSelectedProductGrade(grade);
    setActiveKineticsGrade(grade);
    setCalcGrade(grade);
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
  const rate = calcGrade === "53" ? 385 : 360;
  let bags = 0;
  let sand = 0;
  let aggr = 0;
  let desc = "";

  if (calcElement === "slab") {
    const volCft = calcArea * 0.416; // 5" slab volume
    bags = Math.round(volCft * 0.32); // M20 nominal
    sand = Math.round(volCft * 0.45);
    aggr = Math.round(volCft * 0.9);
    desc = 'Mix Design: M20 Nominal (1 : 1.5 : 3) with W/C ratio 0.50 for 5" Slab.';
  } else if (calcElement === "column") {
    bags = Math.round(calcArea * 0.18);
    sand = Math.round(calcArea * 0.22);
    aggr = Math.round(calcArea * 0.44);
    desc = "Mix Design: M25 High-Strength (1 : 1 : 2) with W/C ratio 0.45.";
  } else if (calcElement === "beam") {
    bags = Math.round(calcArea * 0.15);
    sand = Math.round(calcArea * 0.25);
    aggr = Math.round(calcArea * 0.5);
    desc = "Mix Design: M20 Reinforced Beam (1 : 1.5 : 3).";
  } else {
    bags = Math.round(calcArea * 0.045);
    sand = Math.round(calcArea * 0.18);
    aggr = 0;
    desc = "Mortar Mix: 1 : 4 (Cement : Fine River Sand) for 12mm Smooth Plaster.";
  }
  const cost = bags * rate;

  const { products } = useProducts();

  const dynamic53 = products.find(
    (p) =>
      p.id === "prod_cement_53" ||
      (p.category === "Cement" && (p.grade?.includes("53") || p.title?.includes("53")))
  );
  const dynamic43 = products.find(
    (p) =>
      p.id === "prod_cement_43" ||
      (p.category === "Cement" && (p.grade?.includes("43") || p.title?.includes("43")))
  );

  const gradeData: Record<string, GradeMeta> = {
    "53": {
      ...GRADE_DATA["53"],
      ...(dynamic53
        ? {
            title: dynamic53.title || GRADE_DATA["53"].title,
            price: dynamic53.price || GRADE_DATA["53"].price,
            img: dynamic53.image || GRADE_DATA["53"].img,
            rateLabel: `₹${dynamic53.price || 385} / 50 KG Bag (Grade 53)`,
          }
        : {}),
    },
    "43": {
      ...GRADE_DATA["43"],
      ...(dynamic43
        ? {
            title: dynamic43.title || GRADE_DATA["43"].title,
            price: dynamic43.price || GRADE_DATA["43"].price,
            img: dynamic43.image || GRADE_DATA["43"].img,
            rateLabel: `₹${dynamic43.price || 360} / 50 KG Bag (Grade 43)`,
          }
        : {}),
    },
    ppc: {
      ...GRADE_DATA.ppc,
    },
  };

  const currentProduct = gradeData[selectedProductGrade];
  const kineticsInfo = gradeData[activeKineticsGrade];

  // BOQ submission handler
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        access_key: "6d71ee60-2f5a-436e-b445-ec657bf48f2a",
        subject: `Bulk Cement Quote Request - ${currentProduct.title} - Ostaad`,
        from_name: "Ostaad Cement Procurement Desk",
        specification: currentProduct.spec,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        pincode: formData.pincode,
        project_stage: formData.projectStage,
        quantity: formData.quantity || `${bags} Bags (${currentProduct.title})`,
        notes: formData.notes,
      };

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        // Save quote request to Firestore
        saveUserBOQ({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          pincode: formData.pincode,
          materialSpec: currentProduct.spec,
          quantity: formData.quantity || `${bags} Bags (${currentProduct.title})`,
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
            <Link href="/products?cat=cement">Products</Link> <span className="sep">›</span>
            <span className="current" id="crumbTitle">
              {selectedProductGrade === "53" ? "OPC 53 Grade Cement" : "OPC 43 Grade Cement"}
            </span>
          </div>

          <div className="product-showcase-grid">
            {/* LEFT COLUMN: Product Pack & Consultation */}
            <div className="gallery-col">
              <div className="main-pack-view">
                <span className="pack-badge-grade" id="badgeGrade">
                  {selectedProductGrade === "53" ? "OPC 53 ACTIVE" : "OPC 43 ACTIVE"}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  id="mainPackImg"
                  src={currentProduct.img}
                  alt={currentProduct.alt}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = "/images/products/cement-jk53.jpg";
                  }}
                />
                <span className="pack-badge-cert">
                  {selectedProductGrade === "53" ? "IS 12269 CERTIFIED" : "IS 8112 CERTIFIED"}
                </span>
              </div>

              {/* Thumbnail selector to toggle between 53 and 43 */}
              <div className="pack-thumbnails">
                <button
                  type="button"
                  className={`thumb-btn ${selectedProductGrade === "53" ? "active" : ""}`}
                  id="thumb53"
                  onClick={() => handleGradeSelect("53")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={gradeData["53"].img}
                    alt="Grade 53"
                    className="thumb-img"
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.src = "/images/products/cement-jk53.jpg"; }}
                  />
                  <div>
                    <span className="thumb-title">OPC 53 Grade</span>
                    <span className="thumb-sub">₹{gradeData["53"].price} · RCC Slab/Beam</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`thumb-btn ${selectedProductGrade === "43" ? "active" : ""}`}
                  id="thumb43"
                  onClick={() => handleGradeSelect("43")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={gradeData["43"].img}
                    alt="Grade 43"
                    className="thumb-img"
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.src = "/images/products/cement-jk43.png"; }}
                  />
                  <div>
                    <span className="thumb-title">OPC 43 Grade</span>
                    <span className="thumb-sub">₹{gradeData["43"].price} · Masonry/Plaster</span>
                  </div>
                </button>
              </div>

              {/* Need Help card */}
              <div className="need-help-box">
                <h4>Need Technical Guidance?</h4>
                <p>
                  Unsure whether to specify Grade 53 or 43 for your foundation or slab? Our civil
                  engineers will audit your structural drawings.
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
                  <div className="meta-verified-tag">⚡ 480+ Bari Built · Verified Mill Baseline</div>
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
                    <strong>Batch MTC Guaranteed:</strong> Verified Mill Test Certificate dispatched with
                    every load, confirming 3d & 28d strength tests.
                  </div>
                </div>
                <div className="offer-item">
                  <span className="chk">✓</span>
                  <div>
                    <strong>Factory Moisture-Proof Bags:</strong> Sealed multi-ply HDPE valve bags
                    preventing moisture intrusion and premature clinker hydration.
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
                  <span className="ico">⏱️</span>
                  <span className="t-label">Fresh Clinker Guarantee</span>
                  <span className="t-sub">&lt; 15 days batch age</span>
                </div>
                <div className="trust-pill">
                  <span className="ico">🛡️</span>
                  <span className="t-label">BIS Certified Quality</span>
                  <span className="t-sub">IS 12269 & IS 8112</span>
                </div>
              </div>

              {/* Technical Specifications Table */}
              <div className="specs-sheet-card">
                <h3>Technical Specifications</h3>
                <table className="specs-sheet-table">
                  <tbody>
                    <tr>
                      <th>Product Type</th>
                      <td id="specType">Ordinary Portland Cement (OPC)</td>
                    </tr>
                    <tr>
                      <th>Standard Compliance</th>
                      <td id="specStandard">
                        {selectedProductGrade === "53"
                          ? "IS 12269 : 2013 (Grade 53)"
                          : "IS 8112 : 2013 (Grade 43)"}
                      </td>
                    </tr>
                    <tr>
                      <th>Compressive Strength @ 28 Days</th>
                      <td id="specStr28">{currentProduct.str28}</td>
                    </tr>
                    <tr>
                      <th>Compressive Strength @ 3 Days</th>
                      <td id="specStr3">{currentProduct.str3}</td>
                    </tr>
                    <tr>
                      <th>Initial Setting Time</th>
                      <td>165 mins (BIS Requirement: Min 30 mins)</td>
                    </tr>
                    <tr>
                      <th>Final Setting Time</th>
                      <td>245 mins (BIS Requirement: Max 600 mins)</td>
                    </tr>
                    <tr>
                      <th>Soundness (Le Chatelier)</th>
                      <td>1.5 mm (BIS Limit: Max 10 mm)</td>
                    </tr>
                    <tr>
                      <th>Fineness (Blaine air)</th>
                      <td>285 m²/kg (BIS Requirement: Min 225 m²/kg)</td>
                    </tr>
                    <tr>
                      <th>Packaging Format</th>
                      <td>50 KG Net Multi-Ply Poly-Lined Valve Bag</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT COLUMN: Procurement & How it works card */}
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
                  <div className="sub">PER 50 KG BAG · TAX INCLUSIVE</div>
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
                  href="#cementCalc"
                  className="btn btn-secondary"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Calculate Bag Quota <span className="arrow">↓</span>
                </a>

                {/* How Request Quote for Bulk Works */}
                <div className="procure-how-it-works">
                  <h4>How does Ostaad Bulk Buying work?</h4>
                  <div className="procure-step">
                    <span className="step-dot">1</span>
                    <div>
                      <strong>Calculate volume below:</strong> Input your roof slab, column, or
                      plaster dimensions in our Cement Calculator.
                    </div>
                  </div>
                  <div className="procure-step">
                    <span className="step-dot">2</span>
                    <div>
                      <strong>Receive mill-direct quote:</strong> Transparent pricing with zero regional
                      dealer hoarding inflation.
                    </div>
                  </div>
                  <div className="procure-step">
                    <span className="step-dot">3</span>
                    <div>
                      <strong>Site delivery with MTC:</strong> Factory-fresh bags unloaded at your site
                      with certified batch lab reports.
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    color: "var(--sage)",
                    textAlign: "center",
                    paddingTop: "4px",
                  }}
                >
                  ● 100% GENUINE PORTLAND CLINKER · NO ADULTERATION
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           2. CEMENT CALCULATOR SECTION
           ============================================================ */}
      <section className="section" id="cementCalc">
        <div className="container">
          <div className="eyebrow">CEMENT CALCULATOR</div>
          <h2
            style={{
              fontSize: "32px",
              color: "var(--slate)",
              letterSpacing: "-.03em",
              marginBottom: "10px",
            }}
          >
            Cement Calculator — Concrete Mix & Bag Estimation
          </h2>
          <p style={{ color: "var(--text)", maxWidth: "640px", marginBottom: "30px" }}>
            Input the casting area or structural element dimensions to compute the exact ratio of
            Cement bags, Coarse Sand, Aggregate, and water needed.
          </p>

          <div className="sim-grid">
            <div className="card" style={{ padding: "26px" }}>
              <div className="calc-field">
                <label htmlFor="elemSelect">STRUCTURAL ELEMENT</label>
                <select
                  id="elemSelect"
                  className="calc-select"
                  value={calcElement}
                  onChange={(e) => setCalcElement(e.target.value as any)}
                >
                  <option value="slab">RCC Roof Slab (5 Inch Thick)</option>
                  <option value="column">Columns & Heavy Pillars (M25 Grade)</option>
                  <option value="beam">Plinth & Lintel Beams (M20 Grade)</option>
                  <option value="plaster">Internal Wall Plaster (12mm Thick)</option>
                </select>
              </div>

              <div className="calc-field">
                <label id="areaLabel" htmlFor="dimInput">
                  {calcElement === "slab"
                    ? "SLAB SURFACE AREA (SQ FT)"
                    : calcElement === "plaster"
                    ? "PLASTER SURFACE AREA (SQ FT)"
                    : "STRUCTURAL VOLUME / RUNNING LENGTH (FT / CFT)"}
                </label>
                <input
                  type="number"
                  id="dimInput"
                  className="calc-input"
                  value={calcArea}
                  min={50}
                  max={10000}
                  onChange={(e) => setCalcArea(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="calc-field">
                <label htmlFor="gradeSelect">CEMENT GRADE PREFERENCE</label>
                <select
                  id="gradeSelect"
                  className="calc-select"
                  value={calcGrade}
                  onChange={(e) => setCalcGrade(e.target.value as any)}
                >
                  <option value="53">OPC 53 (₹385/bag) — Recommended for Slabs</option>
                  <option value="43">OPC 43 (₹360/bag) — Economical for Masonry</option>
                </select>
              </div>
            </div>

            <div className="card" style={{ background: "var(--slate)", color: "#fff", padding: "26px" }}>
              <div className="eyebrow" style={{ color: "rgba(255,255,255,.6)" }}>
                CALCULATED STRUCTURAL REQUIREMENT
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 600,
                  fontFamily: "var(--font-mono)",
                  margin: "10px 0",
                }}
                id="resBags"
                suppressHydrationWarning
              >
                {bags.toLocaleString("en-IN")} Bags
              </div>
              <p
                style={{
                  fontSize: "13.5px",
                  color: "rgba(255,255,255,.75)",
                  marginBottom: "20px",
                }}
                id="resDesc"
                suppressHydrationWarning
              >
                {desc}
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
                    CEMENT COST
                  </div>
                  <div className="val" style={{ color: "#fff" }} id="resCost" suppressHydrationWarning>
                    ₹{cost.toLocaleString("en-IN")}
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
                    SAND REQD
                  </div>
                  <div className="val" style={{ color: "#fff" }} id="resSand">
                    {sand} cft
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
                    AGGREGATE
                  </div>
                  <div className="val" style={{ color: "#fff" }} id="resAggr">
                    {aggr > 0 ? `${aggr} cft` : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           3. CHARTS SECTION — COMPRESSIVE STRENGTH DEVELOPMENT
           ============================================================ */}
      <section
        className="section"
        id="chartsSection"
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--recessed)",
          borderBottom: "1px solid var(--recessed)",
        }}
      >
        <div className="container">
          <div className="eyebrow">CURING KINETICS SIMULATOR</div>
          <h2
            style={{
              fontSize: "32px",
              color: "var(--slate)",
              letterSpacing: "-.03em",
              marginBottom: "10px",
            }}
          >
            Compressive Strength Development Over Time
          </h2>
          <p style={{ color: "var(--text)", maxWidth: "620px", marginBottom: "30px" }}>
            Toggle between Grade 53, Grade 43, and PPC to simulate how hydraulic compressive strength
            develops over the standard 28-day water curing cycle.
          </p>

          <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
            <button
              type="button"
              className={`btn btn-sm ${
                activeKineticsGrade === "53" ? "btn-primary" : "btn-secondary"
              } grade-toggle`}
              data-grade="53"
              onClick={() => setActiveKineticsGrade("53")}
            >
              OPC Grade 53
            </button>
            <button
              type="button"
              className={`btn btn-sm ${
                activeKineticsGrade === "43" ? "btn-primary" : "btn-secondary"
              } grade-toggle`}
              data-grade="43"
              onClick={() => setActiveKineticsGrade("43")}
            >
              OPC Grade 43
            </button>
            <button
              type="button"
              className={`btn btn-sm ${
                activeKineticsGrade === "ppc" ? "btn-primary" : "btn-secondary"
              } grade-toggle`}
              data-grade="ppc"
              onClick={() => setActiveKineticsGrade("ppc")}
            >
              PPC (Pozzolana)
            </button>
          </div>

          <div className="curve-chart-box" id="curveChartBox" data-active={activeKineticsGrade}>
            {/* Interactive Multi-Series Legend */}
            <div className="chart-legend-row">
              <div
                className={`chart-legend-item legend-53 ${
                  activeKineticsGrade === "53" ? "active" : ""
                }`}
                data-grade="53"
                title="Click to highlight Grade 53 curve"
                onClick={() => setActiveKineticsGrade("53")}
              >
                <span className="legend-dot dot-53"></span>
                <span>OPC Grade 53 (IS 12269) · High Early Strength</span>
              </div>
              <div
                className={`chart-legend-item legend-43 ${
                  activeKineticsGrade === "43" ? "active" : ""
                }`}
                data-grade="43"
                title="Click to highlight Grade 43 curve"
                onClick={() => setActiveKineticsGrade("43")}
              >
                <span className="legend-dot dot-43"></span>
                <span>OPC Grade 43 (IS 8112) · General Structural</span>
              </div>
              <div
                className={`chart-legend-item legend-ppc ${
                  activeKineticsGrade === "ppc" ? "active" : ""
                }`}
                data-grade="ppc"
                title="Click to highlight PPC curve"
                onClick={() => setActiveKineticsGrade("ppc")}
              >
                <span className="legend-dot dot-ppc"></span>
                <span>PPC Pozzolana (IS 1489) · Dense Matrix & Durability</span>
              </div>
            </div>

            <div className="curing-svg-wrap">
              <svg viewBox="0 0 760 290" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="grad53" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1B365D" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#1B365D" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="grad43" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C86D3B" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#C86D3B" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="gradPpc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2E7D5B" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#2E7D5B" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Y-Grid lines */}
                <g
                  className="chart-grid"
                  stroke="rgba(184, 161, 139, 0.25)"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                >
                  <line x1="60" y1="35" x2="720" y2="35" />
                  <line x1="60" y1="82.5" x2="720" y2="82.5" />
                  <line x1="60" y1="130" x2="720" y2="130" />
                  <line x1="60" y1="177.5" x2="720" y2="177.5" />
                  <line
                    x1="60"
                    y1="225"
                    x2="720"
                    y2="225"
                    strokeDasharray="none"
                    stroke="rgba(35, 56, 79, 0.2)"
                    strokeWidth="1.5"
                  />
                </g>

                {/* Y-Axis Scale Labels (MPa) */}
                <g
                  fontFamily="var(--font-mono)"
                  fontSize="10"
                  fill="var(--taupe)"
                  textAnchor="end"
                >
                  <text x="50" y="39">60 MPa</text>
                  <text x="50" y="86.5">45 MPa</text>
                  <text x="50" y="134">30 MPa</text>
                  <text x="50" y="181.5">15 MPa</text>
                  <text x="50" y="228">0 MPa</text>
                </g>

                {/* Vertical Milestone Guideline tracks */}
                <g stroke="rgba(184, 161, 139, 0.15)" strokeDasharray="2 2" strokeWidth="1">
                  <line x1="120" y1="35" x2="120" y2="225" />
                  <line x1="300" y1="35" x2="300" y2="225" />
                  <line x1="490" y1="35" x2="490" y2="225" />
                  <line x1="680" y1="35" x2="680" y2="225" />
                </g>

                {/* Area fills under curves */}
                <path
                  className="series-area-fill series-fill-53"
                  fill="url(#grad53)"
                  d="M 120 225 L 120 139.5 C 200 126, 230 116, 300 107.8 C 380 97, 420 86, 490 79.2 C 570 72, 610 57, 680 52.25 L 680 225 Z"
                />
                <path
                  className="series-area-fill series-fill-43"
                  fill="url(#grad43)"
                  d="M 120 225 L 120 152.2 C 200 138, 230 128, 300 120.5 C 380 112, 420 107, 490 101.5 C 570 95, 610 88, 680 83.1 L 680 225 Z"
                />
                <path
                  className="series-area-fill series-fill-ppc"
                  fill="url(#gradPpc)"
                  d="M 120 225 L 120 172.7 C 200 162, 230 156, 300 152.2 C 380 143, 420 132, 490 126.8 C 570 120, 610 109, 680 104.0 L 680 225 Z"
                />

                {/* Series 1: Grade 53 Line */}
                <path
                  className="chart-series-line series-line-53"
                  d="M 120 139.5 C 200 126, 230 116, 300 107.8 C 380 97, 420 86, 490 79.2 C 570 72, 610 57, 680 52.25"
                />

                {/* Series 2: Grade 43 Line */}
                <path
                  className="chart-series-line series-line-43"
                  d="M 120 152.2 C 200 138, 230 128, 300 120.5 C 380 112, 420 107, 490 101.5 C 570 95, 610 88, 680 83.1"
                />

                {/* Series 3: PPC Line */}
                <path
                  className="chart-series-line series-line-ppc"
                  d="M 120 172.7 C 200 162, 230 156, 300 152.2 C 380 143, 420 132, 490 126.8 C 570 120, 610 109, 680 104.0"
                />

                {/* Grade 53 Points & Labels */}
                <g className="series-points points-53" fill="#1B365D" stroke="#fff" strokeWidth="2">
                  <circle cx="120" cy="139.5" r="5" />
                  <circle cx="300" cy="107.8" r="5" />
                  <circle cx="490" cy="79.2" r="5" />
                  <circle cx="680" cy="52.25" r="5" />
                </g>
                <g className="series-point-label labels-53" fill="#1B365D">
                  <text x="120" y="125">27.0 MPa</text>
                  <text x="300" y="93">37.0 MPa</text>
                  <text x="490" y="65">46.0 MPa</text>
                  <text x="680" y="38">54.5 MPa</text>
                </g>

                {/* Grade 43 Points & Labels */}
                <g className="series-points points-43" fill="#C86D3B" stroke="#fff" strokeWidth="2">
                  <circle cx="120" cy="152.2" r="4.5" />
                  <circle cx="300" cy="120.5" r="4.5" />
                  <circle cx="490" cy="101.5" r="4.5" />
                  <circle cx="680" cy="83.1" r="4.5" />
                </g>
                <g className="series-point-label labels-43" fill="#C86D3B">
                  <text x="120" y="142">23.0 MPa</text>
                  <text x="300" y="110">33.0 MPa</text>
                  <text x="490" y="91">39.0 MPa</text>
                  <text x="680" y="73">44.8 MPa</text>
                </g>

                {/* PPC Points & Labels */}
                <g className="series-points points-ppc" fill="#2E7D5B" stroke="#fff" strokeWidth="2">
                  <circle cx="120" cy="172.7" r="4.5" />
                  <circle cx="300" cy="152.2" r="4.5" />
                  <circle cx="490" cy="126.8" r="4.5" />
                  <circle cx="680" cy="104.0" r="4.5" />
                </g>
                <g className="series-point-label labels-ppc" fill="#2E7D5B">
                  <text x="120" y="163">16.5 MPa</text>
                  <text x="300" y="142">23.0 MPa</text>
                  <text x="490" y="117">31.0 MPa</text>
                  <text x="680" y="94">38.2 MPa</text>
                </g>

                {/* X-Axis Milestone Labels */}
                <g
                  fontFamily="var(--font-mono)"
                  fontSize="11"
                  fill="var(--slate)"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  <text x="120" y="252">DAY 3</text>
                  <text x="300" y="252">DAY 7</text>
                  <text x="490" y="252">DAY 14</text>
                  <text x="680" y="252">DAY 28 (FINAL)</text>
                </g>
                <g
                  fontFamily="var(--font-mono)"
                  fontSize="9.5"
                  fill="var(--taupe)"
                  textAnchor="middle"
                >
                  <text x="120" y="267">Initial De-shutter</text>
                  <text x="300" y="267">65% Standard Cure</text>
                  <text x="490" y="267">85% Structural Load</text>
                  <text x="680" y="267">100% 28-Day Target</text>
                </g>
              </svg>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "18px",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--taupe)",
                flexWrap: "wrap",
                gap: "8px",
                borderTop: "1px solid var(--recessed)",
                paddingTop: "14px",
              }}
            >
              <span>TEST STANDARD: IS 4031 (PART 6) HYDRAULIC COMPRESSIVE STRENGTH</span>
              <span id="gradeNote">{kineticsInfo.note}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           4. BENCHMARK MATRIX SECTION (BIS STANDARDS)
           ============================================================ */}
      <section className="section" id="matrixSection" style={{ paddingTop: "60px" }}>
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
              Bureau of Indian Standards (BIS) Benchmark Matrix
            </h3>
            <p
              style={{
                color: "var(--taupe)",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                marginBottom: "16px",
              }}
            >
              PHYSICAL & CHEMICAL TESTING CRITERIA AS PER IS 4031 & IS 4032
            </p>

            <div className="table-responsive-wrap">
              <table className={`spec-table highlight-${activeKineticsGrade}`} id="benchmarkMatrix">
                <thead>
                  <tr>
                    <th>PROPERTY</th>
                    <th className="col-53">IS 12269 (GRADE 53)</th>
                    <th className="col-43">IS 8112 (GRADE 43)</th>
                    <th className="col-ppc">IS 1489 (PPC)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>3-Day Compressive Strength</td>
                    <td className="col-53">≥ 27.0 MPa</td>
                    <td className="col-43">≥ 23.0 MPa</td>
                    <td className="col-ppc">≥ 16.0 MPa</td>
                  </tr>
                  <tr>
                    <td>7-Day Compressive Strength</td>
                    <td className="col-53">≥ 37.0 MPa</td>
                    <td className="col-43">≥ 33.0 MPa</td>
                    <td className="col-ppc">≥ 22.0 MPa</td>
                  </tr>
                  <tr>
                    <td>28-Day Compressive Strength</td>
                    <td className="col-53">≥ 53.0 MPa</td>
                    <td className="col-43">≥ 43.0 MPa</td>
                    <td className="col-ppc">≥ 33.0 MPa</td>
                  </tr>
                  <tr>
                    <td>Initial Setting Time</td>
                    <td className="col-53">≥ 30 mins</td>
                    <td className="col-43">≥ 30 mins</td>
                    <td className="col-ppc">≥ 30 mins</td>
                  </tr>
                  <tr>
                    <td>Final Setting Time</td>
                    <td className="col-53">≤ 600 mins</td>
                    <td className="col-43">≤ 600 mins</td>
                    <td className="col-ppc">≤ 600 mins</td>
                  </tr>
                  <tr>
                    <td>Fineness (Blaine m²/kg)</td>
                    <td className="col-53">≥ 225</td>
                    <td className="col-43">≥ 225</td>
                    <td className="col-ppc">≥ 300</td>
                  </tr>
                  <tr>
                    <td>Soundness (Le Chatelier)</td>
                    <td className="col-53">≤ 10 mm</td>
                    <td className="col-43">≤ 10 mm</td>
                    <td className="col-ppc">≤ 10 mm</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mobile-swipe-hint">← Swipe horizontally to compare all grades →</div>
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
                <span className="boq-spec-label">TARGET CEMENT SPECIFICATION</span>
                <span className="boq-spec-val" id="boqGateSpecVal">
                  {currentProduct.title} ({currentProduct.spec})
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
                    {currentProduct.spec}
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
                    <label htmlFor="boqQty">ESTIMATED QUANTITY (BAGS)</label>
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
                Your cement procurement inquiry for{" "}
                <strong id="boqSuccessSpec">{currentProduct.title}</strong> has been logged with our
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
