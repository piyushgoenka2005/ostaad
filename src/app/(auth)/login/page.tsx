"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import "@/app/auth.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get("redirect") || "/products";

  const { login, loginWithGoogle, resetUserPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ msg: string; type: "error" | "success" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    const res = await login(email.trim(), password);
    if (res.success) {
      setStatus({ msg: "Sign in successful! Redirecting...", type: "success" });
      setTimeout(() => {
        router.push(redirectPath);
      }, 500);
    } else {
      setStatus({
        msg: res.error || "Failed to sign in. Please verify your credentials.",
        type: "error",
      });
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setStatus(null);
    setLoading(true);

    const res = await loginWithGoogle();
    if (res.success) {
      setStatus({ msg: "Authenticated with Google! Redirecting...", type: "success" });
      setTimeout(() => {
        router.push(redirectPath);
      }, 500);
    } else {
      setStatus({
        msg: res.error || "Google sign-in was cancelled or encountered an error.",
        type: "error",
      });
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setStatus({
        msg: "Please enter your email address first to receive a password reset link.",
        type: "error",
      });
      return;
    }
    const res = await resetUserPassword(email.trim());
    if (res.success) {
      setStatus({
        msg: `Password reset link dispatched to ${email.trim()}.`,
        type: "success",
      });
    } else {
      setStatus({
        msg: res.error || "Failed to send reset link. Please verify your email.",
        type: "error",
      });
    }
  };

  return (
    <div className="auth-card">
      <span className="auth-eyebrow">SPECIFICATION & BOQ ACCESS</span>
      <h1>Sign in to Ostaad</h1>
      <p className="auth-sub">
        Access verified material specifications, bill-of-quantities audits, and transparent procurement pricing.
      </p>

      {/* Google Sign-In */}
      <button
        type="button"
        className="btn-google"
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        <svg viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        Continue with Google
      </button>

      <div className="auth-divider">OR SIGN IN WITH EMAIL</div>

      {/* Email / Password Form */}
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="emailInput">Email Address</label>
          <input
            type="email"
            id="emailInput"
            required
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field-group">
          <div className="field-label-row">
            <label htmlFor="passwordInput">Password</label>
            <button
              type="button"
              className="forgot-link"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
          </div>
          <input
            type="password"
            id="passwordInput"
            required
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          <span>{loading ? "Signing in..." : "Sign In to Ostaad"}</span>
          <span>→</span>
        </button>

        {status && (
          <div
            className={`auth-status ${status.type}`}
            style={{ display: "block" }}
            role="alert"
          >
            {status.msg}
          </div>
        )}
      </form>

      <div className="auth-footer">
        Don&apos;t have an account? <Link href="/signup">Create an account →</Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="auth-main">
      <Suspense fallback={<div className="auth-card">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
