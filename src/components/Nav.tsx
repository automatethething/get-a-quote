"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Nav() {
  const { data: session } = useSession();

  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">GetAQuote</Link>
      <div className="nav-links">
        <Link href="/requests" className="btn btn-ghost" style={{ fontSize: "0.9rem" }}>Browse Requests</Link>
        {session ? (
          <>
            <Link href="/dashboard" className="btn btn-ghost" style={{ fontSize: "0.9rem" }}>My Dashboard</Link>
            <Link href="/vendor/dashboard" className="btn btn-ghost" style={{ fontSize: "0.9rem" }}>Vendor</Link>
            <Link href="/post" className="btn btn-primary" style={{ fontSize: "0.9rem" }}>Post a Request</Link>
            <button className="btn btn-ghost" style={{ fontSize: "0.9rem" }} onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</button>
          </>
        ) : (
          <>
            <Link href="/vendor/register" className="btn btn-ghost" style={{ fontSize: "0.9rem" }}>Become a Vendor</Link>
            <Link href="/login" className="btn btn-outline" style={{ fontSize: "0.9rem" }}>Sign In</Link>
            <Link href="/post" className="btn btn-primary" style={{ fontSize: "0.9rem" }}>Post a Request</Link>
          </>
        )}
      </div>
    </nav>
  );
}
