import type { Metadata } from "next";
import { CityPageClient } from "@/components/city-page";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zdl.my.id";

export const metadata: Metadata = {
  title: "Jasa Pembuatan Website Jakarta — Zheng Digital Lab | Terjamin & Anti-Scam",
  description:
    "Jasa pembuatan website profesional di Jakarta. Zheng Digital Lab — garansi uang kembali, anti-scam, proses transparan. Website UMKM, Properti, Kuliner & Pendidikan. Mulai Rp600rb.",
  keywords: [
    "jasa pembuatan website Jakarta",
    "jasa website Jakarta",
    "web developer Jakarta",
    "website profesional Jakarta",
    "jasa website terpercaya Jakarta",
    "website UMKM Jakarta",
    "website bisnis Jakarta",
    "jasa website DKI Jakarta",
    "website perusahaan Jakarta",
    "Zheng Digital Lab Jakarta",
  ],
  alternates: {
    canonical: `${SITE_URL}/jasa-website-jakarta`,
  },
  openGraph: {
    title: "Jasa Pembuatan Website Jakarta — Zheng Digital Lab",
    description: "Website profesional di Jakarta. Garansi uang kembali, anti-scam. Mulai Rp600rb.",
    url: `${SITE_URL}/jasa-website-jakarta`,
    type: "website",
    locale: "id_ID",
  },
};

export default function JakartaPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Jakarta", url: `${SITE_URL}/jasa-website-jakarta` },
        ]}
      />
      <CityPageClient
        city="Jakarta"
        region="Jakarta & DKI Jakarta"
        description="Zheng Digital Lab — jasa pembuatan website profesional di Jakarta dan seluruh DKI Jakarta. Garansi uang kembali, anti-scam, proses transparan. Website UMKM, Properti, Kuliner & Pendidikan mulai Rp600rb."
        longDescription={`Jakarta adalah ibu kota negara dan pusat bisnis terbesar di Indonesia. Jutaan perusahaan, startup, UMKM, dan korporasi beroperasi di sini — dan di era digital, memiliki website profesional bukan lagi kemewahan, melainkan kebutuhan mutlak. Sayangnya, kasus penipuan web developer di Jakarta juga paling tinggi di Indonesia.

Zheng Digital Lab hadir untuk mengisi kekosongan itu. Kami memahami bahwa bisnis di Jakarta butuh partner digital yang profesional dan bisa dipercaya. Bukan cuma janji manis — tapi bukti nyata melalui garansi uang kembali, proses transparan, dan DP ringan.

Dari startup di Sudirman, restoran di Kemang, hingga UMKM di berbagai penjuru Jakarta — kami siap membangun website yang modern, SEO-friendly, dan siap bersaing di halaman pertama Google. Setiap project dikerjakan dengan standar tinggi dan komunikasi yang konsisten, supaya Anda tidak perlu lagi was-was ditipu developer.`}
        portfolios={[]}
      />
    </>
  );
}
