"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Footer: React.FC = () => {
  const pathname = usePathname();

  // If on admin dashboard, don't render footer
  if (pathname === "/admin" || (pathname?.startsWith("/admin/") && pathname !== "/admin-login")) {
    return null;
  }

  // If on auth or admin login pages, render clean minimalist footer
  if (pathname === "/login" || pathname === "/signup" || pathname === "/admin-login") {
    return (
      <footer className="auth-site-foot">
        © 2026 Ostaad Technologies Pvt Ltd · Construction Procurement Intelligence
      </footer>
    );
  }

  return (
    <footer>
      <div className="foot-top">
        <div className="foot-brand">
          <h3>OSTAAD</h3>
          <p>
            The structural material verification desk for homeowners, builders, and contractors. Direct mill pricing benchmarks and rigorous IS compliance standards.
          </p>
          <div className="foot-flow">
            KNOW YOUR QUANTITY → SEE YOUR BENCHMARK → BUILD YOUR BARI
          </div>
        </div>

        <div className="foot-col">
          <h4>SPECIFICATIONS</h4>
          <ul>
            <li><Link href="/products/cement">OPC 53 Cement</Link></li>
            <li><Link href="/products/cement">OPC 43 Cement</Link></li>
            <li><Link href="/products/tiles">Terracotta Clay Tiles</Link></li>
            <li><Link href="/products/tiles">Vitrified Mineral Tiles</Link></li>
            <li><Link href="/products/paint">Architectural Low-VOC Paint</Link></li>
            <li><Link href="/products/plywood">IS 710 Marine Plywood</Link></li>
            <li><Link href="/products/waterproofing">2K Waterproofing Slurry</Link></li>
          </ul>
        </div>

        <div className="foot-col">
          <h4>COMPANY</h4>
          <ul>
            <li><Link href="/about">About Ostaad</Link></li>
            <li><Link href="/#see">Verification Process</Link></li>
            <li><Link href="/#faq">Technical Audit FAQ</Link></li>
            <li><Link href="/contact">Engineering Support</Link></li>
            <li><Link href="/admin-login">Admin Console</Link></li>
          </ul>
        </div>

        <div className="foot-col">
          <h4>LEGAL & COMPLIANCE</h4>
          <ul>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/privacy">Terms of Specification</Link></li>
            <li><Link href="/privacy">IS Code Compliance Notice</Link></li>
            <li><Link href="/privacy">Direct Mill Benchmark Disclaimer</Link></li>
          </ul>
        </div>
      </div>

      <div className="foot-bottom">
        <div>© 2026 OSTAAD INFRASTRUCTURE TECHNOLOGIES. ALL RIGHTS RESERVED.</div>
        <div>VERIFIED MATERIAL CODES · IS 12269 · IS 8112 · IS 15622 · IS 710 · IS 2645</div>
      </div>
    </footer>
  );
};
