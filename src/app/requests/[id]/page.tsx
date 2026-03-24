import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildRequestShareText, truncateDescription } from "@/lib/request-discovery";
import { supabaseService } from "@/lib/supabase-server";
import { Request, Quote, Vendor, formatPrice } from "@/lib/types";
import Nav from "@/components/Nav";
import AuthActionButton from "@/components/AuthActionButton";
import RequestShareButtons from "@/components/RequestShareButtons";
import QuoteForm from "./QuoteForm";
import SelectQuote from "./SelectQuote";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://quoteveil.com";

type Params = Promise<{ id: string }>;

async function getRequestOrNull(id: string) {
  const { data } = await supabaseService
    .from("getaquote_requests")
    .select("*")
    .eq("id", id)
    .single();

  return data as Request | null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const request = await getRequestOrNull(id);

  if (!request) {
    return {
      title: "Request not found | QuoteVeil",
    };
  }

  const title = `${request.title} | QuoteVeil`;
  const description = `${request.category} · ${request.location_area} · ${truncateDescription(request.description, 140)} · Bid on this project in less than 3 minutes.`;
  const url = `${appUrl}/requests/${request.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: [{ url: `/requests/${request.id}/opengraph-image`, width: 1200, height: 630, alt: request.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/requests/${request.id}/twitter-image`],
    },
  };
}

export default async function RequestPage({ params }: { params: Params }) {
  const { id } = await params;
  const session = await auth();

  const request = await getRequestOrNull(id);
  if (!request) notFound();

  const [{ data: quotes }, { data: vendorProfile }] = await Promise.all([
    supabaseService
      .from("getaquote_quotes")
      .select("*, vendor:getaquote_vendors(business_name,category,description,location_area,verified)")
      .eq("request_id", id)
      .order("created_at", { ascending: true }),
    session?.user?.id
      ? supabaseService.from("getaquote_vendors").select("id").eq("id", session.user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const isOwner = session?.user?.id === request.user_id;
  const isVendor = Boolean(vendorProfile?.id);
  const hasQuoted = quotes?.some((q: Quote) => q.vendor_id === session?.user?.id);
  const requestUrl = `${appUrl}/requests/${request.id}`;
  const shareText = buildRequestShareText(request);

  return (
    <div>
      <Nav />
      <div className="page" style={{ maxWidth: 820 }}>
        <div className="card" style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
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

          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #f3f4f6" }}>
            <RequestShareButtons url={requestUrl} title={request.title} shareText={shareText} />
          </div>

          {isOwner && (
            <div className="alert alert-info" style={{ marginTop: "1rem", marginBottom: 0 }}>
              🔒 You are the requester. Vendors cannot see your identity until you select a quote and pay.
            </div>
          )}
        </div>

        {!isOwner && request.status === "open" && (
          <div className="card" style={{ marginBottom: "1.5rem", background: "#eff6ff", borderColor: "#bfdbfe" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "1.125rem", fontWeight: 800, marginBottom: "0.25rem" }}>
                  Bid on this project in less than 3 minutes
                </div>
                <div style={{ color: "#4b5563", fontSize: "0.9375rem" }}>
                  Get in front of a motivated buyer. You only pay if they choose you.
                </div>
              </div>
              {!session ? (
                <AuthActionButton callbackUrl={`/requests/${request.id}`} className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>
                  Bid on this project
                </AuthActionButton>
              ) : hasQuoted ? (
                <Link href="/vendor/dashboard" className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>
                  View your quote
                </Link>
              ) : isVendor ? (
                <a href="#quote-form" className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>
                  Submit your quote
                </a>
              ) : (
                <Link href={`/vendor/register?next=${encodeURIComponent(`/requests/${request.id}`)}`} className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>
                  Become a vendor to bid
                </Link>
              )}
            </div>
          </div>
        )}

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

        {!isOwner && request.status === "open" && (
          <div id="quote-form">
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
              {hasQuoted ? "Your Quote" : isVendor ? "Submit a Quote" : "Become a Vendor to Quote"}
            </h2>
            {hasQuoted ? (
              <div className="card">
                <div className="alert alert-success" style={{ marginBottom: 0 }}>
                  ✓ You have already submitted a quote on this request. The requester will be in touch if they choose you.
                </div>
              </div>
            ) : isVendor ? (
              <QuoteForm requestId={request.id} />
            ) : session ? (
              <div className="card">
                <div className="alert alert-info" style={{ marginBottom: "1rem" }}>
                  Create your vendor profile first, then you can bid immediately on this request.
                </div>
                <Link href={`/vendor/register?next=${encodeURIComponent(`/requests/${request.id}`)}`} className="btn btn-primary">
                  Become a Vendor to Bid
                </Link>
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
