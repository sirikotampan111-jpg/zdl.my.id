import type { Metadata } from "next";
import { CityPageClient } from "@/components/city-page";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zdl.my.id";

export const metadata: Metadata = {
  title: "Jasa Pembuatan Website Bekasi — Zheng Digital Lab | Terjamin & Anti-Scam",
  description:
    "Jasa pembuatan website profesional di Bekasi. Zheng Digital Lab — garansi uang kembali, anti-scam, proses transparan. Website UMKM, Properti, Kuliner & Pendidikan. Mulai Rp600rb.",
  keywords: [
    "jasa pembuatan website Bekasi",
    "jasa website Bekasi",
    "web developer Bekasi",
    "website profesional Bekasi",
    "jasa website terpercaya Bekasi",
    "website UMKM Bekasi",
    "website bisnis Bekasi",
    "Zheng Digital Lab Bekasi",
  ],
  alternates: {
    canonical: `${SITE_URL}/jasa-website-bekasi`,
  },
  openGraph: {
    title: "Jasa Pembuatan Website Bekasi — Zheng Digital Lab",
    description: "Website profesional di Bekasi. Garansi uang kembali, anti-scam. Mulai Rp600rb.",
    url: `${SITE_URL}/jasa-website-bekasi`,
    type: "website",
    locale: "id_ID",
  },
};

export default function BekasiPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Bekasi", url: `${SITE_URL}/jasa-website-bekasi` },
        ]}
      />
      <CityPageClient
        city="Bekasi"
        region="Bekasi & Jabodetabek"
        description="Zheng Digital Lab — jasa pembuatan website profesional di Bekasi dan sekitarnya. Garansi uang kembali, anti-scam, proses transparan. Website UMKM, Properti, Kuliner & Pendidikan mulai Rp600rb."
        longDescription={`Bekasi adalah kota dengan pertumbuhan penduduk dan bisnis tertinggi di kawasan Jabodetabek. Ribuan UMKM, perumahan baru, pusat kuliner, dan jasa bermunculan setiap bulannya — dan semuanya butuh kehadiran digital yang kuat untuk bisa bersaing.

Zheng Digital Lab hadir di Bekasi dengan misi yang sama: memberikan jasa pembuatan website yang terjamin dan anti-scam. Kami tahu banyak cerita tentang web developer yang minta DP besar lalu menghilang. Zheng Digital Lab lahir justru dari kejadian itu — teman kami ditipu, dan kami bertekad agar hal serupa tidak terjadi pada Anda.

Dari kafe di Summarecon Bekasi, properti di Cikarang, hingga toko online di Bekasi Timur — kami siap membangun website yang profesional, SEO-ready, dan terbukti membantu bisnis Anda tampil di Google.`}
        portfolios={[]}
      />
    </>
  );
}
