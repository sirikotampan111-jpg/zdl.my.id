import type { Metadata } from "next";
import { CityPageClient } from "@/components/city-page";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zds.asia";

export const metadata: Metadata = {
  title: "Jasa Pembuatan Website Depok — Zheng Digital Studio | Terjamin & Anti-Scam",
  description:
    "Jasa pembuatan website profesional di Depok. Zheng Digital Studio — garansi uang kembali, anti-scam, proses transparan. Website UMKM, Properti, Kuliner & Pendidikan. Mulai Rp600rb.",
  keywords: [
    "jasa pembuatan website Depok",
    "jasa website Depok",
    "web developer Depok",
    "website profesional Depok",
    "jasa website terpercaya Depok",
    "website UMKM Depok",
    "website bisnis Depok",
    "Zheng Digital Studio Depok",
  ],
  alternates: {
    canonical: `${SITE_URL}/jasa-website-depok`,
  },
  openGraph: {
    title: "Jasa Pembuatan Website Depok — Zheng Digital Studio",
    description: "Website profesional di Depok. Garansi uang kembali, anti-scam. Mulai Rp600rb.",
    url: `${SITE_URL}/jasa-website-depok`,
    type: "website",
    locale: "id_ID",
  },
};

export default function DepokPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Depok", url: `${SITE_URL}/jasa-website-depok` },
        ]}
      />
      <CityPageClient
        city="Depok"
        region="Depok & Jabodetabek"
        description="Zheng Digital Studio — jasa pembuatan website profesional di Depok dan sekitarnya. Garansi uang kembali, anti-scam, proses transparan. Website UMKM, Properti, Kuliner & Pendidikan mulai Rp600rb."
        longDescription={`Depok adalah kota pendidikan dan bisnis yang terus berkembang di kawasan Jabodetabek. Dengan kehadiran universitas besar seperti UI dan UIN, serta pertumbuhan UMKM yang pesat, kebutuhan website profesional di Depok semakin meningkat setiap tahunnya.

Zheng Digital Studio hadir di Depok untuk membantu bisnis lokal memiliki website yang tidak cuma bagus, tapi juga terjamin pembuatannya. Kami tahu banyak pemilik bisnis yang ragu menggunakan jasa web developer karena takut ditipu — itulah mengapa kami memberikan garansi uang kembali dan proses yang transparan dari awal.

Dari kuliner di Margonda, properti di Cinere, hingga jasa pendidikan di sekitar kampus — kami siap membangun website yang modern, SEO-friendly, dan mudah ditemukan oleh calon pelanggan Anda di Google.`}
        portfolios={[]}
      />
    </>
  );
}
