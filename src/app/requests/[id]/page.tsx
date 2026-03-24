import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { supabaseService } from "@/lib/supabase-server";
import { Request, Quote, Vendor, formatPrice } from "@/lib/types";
import Nav from "@/components/Nav";
import QuoteForm from "./QuoteForm";
import SelectQuote from "./SelectQuote";

export default async function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const { data: req } = await supabaseService
    .from("quoteveil_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (!req) notFound();

  const { data: quotes } = await supabaseService
    .from("quoteveil_quotes")
    .select("*, vendor:quoteveil_vendors(business_name,category,description,location_area,verified)")
    .eq("request_id", id)
    .order("created_at", { ascending: true });

  const isOwner = session?.user?.id === (req as Request).user_id;
  const isVendor = !isOwner; // simplistic — we'll check vendor profile in the form
  const hasQuoted = quotes?.some((q: Quote) => q.vendor_id === session?.user?.id);

  const request = req as Request;

  return (
    <div>
      <Nav />
      <div className="page" style={{ maxWidth: 820 }}>

        {/* Request details */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <span className="badge" style={{ background: "#eff6ff", color: "#1e40af", marginBottom: "0.5rem", display: "inline-block" }}>{request.category}</span>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 0.25rem" }}>{request.title}</h1>
            </div>
            <span className={`badge badge-${request.status}`}>{request.status}</span>
          </div>

          <p style={{ color: "#374151", lineHeight: 1.7, marginBottom: "1.25rem", fontSize: "1rem" }}>{request.description}</p>

          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.9rem", color: "#6b7280", paddingTop: "1rem", borderTop: "1px solid #f3f4f6" }}>
            <span>📍 {request.location_area}</span>
            {request.budget_hint && <span>💰 Budget: {request.budget_hint}</span>}
            {request.timeline && <span>⏱ {request.timeline}</span>}
            <span>💬 {request.quote_count} quote{request.quote_count !== 1 ? "s" : ""} received</span>
            <span>📅 Posted {new Date(request.created_at).toLocaleDateString()}</span>
          </div>

          {isOwner && (
            <div className="alert alert-info" style={{ marginTop: "1rem", marginBottom: 0 }}>
              🔒 You are the requester. Vendors cannot see your identity until you select a quote and pay.
            </div>
          )}
        </div>

        {/* Quotes section */}
        {isOwner && (
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
              Quotes received ({quotes?.length || 0})
            </h2>
            {!quotes?.length ? (
              <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>⏳</div>
                <p style={{ color: "#6b7280" }}>No quotes yet. Vendors will see your request and respond soon.</p>
              </div>
            ) : (
              <div>
                {quotes.map((q: Quote & { vendor: Vendor }) => (
                  <div key={q.id} className={`quote-row ${q.status === "selected" ? "selected" : ""}`}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "1.0625rem" }}>{q.vendor?.business_name}</div>
                        <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                          {q.vendor?.category} · {q.vendor?.location_area}
                          {q.vendor?.verified && " ✓ Verified"}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111" }}>{formatPrice(q.price_cents)}</div>
                        {q.timeline && <div style={{ fontSize: "0.8125rem", color: "#6b7280" }}>{q.timeline}</div>}
                      </div>
                    </div>
                    {q.notes && <p style={{ margin: "0.75rem 0 0", color: "#374151", fontSize: "0.9375rem", lineHeight: 1.6 }}>{q.notes}</p>}
                    {q.questions && <p style={{ margin: "0.5rem 0 0", color: "#6b7280", fontSize: "0.875rem", fontStyle: "italic" }}>Questions: {q.questions}</p>}
                    {request.status === "open" && q.status === "pending" && (
                      <SelectQuote quoteId={q.id} requestId={request.id} vendorName={q.vendor?.business_name} priceCents={q.price_cents} />
                    )}
                    {q.status === "selected" && (
                      <div className="badge badge-matched" style={{ marginTop: "0.75rem" }}>✓ Selected — Awaiting payment</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Vendor quote form */}
        {!isOwner && request.status === "open" && (
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
              {hasQuoted ? "Your Quote" : "Submit a Quote"}
            </h2>
            {hasQuoted ? (
              <div className="card">
                <div className="alert alert-success" style={{ marginBottom: 0 }}>
                  ✓ You have already submitted a quote on this request. The requester will be in touch if they choose you.
                </div>
              </div>
            ) : (
              <QuoteForm requestId={request.id} />
            )}
          </div>
        )}

        {!isOwner && request.status !== "open" && (
          <div className="card">
            <div className="alert alert-info" style={{ marginBottom: 0 }}>
              This request has been {request.status} and is no longer accepting quotes.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
