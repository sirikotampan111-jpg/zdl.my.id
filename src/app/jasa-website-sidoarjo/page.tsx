import type { Metadata } from "next";
import { CityPageClient } from "@/components/city-page";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zds.asia";

export const metadata: Metadata = {
  title: "Jasa Pembuatan Website Sidoarjo — Zheng Digital Studio | Terjamin & Anti-Scam",
  description:
    "Jasa pembuatan website profesional di Sidoarjo. Zheng Digital Studio — garansi uang kembali, anti-scam. Website UMKM, Kuliner & Bisnis mulai Rp600rb.",
  keywords: [
    "jasa pembuatan website Sidoarjo",
    "jasa website Sidoarjo",
    "web developer Sidoarjo",
    "website profesional Sidoarjo",
    "jasa website terpercaya Sidoarjo",
    "website UMKM Sidoarjo",
    "Zheng Digital Studio Sidoarjo",
  ],
  alternates: { canonical: `${SITE_URL}/jasa-website-sidoarjo` },
  openGraph: {
    title: "Jasa Pembuatan Website Sidoarjo — Zheng Digital Studio",
    description: "Website profesional di Sidoarjo. Garansi uang kembali, anti-scam. Mulai Rp600rb.",
    url: `${SITE_URL}/jasa-website-sidoarjo`,
    type: "website",
    locale: "id_ID",
  },
};

export default function SidoarjoPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", url: SITE_URL },
        { name: "Sidoarjo", url: `${SITE_URL}/jasa-website-sidoarjo` },
      ]} />
      <CityPageClient
        city="Sidoarjo"
        region="Sidoarjo & Sekitar Surabaya"
        description="Zheng Digital Studio — jasa pembuatan website profesional di Sidoarjo. Garansi uang kembali, anti-scam, proses transparan. Mulai Rp600rb."
        longDescription={`Sidoarjo adalah kabupaten yang terus berkembang di sekitar Surabaya, dengan potensi bisnis yang sangat besar — terutama di sektor kuliner, UMKM, dan industri. Namun, banyak pemilik bisnis di Sidoarjo yang masih kesulitan menemukan web developer terpercaya.

Zheng Digital Studio hadir untuk mengisi kekosongan itu. Kami memberikan jasa pembuatan website dengan garansi uang kembali, sehingga Anda tidak perlu khawatir ditipu. Proses kami transparan — Anda bisa memantau progress kapan saja.

Dari restoran bebek bumbu hitam yang legendaris hingga toko online yang baru berkembang — kami siap membantu bisnis Sidoarjo memiliki website yang profesional dan siap bersaing di Google.`}
        portfolios={[
          { name: "Kementrian Segos Bebek", domain: "kementriansegosbebek.id", url: "https://kementriansegosbebek.id" },
        ]}
      />
    </>
  );
}
