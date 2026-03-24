import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseService } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { request_id, price_cents, timeline, notes, questions } = body;

  if (!request_id || !price_cents || price_cents < 100) {
    return NextResponse.json({ error: "Invalid quote data" }, { status: 400 });
  }

  // Check vendor profile exists
  const { data: vendor } = await supabaseService.from("quoteveil_vendors").select("id").eq("id", session.user.id).single();
  if (!vendor) {
    return NextResponse.json({ error: "You must register as a vendor before submitting quotes. Go to /vendor/register" }, { status: 403 });
  }

  // Check request is open
  const { data: request } = await supabaseService.from("quoteveil_requests").select("user_id,status").eq("id", request_id).single();
  if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });
  if (request.status !== "open") return NextResponse.json({ error: "This request is no longer accepting quotes" }, { status: 400 });
  if (request.user_id === session.user.id) return NextResponse.json({ error: "You cannot quote your own request" }, { status: 400 });

  // Check not already quoted
  const { data: existing } = await supabaseService.from("quoteveil_quotes").select("id").eq("request_id", request_id).eq("vendor_id", session.user.id).single();
  if (existing) return NextResponse.json({ error: "You have already submitted a quote on this request" }, { status: 400 });

  const { data, error } = await supabaseService.from("quoteveil_quotes").insert({
    request_id,
    vendor_id: session.user.id,
    price_cents: Math.round(price_cents),
    timeline: timeline?.trim() || null,
    notes: notes?.trim() || null,
    questions: questions?.trim() || null,
  }).select("id").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabaseService
    .from("quoteveil_quotes")
    .select("*, request:quoteveil_requests(title,category,location_area,status)")
    .eq("vendor_id", session.user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json(data || []);
}
