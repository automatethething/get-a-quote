import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseService } from "@/lib/supabase-server";

function getStripe() { return new Stripe(process.env.STRIPE_SECRET_KEY!); }
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const matchId = session.metadata?.match_id;
    if (!matchId) return NextResponse.json({ ok: true });

    // Get the match
    const { data: match } = await supabaseService.from("getaquote_matches").select("*").eq("id", matchId).single();
    if (!match) return NextResponse.json({ ok: true });

    // Get user info for disclosure
    const { data: user } = await supabaseService.from("getaquote_users").select("name,email,phone").eq("id", match.user_id).single();

    // Get vendor email
    const { data: vendor } = await supabaseService.from("getaquote_vendors").select("contact_email,business_name").eq("id", match.vendor_id).single();

    // Mark match as paid + identity disclosed
    await supabaseService.from("getaquote_matches").update({
      payment_status: "paid",
      stripe_payment_intent: session.payment_intent as string,
      identity_disclosed_at: new Date().toISOString(),
    }).eq("id", matchId);

    // Mark request as matched
    await supabaseService.from("getaquote_requests").update({ status: "matched" }).eq("id", match.request_id);

    // Reject other pending quotes
    await supabaseService.from("getaquote_quotes")
      .update({ status: "rejected" })
      .eq("request_id", match.request_id)
      .neq("id", match.quote_id);

    // Send identity disclosure email to vendor
    if (vendor?.contact_email && user) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { data: request } = await supabaseService.from("getaquote_requests").select("title,description,location_area").eq("id", match.request_id).single();

        await resend.emails.send({
          from: process.env.EMAIL_FROM || "noreply@getaquote.app",
          to: vendor.contact_email,
          subject: `🎉 You won the job — Contact details inside`,
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Congratulations, ${vendor.business_name}!</h2>
              <p>The requester has chosen your quote and paid. Here are their contact details:</p>
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0;">
                <strong>Name:</strong> ${user.name}<br/>
                <strong>Email:</strong> <a href="mailto:${user.email}">${user.email}</a><br/>
                ${user.phone ? `<strong>Phone:</strong> ${user.phone}<br/>` : ""}
              </div>
              <p><strong>Job details:</strong><br/>${request?.title}<br/><em>${request?.location_area}</em></p>
              <p>Please reach out within 24 hours to confirm and arrange the work.</p>
              <hr/>
              <p style="color: #9ca3af; font-size: 0.875rem;">A platform commission of ${((match.commission_cents / match.total_cents) * 100).toFixed(0)}% has been retained. You will receive ${((match.total_cents - match.commission_cents) / 100).toFixed(2)} CAD via your agreed payment method.</p>
            </div>
          `,
        });
      } catch (e) {
        console.error("Email send failed:", e);
      }
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
            <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>You're all set!</h2>
              <p>Your payment was received. <strong>${vendor.business_name}</strong> now has your contact details and will reach out within 24 hours.</p>
              <p>If you don't hear from them, contact us at support@getaquote.app.</p>
              <p>Thank you for using GetAQuote.</p>
            </div>
          `,
        });
      } catch (e) {
        console.error("Email send failed:", e);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
