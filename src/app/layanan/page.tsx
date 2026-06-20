import type { Metadata } from "next";
import { LayananPageClient } from "@/components/client-pages";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zds.asia";

export const metadata: Metadata = {
  title: "Paket Layanan Website — HTML, Next.js, Admin Panel & SEO",
  description:
    "Pilih paket website dari Zheng Digital Studio: Landing Page HTML mulai Rp600rb, Website Next.js mulai Rp1.5jt, Admin Panel, SEO + 4 Backlink Medium. Domain & hosting included.",
  keywords: [
    "paket website",
    "harga website",
    "jasa website murah",
    "website HTML",
    "website Next.js",
    "admin panel website",
    "SEO website",
    "backlink medium",
    "pembuatan website Indonesia",
    "Zheng Digital Studio layanan",
  ],
  alternates: {
    canonical: `${SITE_URL}/layanan`,
  },
  openGraph: {
    title: "Paket Layanan Website — Zheng Digital Studio",
    description:
      "Pilih paket website: HTML mulai Rp600rb, Next.js mulai Rp1.5jt, Admin Panel, SEO + 4 Backlink Medium. Domain & hosting included.",
    url: `${SITE_URL}/layanan`,
    type: "website",
    locale: "id_ID",
  },
};

export default function LayananPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Layanan", url: `${SITE_URL}/layanan` },
        ]}
      />
      <LayananPageClient />
    </>
  );
}
