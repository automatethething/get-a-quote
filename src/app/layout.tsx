import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://getaquote.app";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: "Get a Quote", template: "%s | Get a Quote" },
  description: "Post what you need. Vendors compete. Your identity stays private until you choose who to hire.",
  applicationName: "Get a Quote",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: appUrl,
    siteName: "Get a Quote",
    title: "Get competing quotes — without giving out your number",
    description: "Post what you need. Vendors compete. Your identity stays private until you choose who to hire.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Get a Quote" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Get competing quotes — without giving out your number",
    description: "Post what you need. Vendors compete. Your identity stays private until you choose who to hire.",
    images: ["/twitter-image"],
  },
  icons: { icon: "/favicon.ico", shortcut: "/favicon.ico", apple: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased"><Providers>{children}</Providers></body>
    </html>
  );
}
