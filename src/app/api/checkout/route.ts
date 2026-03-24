import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { supabaseService } from "@/lib/supabase-server";

function getStripe() { return new Stripe(process.env.STRIPE_SECRET_KEY!); }
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const COMMISSION_RATE = parseFloat(process.env.COMMISSION_RATE || "0.15");

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { quote_id, request_id } = await req.json();
  if (!quote_id || !request_id) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Verify ownership
  const { data: request } = await supabaseService.from("getaquote_requests").select("user_id,title,status").eq("id", request_id).single();
  if (!request || request.user_id !== session.user.id) return NextResponse.json({ error: "Not your request" }, { status: 403 });
  if (request.status !== "open") return NextResponse.json({ error: "Request already matched" }, { status: 400 });

  const { data: quote } = await supabaseService
    .from("getaquote_quotes")
    .select("*, vendor:getaquote_vendors(business_name,contact_email)")
    .eq("id", quote_id)
    .eq("request_id", request_id)
    .single();

  if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  if (quote.status !== "pending") return NextResponse.json({ error: "Quote no longer available" }, { status: 400 });

  const commissionCents = Math.round(quote.price_cents * COMMISSION_RATE);

  // Create match record (pending payment)
  const { data: match, error: matchErr } = await supabaseService.from("getaquote_matches").insert({
    request_id,
    quote_id,
    user_id: session.user.id,
    vendor_id: quote.vendor_id,
    total_cents: quote.price_cents,
    commission_cents: commissionCents,
    payment_status: "pending",
  }).select("id").single();

  if (matchErr) return NextResponse.json({ error: matchErr.message }, { status: 500 });

  const stripe = getStripe();
  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "cad",
        unit_amount: quote.price_cents,
        product_data: {
          name: `${request.title}`,
          description: `Service by ${quote.vendor?.business_name} · 15% platform fee included`,
        },
      },
      quantity: 1,
    }],
    success_url: `${appUrl}/dashboard?matched=true`,
    cancel_url: `${appUrl}/requests/${request_id}`,
    client_reference_id: match.id, // match ID for webhook
    metadata: {
      match_id: match.id,
      request_id,
      quote_id,
      user_id: session.user.id,
      vendor_id: quote.vendor_id,
    },
  });

  // Mark the quote as selected (optimistically — webhook confirms)
  await supabaseService.from("getaquote_quotes").update({ status: "selected" }).eq("id", quote_id);
  await supabaseService.from("getaquote_matches").update({ stripe_session_id: stripeSession.id }).eq("id", match.id);

  return NextResponse.json({ url: stripeSession.url });
}
