"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

export default function QuoteForm({ requestId }: { requestId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ price: "", timeline: "", notes: "", questions: "" });

  if (!session) {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <p style={{ color: "#6b7280", marginBottom: "1rem" }}>Sign in as a vendor to submit a quote.</p>
        <button className="btn btn-primary" onClick={() => signIn("consentkeys", { callbackUrl: `/requests/${requestId}` })}>Sign In to Quote</button>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: requestId, price_cents: Math.round(parseFloat(form.price) * 100), timeline: form.timeline, notes: form.notes, questions: form.questions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit quote");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Your Price (CAD) *</label>
            <input type="number" min="1" step="0.01" placeholder="250.00" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Timeline</label>
            <input type="text" placeholder="e.g. 2 days, this weekend" value={form.timeline} onChange={e => setForm(f => ({ ...f, timeline: e.target.value }))} />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: "1rem" }}>
          <label>Your Pitch / Notes</label>
          <textarea rows={4} placeholder="Describe your approach, experience, what's included in your price..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: "vertical" }} />
        </div>

        <div className="form-group">
          <label>Questions for the Requester (optional)</label>
          <textarea rows={2} placeholder="Any clarifying questions before starting?" value={form.questions} onChange={e => setForm(f => ({ ...f, questions: e.target.value }))} style={{ resize: "vertical" }} />
        </div>

        <div className="alert alert-info" style={{ marginBottom: "1rem" }}>
          💡 You only pay a 15% commission if the requester selects your quote and pays. Submitting is always free.
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", fontSize: "1rem", padding: "0.75rem" }}>
          {loading ? "Submitting..." : "Submit Quote — Free"}
        </button>
      </div>
    </form>
  );
}
