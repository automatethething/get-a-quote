import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase-server";
import { verifyWebhookSignature, PayRailsWebhookPayload } from "@/lib/payrails";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sigHeader = req.headers.get("x-payrails-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, sigHeader)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as PayRailsWebhookPayload;

  // Idempotency: skip if already processed
  const { data: existing } = await supabaseService
    .from("getaquote_matches")
    .select("id,payment_status")
    .eq("vendor_tx_id", payload.vendor_tx_id)
    .single();

  if (!existing) return NextResponse.json({ ok: true }); // unknown tx, ignore

  if (payload.event === "payment.completed") {
    if (existing.payment_status === "paid") return NextResponse.json({ ok: true }); // already processed

    // Get match details for disclosure
    const { data: match } = await supabaseService
      .from("getaquote_matches")
      .select("*")
      .eq("vendor_tx_id", payload.vendor_tx_id)
      .single();
    if (!match) return NextResponse.json({ ok: true });

    // Fetch user (for identity disclosure) and vendor (for email)
    const [{ data: user }, { data: vendor }, { data: request }] = await Promise.all([
      supabaseService.from("getaquote_users").select("name,email,phone").eq("id", match.user_id).single(),
      supabaseService.from("getaquote_vendors").select("contact_email,business_name").eq("id", match.vendor_id).single(),
      supabaseService.from("getaquote_requests").select("title,location_area").eq("id", match.request_id).single(),
    ]);

    // Mark paid and disclose identity
    await supabaseService.from("getaquote_matches").update({
      payment_status: "paid",
      entitlement_token: payload.entitlement_token,
      identity_disclosed_at: new Date().toISOString(),
    }).eq("vendor_tx_id", payload.vendor_tx_id);

    // Mark request as matched, reject other quotes
    await supabaseService.from("getaquote_requests").update({ status: "matched" }).eq("id", match.request_id);
    await supabaseService.from("getaquote_quotes")
      .update({ status: "rejected" })
      .eq("request_id", match.request_id)
      .neq("id", match.quote_id);

    // Send identity disclosure email to vendor
    if (vendor?.contact_email && user) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "noreply@getaquote.app",
          to: vendor.contact_email,
          subject: `🎉 You won the job — Contact details inside`,
          html: `
            <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
              <h2>Congratulations, ${vendor.business_name}!</h2>
              <p>The requester has chosen your quote and paid. Here are their contact details:</p>
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:1.5rem;margin:1.5rem 0">
                <strong>Name:</strong> ${user.name}<br/>
                <strong>Email:</strong> <a href="mailto:${user.email}">${user.email}</a><br/>
                ${user.phone ? `<strong>Phone:</strong> ${user.phone}<br/>` : ""}
              </div>
              <p><strong>Job:</strong> ${request?.title} · ${request?.location_area}</p>
              <p>Please reach out within 24 hours to confirm and arrange the work.</p>
              <hr/>
              <p style="color:#9ca3af;font-size:.875rem">Platform commission: ${Math.round((match.commission_cents / match.total_cents) * 100)}% retained. GetAQuote — getaquote.app</p>
            </div>`,
        });
      } catch (e) { console.error("Vendor email failed:", e); }
    }

    // Confirmation email to user
    if (user?.email && vendor) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "noreply@getaquote.app",
          to: user.email,
          subject: `Payment confirmed — ${vendor.business_name} will be in touch`,
          html: `
            <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
              <h2>You're all set!</h2>
              <p><strong>${vendor.business_name}</strong> now has your contact details and will reach out within 24 hours.</p>
              <p>Questions? Email <a href="mailto:support@getaquote.app">support@getaquote.app</a></p>
            </div>`,
        });
      } catch (e) { console.error("User email failed:", e); }
    }
  }

  if (payload.event === "payment.refunded") {
    await supabaseService.from("getaquote_matches").update({ payment_status: "refunded" })
      .eq("vendor_tx_id", payload.vendor_tx_id);
  }

  return NextResponse.json({ ok: true });
}
