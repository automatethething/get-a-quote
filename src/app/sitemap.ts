import { MetadataRoute } from "next";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://quoteveil.app";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: appUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${appUrl}/requests`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${appUrl}/post`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${appUrl}/vendor/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${appUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${appUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
