import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zdl.my.id";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
      },
      {
        userAgent: "Bingbot",
        allow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
