import type { Metadata } from "next";
import { CityPageClient } from "@/components/city-page";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zds.asia";

export const metadata: Metadata = {
  title: "Jasa Pembuatan Website Bogor — Zheng Digital Studio | Terjamin & Anti-Scam",
  description:
    "Jasa pembuatan website profesional di Bogor. Zheng Digital Studio — garansi uang kembali, anti-scam, proses transparan. Website UMKM, Properti, Kuliner & Pendidikan. Mulai Rp600rb.",
  keywords: [
    "jasa pembuatan website Bogor",
    "jasa website Bogor",
    "web developer Bogor",
    "website profesional Bogor",
    "jasa website terpercaya Bogor",
    "website UMKM Bogor",
    "website bisnis Bogor",
    "website kuliner Bogor",
    "Zheng Digital Studio Bogor",
  ],
  alternates: {
    canonical: `${SITE_URL}/jasa-website-bogor`,
  },
  openGraph: {
    title: "Jasa Pembuatan Website Bogor — Zheng Digital Studio",
    description: "Website profesional di Bogor. Garansi uang kembali, anti-scam. Mulai Rp600rb.",
    url: `${SITE_URL}/jasa-website-bogor`,
    type: "website",
    locale: "id_ID",
  },
};

export default function BogorPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Bogor", url: `${SITE_URL}/jasa-website-bogor` },
        ]}
      />
      <CityPageClient
        city="Bogor"
        region="Bogor & Jabodetabek"
        description="Zheng Digital Studio — jasa pembuatan website profesional di Bogor dan sekitarnya. Garansi uang kembali, anti-scam, proses transparan. Website UMKM, Properti, Kuliner & Pendidikan mulai Rp600rb."
        longDescription={`Bogor dikenal sebagai kota hujan dengan potensi bisnis yang luar biasa — dari kuliner, agrowisata, properti, hingga UMKM kreatif. Di tengah pesatnya transformasi digital, bisnis di Bogor butuh website profesional untuk menjangkau pasar yang lebih luas, bukan cuma mengandalkan media sosial.

Zheng Digital Studio hadir untuk bisnis Bogor yang ingin go digital dengan aman. Kami memahami risiko yang ditakuti pemilik bisnis: membayar uang muka lalu developer menghilang. Itulah mengapa kami berani memberikan garansi uang kembali — karena kepercayaan bukan cuma dijanjikan, tapi dibuktikan.

Dari restoran di Pajajaran, villa di Puncak, hingga toko oleh-oleh di dekat Kebun Raya — kami siap membangun website yang profesional, cepat, dan mudah ditemukan di Google.`}
        portfolios={[]}
      />
    </>
  );
}
