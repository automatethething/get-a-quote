import { ImageResponse } from "next/og";
import { supabaseService } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const alt = "QuoteVeil request";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Params = Promise<{ id: string }>;

export default async function TwitterImage({ params }: { params: Params }) {
  const { id } = await params;
  const { data: request } = await supabaseService
    .from("quoteveil_requests")
    .select("title,category,location_area")
    .eq("id", id)
    .single();

  const title = request?.title ?? "QuoteVeil request";
  const category = request?.category ?? "Open request";
  const location = request?.location_area ?? "Remote / Online only";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          background: "linear-gradient(135deg, #0f172a, #1d4ed8)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 28, opacity: 0.95 }}>QuoteVeil</div>
          <div style={{ fontSize: 24, padding: "10px 18px", border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.1)" }}>
            {category}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.05 }}>{title}</div>
          <div style={{ fontSize: 32, opacity: 0.9 }}>📍 {location}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 30, opacity: 0.92 }}>Bid on this project in less than 3 minutes</div>
          <div style={{ fontSize: 24, padding: "14px 22px", background: "white", color: "#1d4ed8", fontWeight: 800 }}>
            Open request →
          </div>
        </div>
      </div>
    ),
    size,
  );
}
