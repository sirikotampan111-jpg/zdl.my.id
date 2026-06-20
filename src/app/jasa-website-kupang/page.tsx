import type { Metadata } from "next";
import { CityPageClient } from "@/components/city-page";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zds.asia";

export const metadata: Metadata = {
  title: "Jasa Pembuatan Website Kupang — Zheng Digital Studio | Terjamin & Anti-Scam",
  description:
    "Jasa pembuatan website profesional di Kupang & NTT. Zheng Digital Studio — garansi uang kembali, anti-scam. Website UMKM, pendidikan & bisnis mulai Rp600rb.",
  keywords: [
    "jasa pembuatan website Kupang",
    "jasa website Kupang",
    "web developer Kupang",
    "website profesional Kupang",
    "jasa website terpercaya Kupang",
    "website UMKM Kupang",
    "website NTT",
    "jasa website Nusa Tenggara Timur",
    "Zheng Digital Studio Kupang",
  ],
  alternates: { canonical: `${SITE_URL}/jasa-website-kupang` },
  openGraph: {
    title: "Jasa Pembuatan Website Kupang — Zheng Digital Studio",
    description: "Website profesional di Kupang & NTT. Garansi uang kembali, anti-scam. Mulai Rp600rb.",
    url: `${SITE_URL}/jasa-website-kupang`,
    type: "website",
    locale: "id_ID",
  },
};

export default function KupangPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", url: SITE_URL },
        { name: "Kupang", url: `${SITE_URL}/jasa-website-kupang` },
      ]} />
      <CityPageClient
        city="Kupang"
        region="Kupang & NTT"
        description="Zheng Digital Studio — jasa pembuatan website profesional di Kupang dan Nusa Tenggara Timur. Garansi uang kembali, anti-scam, proses transparan. Mulai Rp600rb."
        longDescription={`Kupang dan wilayah Nusa Tenggara Timur memiliki potensi digital yang belum banyak tergarap. Banyak bisnis lokal yang masih mengandalkan media sosial saja, tanpa website profesional yang bisa meningkatkan kredibilitas dan jangkauan pasar mereka.

Zheng Digital Studio hadir untuk membawa bisnis Kupang ke level digital berikutnya. Kami membangun website yang tidak cuma online — tapi juga mudah ditemukan di Google, terlihat profesional, dan yang terpenting: dikerjakan oleh developer yang bisa dipercaya.

Di kota di mana akses ke web developer profesional masih terbatas, risiko ditipu semakin besar. Zheng Digital Studio lahir dari kejadian nyata teman ditipu — jadi anti-scam bukan sekadar fitur, tapi DNA kami. Garansi uang kembali, proses transparan, dan DP ringan adalah bentuk komitmen kami.`}
        portfolios={[]}
      />
    </>
  );
}
