import type { Metadata } from "next";
import { CityPageClient } from "@/components/city-page";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zds.asia";

export const metadata: Metadata = {
  title: "Jasa Pembuatan Website Gresik — Zheng Digital Studio | Terjamin & Anti-Scam",
  description:
    "Jasa pembuatan website profesional di Gresik. Zheng Digital Studio — garansi uang kembali, anti-scam. Website UMKM & Bisnis mulai Rp600rb.",
  keywords: [
    "jasa pembuatan website Gresik",
    "jasa website Gresik",
    "web developer Gresik",
    "website profesional Gresik",
    "jasa website terpercaya Gresik",
    "website UMKM Gresik",
    "Zheng Digital Studio Gresik",
  ],
  alternates: { canonical: `${SITE_URL}/jasa-website-gresik` },
  openGraph: {
    title: "Jasa Pembuatan Website Gresik — Zheng Digital Studio",
    description: "Website profesional di Gresik. Garansi uang kembali, anti-scam. Mulai Rp600rb.",
    url: `${SITE_URL}/jasa-website-gresik`,
    type: "website",
    locale: "id_ID",
  },
};

export default function GresikPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", url: SITE_URL },
        { name: "Gresik", url: `${SITE_URL}/jasa-website-gresik` },
      ]} />
      <CityPageClient
        city="Gresik"
        region="Gresik & Jawa Timur"
        description="Zheng Digital Studio — jasa pembuatan website profesional di Gresik. Garansi uang kembali, anti-scam, proses transparan. Mulai Rp600rb."
        longDescription={`Gresik dikenal sebagai kota industri dengan potensi UMKM yang luar biasa. Dari home industry hingga pabrik skala besar, bisnis di Gresik membutuhkan kehadiran digital yang kuat untuk menjangkau pasar yang lebih luas.

Zheng Digital Studio memahami kebutuhan unik bisnis Gresik. Kami tidak cuma bikin website — kami bangun fondasi digital yang membuat bisnis Anda mudah ditemukan di Google, terlihat profesional di mata calon pelanggan, dan yang terpenting: dikerjakan oleh web developer yang bisa dipercaya.

Dengan garansi uang kembali dan proses yang transparan, Anda tidak perlu lagi khawatir ditipu. DP ringan mulai Rp500rb, sisa bayar setelah website jadi dan Anda puas.`}
        portfolios={[]}
      />
    </>
  );
}
