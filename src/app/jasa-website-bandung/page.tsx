import type { Metadata } from "next";
import { CityPageClient } from "@/components/city-page";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zdl.my.id";

export const metadata: Metadata = {
  title: "Jasa Pembuatan Website Bandung — Zheng Digital Lab | Terjamin & Anti-Scam",
  description:
    "Jasa pembuatan website profesional di Bandung. Zheng Digital Lab — garansi uang kembali, anti-scam, proses transparan. Website UMKM, Properti, Kuliner & Pendidikan. Mulai Rp600rb.",
  keywords: [
    "jasa pembuatan website Bandung",
    "jasa website Bandung",
    "web developer Bandung",
    "website profesional Bandung",
    "jasa website terpercaya Bandung",
    "website UMKM Bandung",
    "website bisnis Bandung",
    "website kuliner Bandung",
    "website fashion Bandung",
    "Zheng Digital Lab Bandung",
  ],
  alternates: {
    canonical: `${SITE_URL}/jasa-website-bandung`,
  },
  openGraph: {
    title: "Jasa Pembuatan Website Bandung — Zheng Digital Lab",
    description: "Website profesional di Bandung. Garansi uang kembali, anti-scam. Mulai Rp600rb.",
    url: `${SITE_URL}/jasa-website-bandung`,
    type: "website",
    locale: "id_ID",
  },
};

export default function BandungPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Bandung", url: `${SITE_URL}/jasa-website-bandung` },
        ]}
      />
      <CityPageClient
        city="Bandung"
        region="Bandung & Jawa Barat"
        description="Zheng Digital Lab — jasa pembuatan website profesional di Bandung dan Jawa Barat. Garansi uang kembali, anti-scam, proses transparan. Website UMKM, Properti, Kuliner & Pendidikan mulai Rp600rb."
        longDescription={`Bandung adalah kota kreatif dengan ekosistem bisnis yang terus berkembang — dari fashion, kuliner, wisata, hingga teknologi. Sebagai salah satu kota dengan pertumbuhan startup tertinggi di Indonesia, kebutuhan website profesional di Bandung sangat besar. Tapi sayangnya, banyak bisnis yang terjebak oleh web developer abal-abal.

Zheng Digital Lab hadir untuk memberikan solusi yang berbeda. Kami bukan sekadar jasa website — kami adalah partner digital yang bisa Anda percaya. Dengan garansi uang kembali, proses transparan, dan DP ringan, kami membuktikan bahwa jasa pembuatan website bisa dilakukan dengan jujur dan profesional.

Dari distro di Dago, kafe di Braga, hingga UMKM kreatif di Cimahi — kami siap membangun website yang modern, SEO-friendly, dan membantu bisnis Anda bersaing di dunia digital. Karena di Bandung, kreativitas butuh platform digital yang setara kualitasnya.`}
        portfolios={[]}
      />
    </>
  );
}
