import Link from "next/link";
import AuthActionButton from "@/components/AuthActionButton";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div>
      {/* Nav */}
      <nav className="nav">
        <a href="/" className="nav-logo">QuoteVeil</a>
        <div className="nav-links">
          <Link href="/requests" className="btn btn-ghost">Browse Requests</Link>
          {session ? (
            <>
              <Link href="/dashboard" className="btn btn-ghost">My Dashboard</Link>
              <Link href="/post" className="btn btn-primary">Post a Request</Link>
            </>
          ) : (
            <>
              <AuthActionButton callbackUrl="/dashboard" className="btn btn-ghost">Sign In</AuthActionButton>
              <AuthActionButton callbackUrl="/post" className="btn btn-primary">Post a Request</AuthActionButton>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)", color: "white", padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: 740, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.15)", padding: "0.3rem 1rem", borderRadius: "9999px", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            🔒 Your identity stays private until you choose
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 1.25rem" }}>
            Get competing quotes —<br />without giving out your number
          </h1>
          <p style={{ fontSize: "1.25rem", opacity: 0.9, margin: "0 0 2.5rem", lineHeight: 1.6 }}>
            Post what you need. Vendors compete. Your name, email, and phone stay hidden until you pick a quote and pay. No spam. No pressure.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            {session ? (
              <Link href="/post" className="btn btn-primary" style={{ fontSize: "1.0625rem", padding: "0.875rem 2rem", background: "white", color: "#1e40af" }}>
                Post a Request — It&apos;s Free
              </Link>
            ) : (
              <AuthActionButton callbackUrl="/post" className="btn btn-primary" style={{ fontSize: "1.0625rem", padding: "0.875rem 2rem", background: "white", color: "#1e40af" }}>
                Post a Request — It&apos;s Free
              </AuthActionButton>
            )}
            <Link href="/requests" className="btn" style={{ fontSize: "1.0625rem", padding: "0.875rem 2rem", background: "rgba(255,255,255,0.15)", color: "white", border: "1.5px solid rgba(255,255,255,0.4)" }}>
              Browse Open Requests
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "5rem 1.5rem", background: "white" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "1.875rem", fontWeight: 800, marginBottom: "0.5rem" }}>How it works</h2>
          <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "3.5rem" }}>Two minutes to post. Vendors find you. Pay when you&apos;re ready.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem" }}>
            {[
              { n: "1", icon: "📝", title: "Post your request", desc: "Describe what you need, your rough area, and timeline. No personal details required." },
              { n: "2", icon: "💬", title: "Vendors quote you", desc: "Local vendors and freelancers browse open requests and submit competitive quotes." },
              { n: "3", icon: "🔍", title: "Compare and choose", desc: "Review all quotes side by side. Ask follow-up questions. Pick the best fit." },
              { n: "4", icon: "💳", title: "Pay to connect", desc: "When you pay, your contact info goes to the vendor you chose — and only them." },
            ].map(s => (
              <div key={s.n} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>{s.icon}</div>
                <div style={{ fontWeight: 800, fontSize: "1.0625rem", marginBottom: "0.5rem" }}>{s.title}</div>
                <p style={{ color: "#6b7280", fontSize: "0.9375rem", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why different */}
      <section style={{ padding: "4rem 1.5rem", background: "#f8fafc" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.625rem", fontWeight: 800, marginBottom: "1.5rem", textAlign: "center" }}>Not another lead-selling machine</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div className="card" style={{ borderColor: "#fecaca" }}>
              <div style={{ fontWeight: 700, color: "#991b1b", marginBottom: "1rem" }}>❌ Old way (Thumbtack, Angi)</div>
              {["Your phone number sold to every vendor who pays", "11 texts in 90 minutes, win or lose", "Vendors pay for leads whether they win or not", "You become the product"].map(t => (
                <div key={t} style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "0.5rem" }}>• {t}</div>
              ))}
            </div>
            <div className="card" style={{ borderColor: "#bbf7d0" }}>
              <div style={{ fontWeight: 700, color: "#166534", marginBottom: "1rem" }}>✅ QuoteVeil</div>
              {["Identity hidden until you choose", "Zero spam — vendors can't contact you until you pay", "Vendors only pay when they win", "You stay in control"].map(t => (
                <div key={t} style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "0.5rem" }}>• {t}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "5rem 1.5rem", background: "#1e40af", color: "white", textAlign: "center" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 800, margin: "0 0 1rem" }}>Ready to get competing quotes?</h2>
        <p style={{ opacity: 0.85, marginBottom: "2rem", fontSize: "1.125rem" }}>Free to post. Pay only when you pick a vendor.</p>
        {session ? (
          <Link href="/post" className="btn" style={{ background: "white", color: "#1e40af", fontSize: "1.0625rem", padding: "0.875rem 2.5rem" }}>
            Post Your Request Now
          </Link>
        ) : (
          <AuthActionButton callbackUrl="/post" className="btn" style={{ background: "white", color: "#1e40af", fontSize: "1.0625rem", padding: "0.875rem 2.5rem" }}>
            Post Your Request Now
          </AuthActionButton>
        )}
      </section>

      {/* Footer */}
      <footer style={{ background: "white", borderTop: "1px solid #e5e7eb", padding: "2rem 1.5rem", textAlign: "center", fontSize: "0.875rem", color: "#9ca3af" }}>
        <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginBottom: "0.75rem" }}>
          <Link href="/terms" style={{ color: "#9ca3af", textDecoration: "none" }}>Terms</Link>
          <Link href="/privacy" style={{ color: "#9ca3af", textDecoration: "none" }}>Privacy</Link>
          <Link href="/requests" style={{ color: "#9ca3af", textDecoration: "none" }}>Browse Requests</Link>
          <Link href="/vendor/register" style={{ color: "#9ca3af", textDecoration: "none" }}>Become a Vendor</Link>
        </div>
        © {new Date().getFullYear()} QuoteVeil. Commission charged at match time.
      </footer>
    </div>
  );
}
