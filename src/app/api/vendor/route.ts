import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseService } from "@/lib/supabase-server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data } = await supabaseService.from("quoteveil_vendors").select("*").eq("id", session.user.id).single();
  return NextResponse.json(data || null);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { business_name, category, description, contact_email, contact_phone, location_area } = body;
  if (!business_name || !category || !contact_email) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  // Upsert user record first
  await supabaseService.from("quoteveil_users").upsert({
    id: session.user.id,
    name: session.user.name || "User",
    email: session.user.email || contact_email,
    updated_at: new Date().toISOString(),
  });

  const { data, error } = await supabaseService.from("quoteveil_vendors").upsert({
    id: session.user.id,
    business_name: business_name.trim(),
    category,
    description: description?.trim() || null,
    contact_email: contact_email.trim(),
    contact_phone: contact_phone?.trim() || null,
    location_area: location_area?.trim() || null,
    updated_at: new Date().toISOString(),
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
