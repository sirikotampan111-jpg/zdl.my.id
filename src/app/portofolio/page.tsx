import type { Metadata } from "next";
import { PortfolioPageClient } from "@/components/client-pages";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zds.asia";

export const metadata: Metadata = {
  title: "Portofolio Website Profesional — Hasil Kerja Zheng Digital Studio",
  description:
    "Lihat hasil kerja Zheng Digital Studio: website properti, interior, kuliner, dan bisnis yang sudah online. Tampilan asli langsung dari tautan website klien kami.",
  keywords: [
    "portofolio website",
    "contoh website profesional",
    "website properti",
    "website interior",
    "website kuliner",
    "website bisnis",
    "hasil kerja web developer",
    "Zheng Digital Studio portofolio",
  ],
  alternates: {
    canonical: `${SITE_URL}/portofolio`,
  },
  openGraph: {
    title: "Portofolio Website Profesional — Zheng Digital Studio",
    description:
      "Lihat hasil kerja Zheng Digital Studio: website properti, interior, kuliner, dan bisnis yang sudah online.",
    url: `${SITE_URL}/portofolio`,
    type: "website",
    locale: "id_ID",
  },
};

export default function PortfolioPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Portofolio", url: `${SITE_URL}/portofolio` },
        ]}
      />
      <PortfolioPageClient />
    </>
  );
}
