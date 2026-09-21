"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "U";
}

export const FloatingNav: React.FC = () => {
  const pathname = usePathname();
  const { user, profile, isAuthenticated, logout } = useAuth();
  const [isNavHidden, setIsNavHidden] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const avatarWrapRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastY && currentY > 140) {
        setIsNavHidden(true);
      } else {
        setIsNavHidden(false);
      }
      lastY = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarWrapRef.current && !avatarWrapRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 280); // 280ms grace window so moving between avatar & dropdown is seamless
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
  };

  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";
  const isAdminDashboard = pathname === "/admin" || (pathname?.startsWith("/admin/") && pathname !== "/admin-login");

  if (isAdminDashboard) {
    return null;
  }

  const displayName = user?.displayName || profile?.displayName || "Ostaad Member";
  const displayEmail = user?.email || profile?.email || "";
  const displayRole = profile?.role || "Member";
  const initials = getInitials(displayName, displayEmail);

  return (
    <>
      <div className={`nav-wrap ${isNavHidden ? "nav-hide" : ""}`} id="navWrap">
        <nav className="nav">
          <Link href="/#hero" className="nav-logo">
            <span className="nav-logo-mark">
              <Image
                src="/ostaad-logo.png"
                alt="Ostaad Logo"
                width={25}
                height={25}
                className="w-full h-full object-cover scale-[1.78]"
                priority
              />
            </span>
            <b>OSTAAD</b>
          </Link>
          <ul className="nav-links">
            <li><Link href="/products">Product</Link></li>
            <li><Link href="/#see">Experience</Link></li>
            <li><Link href="/#faq">FAQ</Link></li>
            <li><Link href="/about">About us</Link></li>
          </ul>
          <div className="nav-cta">
            <Link className="nav-secondary" href="/contact">Contact Ostaad</Link>

            {isAuthenticated ? (
              <div
                ref={avatarWrapRef}
                className={`user-avatar-wrap ${isDropdownOpen ? "open" : ""}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  className="user-avatar-btn"
                  aria-label="User Profile"
                  title={displayName}
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                >
                  {initials}
                </button>
                <div
                  className="user-dropdown"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="user-dropdown-header">
                    <span className="user-dropdown-name">{displayName}</span>
                    <span className="user-dropdown-email">{displayEmail}</span>
                    <span className="user-dropdown-role">{displayRole}</span>
                  </div>
                  <div className="user-dropdown-divider" />
                  <button
                    type="button"
                    className="user-dropdown-item signout-btn"
                    onClick={handleLogout}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      stroke="currentColor"
                      fill="none"
                      strokeWidth="2"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : isLoginPage ? (
              <Link href="/signup" className="btn btn-primary btn-sm">
                Create Account <span className="arrow">→</span>
              </Link>
            ) : isSignupPage ? (
              <Link href="/login" className="btn btn-primary btn-sm">
                Sign In <span className="arrow">→</span>
              </Link>
            ) : (
              <Link href="/login" className="btn btn-primary btn-sm">
                Login <span className="arrow">→</span>
              </Link>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="mobile-nav">
        <Link href="/products">
          <svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          <span>Materials</span>
        </Link>
        <Link href="/#see">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
          <span>Experience</span>
        </Link>
        <Link href="/#faq">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span>FAQ</span>
        </Link>
        <Link href="/contact">
          <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <span>Contact</span>
        </Link>
      </div>
    </>
  );
};
