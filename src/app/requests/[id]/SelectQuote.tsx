"use client";
import { useState } from "react";
import { formatPrice } from "@/lib/types";

export default function SelectQuote({ quoteId, requestId, vendorName, priceCents }: { quoteId: string; requestId: string; vendorName: string; priceCents: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const commission = Math.round(priceCents * 0.15);
  const total = priceCents;

  async function handleSelect() {
    if (!confirm(`Select ${vendorName} for ${formatPrice(priceCents)}?\n\nA 15% platform fee (${formatPrice(commission)}) is included. You'll be taken to checkout. On payment, your contact info is shared with ${vendorName}.`)) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote_id: quoteId, request_id: requestId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start checkout");
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      {error && <div className="alert alert-error" style={{ marginBottom: "0.75rem" }}>{error}</div>}
      <button className="btn btn-primary" onClick={handleSelect} disabled={loading} style={{ fontSize: "0.9rem" }}>
        {loading ? "Starting checkout..." : `Choose ${vendorName} — Pay ${formatPrice(total)}`}
      </button>
      <span style={{ fontSize: "0.8125rem", color: "#9ca3af", marginLeft: "0.75rem" }}>
        Includes 15% platform fee · Your contact info shared on payment
      </span>
    </div>
  );
}
