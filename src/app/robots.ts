import { MetadataRoute } from "next";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://getaquote.app";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: ["/", "/requests", "/requests/"], disallow: ["/dashboard", "/vendor/dashboard", "/api/"] }, sitemap: `${appUrl}/sitemap.xml` };
}
