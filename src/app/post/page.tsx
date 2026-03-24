"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { CATEGORIES } from "@/lib/types";
import Nav from "@/components/Nav";

export default function PostRequestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    category: "",
    title: "",
    description: "",
    location_area: "",
    budget_hint: "",
    timeline: "",
  });

  if (status === "loading") return <div className="page" style={{ textAlign: "center", paddingTop: "5rem" }}>Loading...</div>;

  if (!session) {
    return (
      <div>
        <Nav />
        <div className="page-sm" style={{ textAlign: "center", paddingTop: "4rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
          <h1 className="page-title">Sign in to post a request</h1>
          <p style={{ color: "#6b7280", marginBottom: "2rem" }}>Your identity stays anonymous to vendors until you choose one and pay.</p>
          <button className="btn btn-primary" style={{ fontSize: "1rem", padding: "0.75rem 2rem" }} onClick={() => signIn("consentkeys", { callbackUrl: "/post" })}>
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post request");
      router.push(`/dashboard?posted=${data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <Nav />
      <div className="page-sm">
        <div style={{ marginBottom: "2rem" }}>
          <h1 className="page-title">Post a Quote Request</h1>
          <p className="page-subtitle">Your name, email, and contact info stay hidden until you choose a vendor.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="form-group">
              <label>Category *</label>
              <select value={form.category} onChange={e => set("category", e.target.value)} required>
                <option value="">Select a category...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                placeholder="e.g. Need house cleaned before move-out"
                value={form.title}
                onChange={e => set("title", e.target.value)}
                maxLength={100}
                required
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                rows={5}
                placeholder="Describe what you need in detail. The more specific, the better your quotes will be."
                value={form.description}
                onChange={e => set("description", e.target.value)}
                required
                style={{ resize: "vertical" }}
              />
            </div>

            <div className="form-group">
              <label>General Location</label>
              <input
                type="text"
                placeholder="e.g. Downtown Montreal, West Island, Ottawa area"
                value={form.location_area}
                onChange={e => set("location_area", e.target.value)}
              />
              <p style={{ fontSize: "0.8125rem", color: "#6b7280", marginTop: "0.35rem" }}>
                General area only — your exact address stays private. Leave blank for Remote / Online only.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label>Rough Budget (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Under $300, flexible"
                  value={form.budget_hint}
                  onChange={e => set("budget_hint", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Timeline (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. This weekend, ASAP, within 2 weeks"
                  value={form.timeline}
                  onChange={e => set("timeline", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", alignItems: "center" }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}>
              {loading ? "Posting..." : "Post Request — It's Free"}
            </button>
            <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Vendors will see this publicly, but not your identity</span>
          </div>
        </form>
      </div>
    </div>
  );
}
