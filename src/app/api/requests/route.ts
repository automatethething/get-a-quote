import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { normalizeLocationArea } from "@/lib/request-location";
import { supabaseService } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { category, title, description, location_area, budget_hint, timeline } = body;

  if (!category || !title || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Upsert user record
  await supabaseService.from("quoteveil_users").upsert({
    id: session.user.id,
    name: session.user.name || "Anonymous",
    email: session.user.email || "",
    updated_at: new Date().toISOString(),
  });

  const { data, error } = await supabaseService.from("quoteveil_requests").insert({
    user_id: session.user.id,
    category,
    title: title.trim(),
    description: description.trim(),
    location_area: normalizeLocationArea(location_area),
    budget_hint: budget_hint?.trim() || null,
    timeline: timeline?.trim() || null,
  }).select("id").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseService
    .from("quoteveil_requests")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
