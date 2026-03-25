import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { supabaseService } from "@/lib/supabase-server";
import { Request, formatPrice } from "@/lib/types";
import Nav from "@/components/Nav";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ posted?: string; matched?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { posted, matched } = await searchParams;

  const { data: requests } = await supabaseService
    .from("quoteveil_requests")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <Nav />
      <div className="page">
        {posted && <div className="alert alert-success">✓ Request posted! Vendors will start submitting quotes soon.</div>}
        {matched && <div className="alert alert-success">🎉 Payment confirmed! The vendor will be in touch within 24 hours.</div>}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 className="page-title">My Requests</h1>
            <p className="page-subtitle" style={{ marginBottom: 0 }}>Signed in as {session.user.name || session.user.email}</p>
          </div>
          <Link href="/post" className="btn btn-primary">+ Post a New Request</Link>
        </div>

        {!requests?.length ? (
          <div className="empty">
            <h3>No requests yet</h3>
            <p>Post your first request and get competing quotes in minutes.</p>
            <Link href="/post" className="btn btn-primary" style={{ marginTop: "1rem" }}>Post a Request</Link>
          </div>
        ) : (
          <div className="grid-cards">
            {(requests as Request[]).map(req => (
              <Link key={req.id} href={`/requests/${req.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="card request-card">
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                    <span className="badge" style={{ background: "#eff6ff", color: "#1e40af" }}>{req.category}</span>
                    <span className={`badge badge-${req.status}`}>{req.status}</span>
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 0.75rem" }}>{req.title}</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.875rem" }}>
                    <div style={{ background: "#f8fafc", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", textAlign: "center" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#2563eb" }}>{req.quote_count}</div>
                      <div style={{ color: "#6b7280", fontSize: "0.8rem" }}>Quote{req.quote_count !== 1 ? "s" : ""}</div>
                    </div>
                    <div style={{ background: "#f8fafc", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", textAlign: "center" }}>
                      <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#374151" }}>{req.location_area}</div>
                      <div style={{ color: "#6b7280", fontSize: "0.8rem" }}>Location</div>
                    </div>
                  </div>
                  {req.status === "open" && req.quote_count > 0 && (
                    <div style={{ marginTop: "1rem" }}>
                      <span className="btn btn-primary" style={{ fontSize: "0.875rem", padding: "0.5rem 1.25rem", width: "100%", justifyContent: "center" }}>
                        View {req.quote_count} Quote{req.quote_count !== 1 ? "s" : ""} →
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
