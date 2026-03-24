import { ImageResponse } from "next/og";
export const runtime = "edge";
export const alt = "QuoteVeil";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    <div style={{ background: "linear-gradient(135deg, #1e40af, #3b82f6)", width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ fontSize: 72, fontWeight: 900, marginBottom: 24, textAlign: "center", lineHeight: 1.1 }}>QuoteVeil</div>
      <div style={{ fontSize: 32, opacity: 0.9, textAlign: "center", maxWidth: 800 }}>Get competing quotes — without giving out your number</div>
      <div style={{ marginTop: 40, background: "rgba(255,255,255,0.15)", padding: "12px 32px", borderRadius: 9999, fontSize: 22 }}>🔒 Anonymous until you choose</div>
    </div>
  );
}
