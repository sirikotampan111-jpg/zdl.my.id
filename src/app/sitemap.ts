import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zdl.my.id";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/portofolio`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/layanan`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kontak`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.2,
    },
  ];

  return staticPages;
}
