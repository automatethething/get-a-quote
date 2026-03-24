"use client";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <div className="card" style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔑</div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 0.5rem" }}>Sign in to GetAQuote</h1>
        <p style={{ color: "#6b7280", marginBottom: "2rem", fontSize: "0.9375rem" }}>Post requests, track quotes, and manage your account.</p>
        <button
          className="btn btn-primary"
          style={{ width: "100%", fontSize: "1rem", padding: "0.75rem" }}
          onClick={() => signIn("consentkeys", { callbackUrl: "/dashboard" })}
        >
          Continue with ConsentKeys
        </button>
        <p style={{ color: "#9ca3af", fontSize: "0.8125rem", marginTop: "1.25rem" }}>
          By signing in you agree to our{" "}
          <a href="/terms" style={{ color: "#2563eb" }}>Terms</a> and{" "}
          <a href="/privacy" style={{ color: "#2563eb" }}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
