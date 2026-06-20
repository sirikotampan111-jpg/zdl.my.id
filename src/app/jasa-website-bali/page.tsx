import type { Metadata } from "next";
import { CityPageClient } from "@/components/city-page";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zds.asia";

export const metadata: Metadata = {
  title: "Jasa Pembuatan Website Bali — Zheng Digital Studio | Terjamin & Anti-Scam",
  description:
    "Jasa pembuatan website profesional di Bali. Zheng Digital Studio — garansi uang kembali, anti-scam. Website villa, hospitality, kuliner & pariwisata mulai Rp600rb.",
  keywords: [
    "jasa pembuatan website Bali",
    "jasa website Bali",
    "web developer Bali",
    "website profesional Bali",
    "jasa website terpercaya Bali",
    "website villa Bali",
    "website hospitality Bali",
    "website pariwisata Bali",
    "Zheng Digital Studio Bali",
  ],
  alternates: { canonical: `${SITE_URL}/jasa-website-bali` },
  openGraph: {
    title: "Jasa Pembuatan Website Bali — Zheng Digital Studio",
    description: "Website profesional di Bali. Garansi uang kembali, anti-scam. Mulai Rp600rb.",
    url: `${SITE_URL}/jasa-website-bali`,
    type: "website",
    locale: "id_ID",
  },
};

export default function BaliPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", url: SITE_URL },
        { name: "Bali", url: `${SITE_URL}/jasa-website-bali` },
      ]} />
      <CityPageClient
        city="Bali"
        region="Bali & Nusa Tenggara"
        description="Zheng Digital Studio — jasa pembuatan website profesional di Bali. Garansi uang kembali, anti-scam, proses transparan. Website villa, hotel, kuliner & pariwisata mulai Rp600rb."
        longDescription={`Bali adalah destinasi wisata dunia yang membutuhkan standar digital internasional. Villa, hotel, restoran, dan bisnis hospitality di Bali tidak bisa lagi mengandalkan word-of-mouth saja — mereka butuh website yang mewah, cepat, dan mudah ditemukan di Google.

Zheng Digital Studio memahami standar tinggi yang dibutuhkan bisnis di Bali. Kami membangun website yang tidak cuma tampil cantik, tapi juga memiliki performa optimal, SEO-friendly, dan mobile-responsive — karena kebanyakan wisatawan mencari informasi dari smartphone mereka.

Yang paling penting: kami anti-scam. Banyak kasus di Bali di mana web developer asing maupun lokal menerima pembayaran lalu menghilang. Dengan Zheng Digital Studio, Anda mendapat garansi uang kembali dan proses yang transparan dari awal sampai akhir.`}
        portfolios={[]}
      />
    </>
  );
}
