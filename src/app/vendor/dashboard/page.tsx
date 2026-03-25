import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { supabaseService } from "@/lib/supabase-server";
import { Quote, formatPrice } from "@/lib/types";
import Nav from "@/components/Nav";

export default async function VendorDashboard({ searchParams }: { searchParams: Promise<{ registered?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { registered } = await searchParams;

  const { data: vendor } = await supabaseService.from("quoteveil_vendors").select("*").eq("id", session.user.id).single();

  if (!vendor) redirect("/vendor/register");

  const { data: quotes } = await supabaseService
    .from("quoteveil_quotes")
    .select("*, request:quoteveil_requests(id,title,category,location_area,status,budget_hint)")
    .eq("vendor_id", session.user.id)
    .order("created_at", { ascending: false });

  const won = quotes?.filter((q: Quote) => q.status === "selected") || [];
  const pending = quotes?.filter((q: Quote) => q.status === "pending") || [];
  const totalWonCents = won.reduce((sum: number, q: Quote) => sum + q.price_cents, 0);

  return (
    <div>
      <Nav />
      <div className="page">
        {registered && <div className="alert alert-success">✓ Vendor profile created! Start browsing open requests.</div>}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 className="page-title">{vendor.business_name}</h1>
            <p className="page-subtitle" style={{ marginBottom: 0 }}>{vendor.category} · {vendor.location_area || "All areas"}</p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link href="/requests" className="btn btn-primary">Browse Open Requests →</Link>
            <Link href="/vendor/register" className="btn btn-outline">Edit Profile</Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Quotes Submitted", value: quotes?.length || 0 },
            { label: "Pending", value: pending.length },
            { label: "Jobs Won", value: won.length },
            { label: "Total Won", value: formatPrice(totalWonCents) },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#2563eb" }}>{s.value}</div>
              <div style={{ fontSize: "0.8125rem", color: "#6b7280", marginTop: "0.25rem" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quotes list */}
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem" }}>My Quotes</h2>
        {!quotes?.length ? (
          <div className="empty">
            <h3>No quotes yet</h3>
            <p>Browse open requests and start winning jobs.</p>
            <Link href="/requests" className="btn btn-primary" style={{ marginTop: "1rem" }}>Browse Requests</Link>
          </div>
        ) : (
          <div>
            {(quotes as (Quote & { request: { id: string; title: string; category: string; location_area: string; status: string; budget_hint: string } })[]).map(q => (
              <div key={q.id} className={`quote-row ${q.status === "selected" ? "selected" : ""}`}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <Link href={`/requests/${q.request?.id}`} style={{ fontWeight: 700, color: "#2563eb", textDecoration: "none", fontSize: "1rem" }}>
                      {q.request?.title}
                    </Link>
                    <div style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: "0.2rem" }}>{q.request?.category} · {q.request?.location_area}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800 }}>{formatPrice(q.price_cents)}</div>
                    <span className={`badge badge-${q.status === "selected" ? "matched" : q.status === "rejected" ? "expired" : "open"}`}>
                      {q.status === "selected" ? "🏆 Won" : q.status === "rejected" ? "Not selected" : "Pending"}
                    </span>
                  </div>
                </div>
                {q.status === "selected" && (
                  <div className="alert alert-success" style={{ marginTop: "0.75rem", marginBottom: 0 }}>
                    🎉 You won this job! Check your email for the requester&apos;s contact details.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
