"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import { IProduct } from "@/types";
import { BoqModal } from "@/components/store/BoqModal";
import { sanitizeQueryParam, sanitizeString } from "@/lib/security/sanitize";

export default function ProductsPage() {
  const router = useRouter();
  const { products } = useProducts();
  const [activeCategory, setActiveCategory] = useState<string>("cement");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Restore category filter on load or back navigation
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get("cat") || params.get("category");
    const savedCat = sessionStorage.getItem("ostaad_last_product_cat");
    const targetCat = catParam || savedCat;

    if (targetCat) {
      const cleanTarget = sanitizeQueryParam(targetCat).toLowerCase();
      const validCats = ["cement", "tiles", "paint", "plywood", "waterproofing", "all"];
      if (validCats.includes(cleanTarget)) {
        setActiveCategory(cleanTarget);
        if (catParam) {
          setTimeout(() => {
            const el = document.getElementById("catalogToolbar") || document.getElementById("productsGrid");
            if (el) {
              el.scrollIntoView({ behavior: "smooth" });
            }
          }, 100);
        }
      }
    }
  }, []);

  const handleCategoryChange = (cat: string) => {
    const cleanCat = sanitizeQueryParam(cat).toLowerCase();
    setActiveCategory(cleanCat);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("ostaad_last_product_cat", cleanCat);
      const url = new URL(window.location.href);
      url.searchParams.set("cat", cleanCat);
      window.history.replaceState({}, "", url.toString());
    }
  };

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);

  // BOQ Modal state
  const [isBoqOpen, setIsBoqOpen] = useState(false);
  const [boqTargetSpec, setBoqTargetSpec] = useState("OPC 53 Grade Cement · IS 12269");

  // Filter and Search
  const filteredProducts = useMemo(() => {
    let list = [...products];

    const cleanSearch = sanitizeString(searchQuery, 100).trim();
    if (cleanSearch) {
      const q = cleanSearch.toLowerCase();
      return list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.grade?.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.standard?.toLowerCase().includes(q)
      );
    }

    if (activeCategory !== "all") {
      list = list.filter(
        (p) => p.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    return list;
  }, [products, activeCategory, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      cement: 0,
      tiles: 0,
      paint: 0,
      plywood: 0,
      waterproofing: 0,
    };
    products.forEach((p) => {
      const cat = p.category.toLowerCase();
      if (counts[cat] !== undefined) {
        counts[cat]++;
      }
    });
    return counts;
  }, [products]);

  const handleOpenDrawer = (product: IProduct) => {
    setSelectedProduct(product);
    setIsDrawerOpen(true);
  };

  const handleOpenBoqFromDrawer = () => {
    if (selectedProduct) {
      setBoqTargetSpec(`${selectedProduct.title} · ${selectedProduct.standard || "IS Standard"}`);
    }
    setIsDrawerOpen(false);
    setIsBoqOpen(true);
  };

  const getSampleClass = (product: IProduct) => {
    const id = product.id.toLowerCase();
    if (id.includes("cement-53") || id.includes("53")) return "sample-cement-53";
    if (id.includes("cement-43") || id.includes("43")) return "sample-cement-43";
    if (id.includes("clay")) return "sample-clay-tiles";
    if (id.includes("organic") || id.includes("tile")) return "sample-organic-tiles";
    if (id.includes("paint")) return "sample-paint";
    if (id.includes("plywood")) return "sample-plywood";
    if (id.includes("waterproof")) return "sample-waterproofing";
    return "";
  };

  const getPageUrl = (product: IProduct) => {
    if (product.pageUrl) {
      if (product.pageUrl.includes("product-cement.html")) return "/products/cement";
      if (product.pageUrl.includes("product-paint.html")) return "/products/paint";
      if (product.pageUrl.includes("product-plywood.html")) return "/products/plywood";
      if (product.pageUrl.includes("product-tiles.html")) return "/products/tiles";
      if (product.pageUrl.includes("product-waterproofing.html")) return "/products/waterproofing";
      if (product.pageUrl.startsWith("/")) return product.pageUrl;
    }
    const cat = product.category.toLowerCase();
    if (cat.includes("cement")) return "/products/cement";
    if (cat.includes("paint")) return "/products/paint";
    if (cat.includes("plywood")) return "/products/plywood";
    if (cat.includes("tile")) return "/products/tiles";
    if (cat.includes("waterproof")) return "/products/waterproofing";
    return "/products";
  };

  return (
    <main>
      {/* ============================================================
         HERO — ARCHITECTURAL PRODUCT CATALOG
         ============================================================ */}
      <section className="products-hero">
        <div className="hero-canvas-bg" aria-hidden="true"></div>
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="eyebrow">VERIFIED SPECIFICATION REPOSITORY</div>
              <h1 className="hero-title">
                Every material your bari needs.<br />
                <em>Specified. Priced. Verified.</em>
              </h1>
              <p className="hero-lede">
                Construction doesn&apos;t fail on ambition; it fails on missing specifications and mismatched quotes.
                Ostaad provides benchmarked grades, verified unit costs, and structural tolerances for every essential
                element.
              </p>
              <div className="hero-bangla">
                “Konta lagbe? Koto lagbe? Koto porbe? Shob ek jaigaye.”
              </div>
            </div>

            <div className="hero-meta-box">
              <div className="meta-row">
                <span>MARKET BASELINE</span>
                <div className="badge-live">LIVE VERIFIED RATES</div>
              </div>
              <div className="meta-row">
                <span>CURATED CATEGORIES</span>
                <strong>5 ESSENTIAL TRADES</strong>
              </div>
              <div className="meta-row">
                <span>SPECIFICATION COMPLIANCE</span>
                <strong>IS 12269 · IS 8112 · IS 710 · IS 2645</strong>
              </div>
              <div className="meta-row">
                <span>ACTIVE BLUEPRINTS BENCHMARKED</span>
                <strong>480+ HOMES</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
         TOOLBAR & CATEGORY FILTERING
         ============================================================ */}
      <div className="catalog-toolbar" id="catalogToolbar">
        <div className="container">
          <div className="toolbar-inner">
            <div className="filter-pills" id="filterPills" role="tablist">
              <button
                className={`filter-btn ${activeCategory === "cement" ? "active" : ""}`}
                onClick={() => handleCategoryChange("cement")}
                role="tab"
                aria-selected={activeCategory === "cement"}
              >
                Cement <span className="count">{categoryCounts.cement || 2}</span>
              </button>
              <button
                className={`filter-btn ${activeCategory === "tiles" ? "active" : ""}`}
                onClick={() => handleCategoryChange("tiles")}
                role="tab"
                aria-selected={activeCategory === "tiles"}
              >
                Tiles <span className="count">{categoryCounts.tiles || 2}</span>
              </button>
              <button
                className={`filter-btn ${activeCategory === "paint" ? "active" : ""}`}
                onClick={() => handleCategoryChange("paint")}
                role="tab"
                aria-selected={activeCategory === "paint"}
              >
                Paint <span className="count">{categoryCounts.paint || 1}</span>
              </button>
              <button
                className={`filter-btn ${activeCategory === "plywood" ? "active" : ""}`}
                onClick={() => handleCategoryChange("plywood")}
                role="tab"
                aria-selected={activeCategory === "plywood"}
              >
                Plywood <span className="count">{categoryCounts.plywood || 1}</span>
              </button>
              <button
                className={`filter-btn ${activeCategory === "waterproofing" ? "active" : ""}`}
                onClick={() => handleCategoryChange("waterproofing")}
                role="tab"
                aria-selected={activeCategory === "waterproofing"}
              >
                Waterproofing <span className="count">{categoryCounts.waterproofing || 1}</span>
              </button>
            </div>

            <div className="search-wrap">
              <svg className="search-icon" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                placeholder="Search material, grade, IS code..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
         PRODUCTS LISTING GRID
         ============================================================ */}
      <section className="section" style={{ paddingTop: "10px" }}>
        <div className="container">
          <div className="section-head" style={{ maxWidth: "100%", marginBottom: "36px" }}>
            <h2 className="whitespace-normal md:whitespace-nowrap" style={{ fontSize: "clamp(26px, 3.6vw, 44px)" }}>
              Verified Construction Specifications
            </h2>
            <p style={{ maxWidth: "760px" }}>
              Procurement-ready building materials mapped directly to standard bill-of-quantities codes, structural
              codes, and transparent market benchmarks.
            </p>
          </div>

          <div className="products-grid" id="productsGrid">
            {filteredProducts.map((p) => {
              const catClass = p.category.toLowerCase();
              const sampleClass = getSampleClass(p);
              const targetUrl = getPageUrl(p);

              return (
                <article
                  key={p.id}
                  className="product-card spotlight"
                  data-category={catClass}
                  data-id={p.id}
                  onClick={() => router.push(targetUrl)}
                >
                  <div className="card-top-bar">
                    <span className={`cat-tag ${catClass}`}>{p.category}</span>
                    <span className="spec-code">{p.standard || p.grade}</span>
                  </div>
                  <h3 className="product-title">
                    <span style={{ color: "inherit" }}>
                      {p.title}
                    </span>
                  </h3>
                  <p className="product-subtitle">{p.description || p.grade}</p>

                  <div className={`product-sample ${sampleClass}`}>
                    <Image
                      src={
                        p.image ||
                        "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=500&q=80"
                      }
                      alt={p.title}
                      width={400}
                      height={260}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      unoptimized
                    />
                  </div>

                  <div className="card-bottom">
                    <div className="price-row">
                      <div className="price-main">
                        <span className="currency">₹</span>
                        <span className="amount">{Number(p.price).toLocaleString("en-IN")}</span>
                        <span className="unit">{p.unit || "/ UNIT"}</span>
                      </div>
                      <span className="price-badge">TAX INCL.</span>
                    </div>
                    <div className="card-actions">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm inspect-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDrawer(p);
                        }}
                      >
                        Quick Inspect
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(targetUrl);
                        }}
                      >
                        Full Spec <span className="arrow">→</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
         DETAILED COMPARISON TABLE — CEMENT GRADE 53 vs 43
         ============================================================ */}
      <section className="section comparison-section">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">TECHNICAL AUDIT & SELECTION</div>
            <h2>Grade 53 vs Grade 43 Cement — Which one where?</h2>
            <p>
              Understanding which cement grade to deploy avoids over-expenditure in masonry while ensuring certified
              structural integrity for RCC framing.
            </p>
          </div>

          <div className="comp-table-wrap">
            <table className="comp-table">
              <thead>
                <tr>
                  <th>TECHNICAL PARAMETER</th>
                  <th>OPC GRADE 53</th>
                  <th>OPC GRADE 43</th>
                  <th>PPC (BLENDED)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>28-Day Strength</strong></td>
                  <td><span className="comp-badge rec">≥ 53 MPa</span></td>
                  <td>≥ 43 MPa</td>
                  <td>≥ 33 MPa (Long term gain)</td>
                </tr>
                <tr>
                  <td><strong>Heat of Hydration</strong></td>
                  <td>High (Requires quick curing)</td>
                  <td>Moderate</td>
                  <td>Low (Minimal micro-cracking)</td>
                </tr>
                <tr>
                  <td><strong>Ideal Structural Zone</strong></td>
                  <td>Columns, Beams, Cantilevers, Slabs</td>
                  <td>Brick Masonry, Boundary Walls</td>
                  <td>Plastering, Foundation Mass Concrete</td>
                </tr>
                <tr>
                  <td><strong>De-shuttering Period</strong></td>
                  <td>Faster (3–7 Days depending on span)</td>
                  <td>Standard (7–14 Days)</td>
                  <td>Standard (10–14 Days)</td>
                </tr>
                <tr>
                  <td><strong>Approximate Rate</strong></td>
                  <td>₹385 / Bag</td>
                  <td>₹360 / Bag</td>
                  <td>₹345 / Bag</td>
                </tr>
                <tr>
                  <td><strong>Ostaad Recommendation</strong></td>
                  <td><span className="comp-badge rec">Use for RCC Core Structure</span></td>
                  <td><span className="comp-badge">Use for Walls & Non-Load Elements</span></td>
                  <td><span className="comp-badge">Use for Plaster & Finishing</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ============================================================
         FINAL CTA
         ============================================================ */}
      <section className="final-cta">
        <div className="hero-canvas-bg"></div>
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div className="eyebrow" style={{ color: "rgba(255,255,255,.6)", justifyContent: "center" }}>
            FROM DRAWING TO SPECIFICATION
          </div>
          <h2>Ready to turn your drawing into a verified material bill?</h2>
          <p>
            Share your blueprint with Ostaad. Get accurate quantities, certified grades, and reliable cost references
            before purchasing a single bag of cement.
          </p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/#see"
              className="btn btn-primary"
              style={{ background: "#fff", color: "var(--slate)" }}
            >
              Experience Ostaad <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
         SPECIFICATION SLIDE-OVER DRAWER (MODAL)
         ============================================================ */}
      <div
        className={`spec-modal-overlay ${isDrawerOpen ? "open" : ""}`}
        id="specModalOverlay"
        aria-hidden={!isDrawerOpen}
        onClick={() => setIsDrawerOpen(false)}
      >
        <div
          className="spec-drawer"
          id="specDrawer"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="drawer-header">
            <div>
              <span className="cat-tag" id="drawerCatTag">
                {selectedProduct?.category || "CEMENT"}
              </span>
              <span className="spec-code" id="drawerCode" style={{ marginLeft: "8px" }}>
                {selectedProduct?.standard || "IS 12269"}
              </span>
            </div>
            <button
              type="button"
              className="drawer-close"
              id="drawerClose"
              aria-label="Close details drawer"
              onClick={() => setIsDrawerOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="drawer-body">
            <h3 id="drawerTitle">{selectedProduct?.title || "Material Specification"}</h3>
            <div className="drawer-sub" id="drawerSub">
              {selectedProduct?.grade || "VERIFIED PROCUREMENT SPECIFICATION"}
            </div>

            <div className="product-sample" id="drawerSample" style={{ height: "160px", marginBottom: "20px" }}>
              {selectedProduct?.image && (
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.title}
                  width={500}
                  height={200}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              )}
            </div>

            <p id="drawerDesc" style={{ color: "var(--text)", fontSize: "14.5px", lineHeight: 1.6, marginBottom: "24px" }}>
              {selectedProduct?.description ||
                "High-strength certified building material engineered according to BIS and Indian Standards for structural applications."}
            </p>

            <div className="card card-pad" style={{ background: "rgba(250,247,244,.9)", marginBottom: "24px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--taupe)", letterSpacing: ".08em" }}>
                VERIFIED MARKET BENCHMARK
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "6px" }}>
                <span
                  style={{ fontSize: "26px", fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--slate)" }}
                  id="drawerPrice"
                >
                  ₹{Number(selectedProduct?.price || 0).toLocaleString("en-IN")} {selectedProduct?.unit || ""}
                </span>
                <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--sage)" }} id="drawerAvailability">
                  ● {selectedProduct?.status === "in_stock" ? "IN STOCK · VERIFIED DISPATCH" : "DIRECT MILL SUPPLY"}
                </span>
              </div>
            </div>

            <h4 style={{ fontSize: "15px", fontWeight: 600, color: "var(--slate)", marginBottom: "12px" }}>
              Technical Properties & Audit Standards
            </h4>
            <table className="detail-table" id="drawerTable">
              <tbody>
                <tr>
                  <th>Compliance Code</th>
                  <td>{selectedProduct?.standard || "IS Certified"}</td>
                </tr>
                <tr>
                  <th>Shipper / Origin</th>
                  <td>{selectedProduct?.shipper || "Direct Regional Plant"}</td>
                </tr>
                <tr>
                  <th>Delivery Turnaround</th>
                  <td>{selectedProduct?.leadTime || "24–48 Hours"}</td>
                </tr>
              </tbody>
            </table>

            <div className="app-box">
              <h4>WHERE TO USE THIS SPECIFICATION</h4>
              <ul id="drawerUseList">
                <li>Primary RCC framing, columns, slabs & beams</li>
                <li>Engineered masonry & architectural surface finishes</li>
                <li>Direct contractor bill-of-quantities audit verification</li>
              </ul>
            </div>
          </div>

          <div className="drawer-footer">
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--taupe)" }}>
                ESTIMATION STATUS
              </div>
              <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--slate)" }}>
                Audit Approved
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {selectedProduct && (
                <Link
                  href={getPageUrl(selectedProduct)}
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  Full Product Page <span className="arrow">→</span>
                </Link>
              )}
              <button
                type="button"
                id="drawerBoqBtn"
                className="btn btn-primary btn-sm"
                onClick={handleOpenBoqFromDrawer}
              >
                Request BOQ Integration <span className="arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOQ Integration Modal */}
      <BoqModal
        isOpen={isBoqOpen}
        onClose={() => setIsBoqOpen(false)}
        product={selectedProduct}
        targetSpec={boqTargetSpec}
      />
    </main>
  );
}
