"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { CATEGORIES } from "@/lib/types";
import Nav from "@/components/Nav";

export default function VendorRegisterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [nextPath, setNextPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [existing, setExisting] = useState<boolean | null>(null);
  const [form, setForm] = useState({ business_name: "", category: "", description: "", contact_email: "", contact_phone: "", location_area: "" });

  useEffect(() => {
    setNextPath(new URLSearchParams(window.location.search).get("next"));
    if (session?.user?.email) setForm(f => ({ ...f, contact_email: session.user?.email || "" }));
    if (session?.user?.id) {
      fetch("/api/vendor").then(r => r.json()).then(d => {
        if (d?.id) { setExisting(true); setForm({ business_name: d.business_name, category: d.category, description: d.description || "", contact_email: d.contact_email, contact_phone: d.contact_phone || "", location_area: d.location_area || "" }); }
        else setExisting(false);
      });
    }
  }, [session]);

  if (status === "loading") return <div className="page" style={{ textAlign: "center", paddingTop: "5rem" }}>Loading...</div>;

  if (!session) return (
    <div><Nav />
      <div className="page-sm" style={{ textAlign: "center", paddingTop: "4rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏪</div>
        <h1 className="page-title">Become a Vendor</h1>
        <p style={{ color: "#6b7280", marginBottom: "2rem" }}>Create a vendor profile to browse requests and submit quotes. You only pay when you win.</p>
        <button className="btn btn-primary" style={{ fontSize: "1rem", padding: "0.75rem 2rem" }} onClick={() => signIn("consentkeys", { callbackUrl: nextPath ? `/vendor/register?next=${encodeURIComponent(nextPath)}` : "/vendor/register" })}>Sign In to Continue</button>
      </div>
    </div>
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/vendor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save vendor profile");
      router.push(nextPath || "/vendor/dashboard?registered=true");
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setLoading(false); }
  }

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div><Nav />
      <div className="page-sm">
        <div style={{ marginBottom: "2rem" }}>
          <h1 className="page-title">{existing ? "Edit Vendor Profile" : "Become a Vendor"}</h1>
          <p className="page-subtitle">Browse open requests and quote for free. Pay 15% only when you win the job.</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="form-group"><label>Business Name *</label><input type="text" placeholder="e.g. CleanPro Montreal" value={form.business_name} onChange={e => set("business_name", e.target.value)} required /></div>
            <div className="form-group"><label>Category *</label>
              <select value={form.category} onChange={e => set("category", e.target.value)} required>
                <option value="">Select your primary service...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group"><label>About Your Business</label><textarea rows={3} placeholder="Brief description of your services, experience, and what makes you stand out..." value={form.description} onChange={e => set("description", e.target.value)} style={{ resize: "vertical" }} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group" style={{ marginBottom: 0 }}><label>Contact Email *</label><input type="email" value={form.contact_email} onChange={e => set("contact_email", e.target.value)} required /></div>
              <div className="form-group" style={{ marginBottom: 0 }}><label>Phone (optional)</label><input type="tel" placeholder="+1 514-555-0100" value={form.contact_phone} onChange={e => set("contact_phone", e.target.value)} /></div>
            </div>
            <div className="form-group" style={{ marginTop: "1rem" }}><label>Service Area</label><input type="text" placeholder="e.g. Greater Montreal, Laval, South Shore" value={form.location_area} onChange={e => set("location_area", e.target.value)} /></div>
            <div className="alert alert-info" style={{ marginBottom: "1rem" }}>
              💡 Your contact details are only shared with a requester <strong>after they pay and select your quote</strong>.
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", fontSize: "1rem", padding: "0.75rem" }}>
              {loading ? "Saving..." : existing ? "Update Profile" : "Create Vendor Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
