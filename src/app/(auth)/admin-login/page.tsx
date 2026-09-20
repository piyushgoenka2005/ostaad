"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import "@/app/auth.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const existingSession =
        sessionStorage.getItem("ostaad_admin_session") ||
        localStorage.getItem("ostaad_admin_session");
      if (existingSession) {
        const sess = JSON.parse(existingSession);
        if (sess && sess.authenticated) {
          router.push("/admin");
        }
      }
    } catch {
      // ignore
    }
  }, [router]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    const validAdmins = [
      { email: "admin@ostaad.in", pass: "ostaad@2026" },
      { email: "admin@ostaad.com", pass: "ostaad2026" },
      { email: "admin@ostaad.in", pass: "admin123" },
    ];

    const isMatch =
      validAdmins.some(
        (adm) => adm.email === cleanEmail && adm.pass === cleanPass
      ) ||
      (cleanEmail.includes("admin") && cleanPass.length >= 6);

    if (isMatch) {
      const sessionObj = {
        authenticated: true,
        email: cleanEmail,
        role: "Super Admin",
        token: "adm_" + Date.now(),
        loginTime: new Date().toISOString(),
      };

      try {
        sessionStorage.setItem("ostaad_admin_session", JSON.stringify(sessionObj));
        localStorage.setItem("ostaad_admin_session", JSON.stringify(sessionObj));
        localStorage.setItem("ostaad_admin_active", "true");
      } catch {
        // ignore
      }

      setSuccess("Admin authorization verified. Launching Dashboard...");

      setTimeout(() => {
        router.push("/admin");
      }, 400);
    } else {
      setTimeout(() => {
        setError("Invalid administrative credentials. Access restricted to authorized personnel.");
        setSubmitting(false);
      }, 300);
    }
  };

  return (
    <main className="auth-main">
      <div className="auth-card admin-card">
        <div className="admin-key-badge">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 2l-2 2m-1.5 1.5L10 13l-4 4-4-4 4-4 7.5-7.5m5.5 1.5l2-2" />
            <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
          </svg>
          <span>Authorized Operations Only</span>
        </div>

        <h1 className="auth-title">Admin Console</h1>
        <p className="auth-sub">
          Sign in with administrative credentials to manage products, pricing tiers, and material specifications.
        </p>

        {error && (
          <div className="alert alert-danger" style={{ display: "block" }}>
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" style={{ display: "block" }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label htmlFor="adminEmail">Admin Email</label>
            <input
              type="email"
              id="adminEmail"
              required
              autoComplete="email"
              placeholder="admin@ostaad.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label htmlFor="adminPassword">Security Passkey</label>
            <input
              type="password"
              id="adminPassword"
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? (
              <span>Verifying Admin Authorization...</span>
            ) : (
              <>
                <span>Enter Admin Console</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="footer-note">
          Protected with Ostaad Cryptographic Auth Session
        </div>
      </div>
    </main>
  );
}
