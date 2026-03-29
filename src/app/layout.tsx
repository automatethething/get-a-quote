import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Providers from "@/components/Providers";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://quoteveil.com";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: "QuoteVeil", template: "%s | QuoteVeil" },
  description: "Post what you need. Vendors compete. Your identity stays private until you choose who to hire.",
  applicationName: "QuoteVeil",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: appUrl,
    siteName: "QuoteVeil",
    title: "Get competing quotes — without giving out your number",
    description: "Post what you need. Vendors compete. Your identity stays private until you choose who to hire.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "QuoteVeil" }],
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
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Script id="posthog-init" strategy="afterInteractive">{`!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]);t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src='https://logs.petrichorlabs.ca/static/array.js',(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people"},o="init capture register unregister identify alias people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing reloadFeatureFlags onFeatureFlags getFeatureFlag getFeatureFlagPayload isFeatureEnabled".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);posthog.init('phc_OFTq4aRvvH1wDSKqHmDfqTBN8fbq3z99BKzUQbltkqB',{api_host:'https://logs.petrichorlabs.ca',capture_pageview:true,capture_pageleave:true});`}</Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
