import type { Metadata } from "next";
import { CityPageClient } from "@/components/city-page";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zdl.my.id";

export const metadata: Metadata = {
  title: "Jasa Pembuatan Website Surabaya — Zheng Digital Lab | Terjamin & Anti-Scam",
  description:
    "Jasa pembuatan website profesional di Surabaya. Zheng Digital Lab — garansi uang kembali, anti-scam, proses transparan. Website UMKM, Properti, Kuliner & Pendidikan. Mulai Rp600rb.",
  keywords: [
    "jasa pembuatan website Surabaya",
    "jasa website Surabaya",
    "web developer Surabaya",
    "website profesional Surabaya",
    "jasa website terpercaya Surabaya",
    "website UMKM Surabaya",
    "website bisnis Surabaya",
    "Zheng Digital Lab Surabaya",
  ],
  alternates: {
    canonical: `${SITE_URL}/jasa-website-surabaya`,
  },
  openGraph: {
    title: "Jasa Pembuatan Website Surabaya — Zheng Digital Lab",
    description: "Website profesional di Surabaya. Garansi uang kembali, anti-scam. Mulai Rp600rb.",
    url: `${SITE_URL}/jasa-website-surabaya`,
    type: "website",
    locale: "id_ID",
  },
};

export default function SurabayaPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Surabaya", url: `${SITE_URL}/jasa-website-surabaya` },
        ]}
      />
      <CityPageClient
        city="Surabaya"
        region="Surabaya & Jawa Timur"
        description="Zheng Digital Lab — jasa pembuatan website profesional di Surabaya. Garansi uang kembali, anti-scam, proses transparan. Website UMKM, Properti, Kuliner & Pendidikan mulai Rp600rb."
        longDescription={`Surabaya adalah kota terbesar kedua di Indonesia dan pusat ekonomi Jawa Timur. Dengan pertumbuhan bisnis digital yang pesat, kebutuhan website profesional di Surabaya semakin meningkat — sayangnya, kasus penipuan web developer juga semakin marak.

Zheng Digital Lab hadir di Surabaya dengan misi yang jelas: memberikan jasa pembuatan website yang terjamin dan anti-scam. Kami memahami bahwa bisnis di Surabaya butuh partner digital yang bisa dipercaya, bukan cuma bikin website lalu menghilang.

Dari kuliner di Gubeng, properti di West Surabaya, hingga UMKM di Kenjeran — kami siap membantu bisnis Anda memiliki website yang modern, SEO-friendly, dan siap bersaing di Google. Dengan garansi uang kembali, Anda tidak perlu khawatir risiko.`}
        portfolios={[
          { name: "Kopikir Store", domain: "kopikir.store", url: "https://kopikir.store" },
        ]}
      />
    </>
  );
}
