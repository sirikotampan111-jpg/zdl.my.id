import type { Metadata } from "next";
import { CityPageClient } from "@/components/city-page";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zdl.my.id";

export const metadata: Metadata = {
  title: "Jasa Pembuatan Website Tangerang — Zheng Digital Lab | Terjamin & Anti-Scam",
  description:
    "Jasa pembuatan website profesional di Tangerang & Jabodetabek. Zheng Digital Lab — garansi uang kembali, anti-scam, proses transparan. Website UMKM, Properti, Kuliner & Pendidikan. Mulai Rp600rb.",
  keywords: [
    "jasa pembuatan website Tangerang",
    "jasa website Tangerang",
    "web developer Tangerang",
    "jasa website Jabodetabek",
    "website profesional Tangerang",
    "jasa website terpercaya Tangerang",
    "website UMKM Tangerang",
    "website bisnis Tangerang",
    "Zheng Digital Lab Tangerang",
  ],
  alternates: {
    canonical: `${SITE_URL}/jasa-website-tangerang`,
  },
  openGraph: {
    title: "Jasa Pembuatan Website Tangerang — Zheng Digital Lab",
    description: "Website profesional di Tangerang. Garansi uang kembali, anti-scam. Mulai Rp600rb.",
    url: `${SITE_URL}/jasa-website-tangerang`,
    type: "website",
    locale: "id_ID",
  },
};

export default function TangerangPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Tangerang", url: `${SITE_URL}/jasa-website-tangerang` },
        ]}
      />
      <CityPageClient
        city="Tangerang"
        region="Tangerang & Jabodetabek"
        description="Zheng Digital Lab — jasa pembuatan website profesional di Tangerang dan seluruh Jabodetabek. Garansi uang kembali, anti-scam, proses transparan. Website UMKM, Properti, Kuliner & Pendidikan mulai Rp600rb."
        longDescription={`Tangerang dan kawasan Jabodetabek adalah pusat bisnis terbesar di Indonesia. Ribuan UMKM, properti, restoran, dan lembaga pendidikan beroperasi di sini — dan semuanya butuh website profesional untuk bisa bersaing di era digital.

Zheng Digital Lab berkantor pusat di Tangerang, sehingga kami memahami kebutuhan bisnis lokal secara langsung. Kami tahu bahwa pemilik bisnis di Tangerang tidak cuma butuh website yang bagus — mereka butuh website yang bisa dipercaya pembuatannya. Itulah mengapa kami memberikan garansi uang kembali dan proses yang transparan dari awal sampai akhir.

Dari Cipondoh ke Serpong, dari Karawaci ke Bintaro — kami telah membantu puluhan bisnis di Tangerang memiliki website yang modern, cepat, dan siap bersaing di Google. Setiap website dilengkapi SEO on-page, responsive design, dan performa optimal agar bisnis Anda mudah ditemukan oleh calon pelanggan.`}
        portfolios={[
          { name: "Livia Real Estate", domain: "liviarealestate.asia", url: "https://liviarealestate.asia" },
          { name: "Liana Home Interior", domain: "lianahomeinterior.com", url: "https://lianahomeinterior.com" },
          { name: "Design Home Living", domain: "designhomeliving.org", url: "https://designhomeliving.org" },
          { name: "TerraDekor", domain: "terradekor.com", url: "https://terradekor.com" },
        ]}
      />
    </>
  );
}
