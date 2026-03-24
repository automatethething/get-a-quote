import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { supabaseService } from "@/lib/supabase-server";
import { createCheckout } from "@/lib/payrails";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const COMMISSION_RATE = parseFloat(process.env.COMMISSION_RATE || "0.15");

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { quote_id, request_id } = await req.json();
  if (!quote_id || !request_id) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Verify the user owns this request
  const { data: request } = await supabaseService
    .from("getaquote_requests")
    .select("user_id,title,status")
    .eq("id", request_id)
    .single();
  if (!request || request.user_id !== session.user.id)
    return NextResponse.json({ error: "Not your request" }, { status: 403 });
  if (request.status !== "open")
    return NextResponse.json({ error: "Request already matched" }, { status: 400 });

  const { data: quote } = await supabaseService
    .from("getaquote_quotes")
    .select("*, vendor:getaquote_vendors(business_name,contact_email)")
    .eq("id", quote_id)
    .eq("request_id", request_id)
    .single();

  if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  if (quote.status !== "pending")
    return NextResponse.json({ error: "Quote no longer available" }, { status: 400 });

  const commissionCents = Math.round(quote.price_cents * COMMISSION_RATE);
  const vendorTxId = randomUUID();

  // Persist match before calling PayRails
  const { data: match, error: matchErr } = await supabaseService
    .from("getaquote_matches")
    .insert({
      request_id,
      quote_id,
      user_id: session.user.id,
      vendor_id: quote.vendor_id,
      total_cents: quote.price_cents,
      commission_cents: commissionCents,
      payment_status: "pending",
      vendor_tx_id: vendorTxId,
    })
    .select("id")
    .single();

  if (matchErr) return NextResponse.json({ error: matchErr.message }, { status: 500 });

  // Mark quote as selected optimistically
  await supabaseService.from("getaquote_quotes").update({ status: "selected" }).eq("id", quote_id);

  try {
    const checkoutUrl = await createCheckout(
      vendorTxId,
      quote.price_cents,
      `${appUrl}/dashboard?matched=true`,
      `${appUrl}/requests/${request_id}`,
    );
    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    // Roll back optimistic quote status on PayRails failure
    await supabaseService.from("getaquote_quotes").update({ status: "pending" }).eq("id", quote_id);
    await supabaseService.from("getaquote_matches").delete().eq("id", match.id);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Payment init failed" }, { status: 500 });
  }
}
