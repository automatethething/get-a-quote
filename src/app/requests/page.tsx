import Link from "next/link";
import { supabaseService } from "@/lib/supabase-server";
import { Request, CATEGORIES } from "@/lib/types";
import Nav from "@/components/Nav";

export const revalidate = 30;

export default async function RequestsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  
  let query = supabaseService
    .from("getaquote_requests")
    .select("id,category,title,description,location_area,budget_hint,timeline,status,quote_count,expires_at,created_at")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(60);

  if (category) query = query.eq("category", category);

  const { data: requests } = await query;

  return (
    <div>
      <Nav />
      <div className="page">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 className="page-title">Open Quote Requests</h1>
            <p className="page-subtitle" style={{ marginBottom: 0 }}>Browse what people need. Submit a quote to win the job.</p>
          </div>
          <Link href="/vendor/register" className="btn btn-primary">Become a Vendor →</Link>
        </div>

        {/* Category filter */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          <Link href="/requests" className={`badge ${!category ? "badge-matched" : ""}`} style={{ padding: "0.4rem 1rem", textDecoration: "none", background: !category ? "#dbeafe" : "#f3f4f6", color: !category ? "#1e40af" : "#6b7280", cursor: "pointer" }}>
            All
          </Link>
          {CATEGORIES.slice(0, 10).map(c => (
            <Link key={c} href={`/requests?category=${encodeURIComponent(c)}`}
              className="badge"
              style={{ padding: "0.4rem 1rem", textDecoration: "none", background: category === c ? "#dbeafe" : "#f3f4f6", color: category === c ? "#1e40af" : "#6b7280", cursor: "pointer" }}>
              {c}
            </Link>
          ))}
        </div>

        {!requests?.length ? (
          <div className="empty">
            <h3>No open requests {category ? `in ${category}` : "yet"}</h3>
            <p>Be the first! Post your service request and let vendors compete.</p>
            <Link href="/post" className="btn btn-primary" style={{ marginTop: "1rem" }}>Post a Request</Link>
          </div>
        ) : (
          <div className="grid-cards">
            {(requests as Request[]).map(req => (
              <Link key={req.id} href={`/requests/${req.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="card request-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <span className="badge" style={{ background: "#eff6ff", color: "#1e40af" }}>{req.category}</span>
                    <span style={{ fontSize: "0.8125rem", color: "#9ca3af" }}>
                      {req.quote_count} quote{req.quote_count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 0.5rem", lineHeight: 1.3 }}>{req.title}</h3>
                  <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0 0 1rem", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                    {req.description}
                  </p>
                  <div style={{ display: "flex", gap: "1rem", fontSize: "0.8125rem", color: "#9ca3af", flexWrap: "wrap" }}>
                    <span>📍 {req.location_area}</span>
                    {req.budget_hint && <span>💰 {req.budget_hint}</span>}
                    {req.timeline && <span>⏱ {req.timeline}</span>}
                  </div>
                  <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid #f3f4f6" }}>
                    <span className="btn btn-primary" style={{ fontSize: "0.875rem", padding: "0.5rem 1.25rem" }}>Submit a Quote →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
