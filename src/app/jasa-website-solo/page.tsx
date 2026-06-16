import type { Metadata } from "next";
import { CityPageClient } from "@/components/city-page";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zdl.my.id";

export const metadata: Metadata = {
  title: "Jasa Pembuatan Website Solo — Zheng Digital Lab | Terjamin & Anti-Scam",
  description:
    "Jasa pembuatan website profesional di Solo. Zheng Digital Lab — garansi uang kembali, anti-scam. Website UMKM, Batik, Kuliner & Bisnis mulai Rp600rb.",
  keywords: [
    "jasa pembuatan website Solo",
    "jasa website Solo",
    "web developer Solo",
    "website profesional Solo",
    "jasa website terpercaya Solo",
    "website UMKM Solo",
    "website batik Solo",
    "Zheng Digital Lab Solo",
  ],
  alternates: { canonical: `${SITE_URL}/jasa-website-solo` },
  openGraph: {
    title: "Jasa Pembuatan Website Solo — Zheng Digital Lab",
    description: "Website profesional di Solo. Garansi uang kembali, anti-scam. Mulai Rp600rb.",
    url: `${SITE_URL}/jasa-website-solo`,
    type: "website",
    locale: "id_ID",
  },
};

export default function SoloPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", url: SITE_URL },
        { name: "Solo", url: `${SITE_URL}/jasa-website-solo` },
      ]} />
      <CityPageClient
        city="Solo"
        region="Solo & Jawa Tengah"
        description="Zheng Digital Lab — jasa pembuatan website profesional di Solo. Garansi uang kembali, anti-scam, proses transparan. Website batik, kuliner, UMKM & bisnis mulai Rp600rb."
        longDescription={`Solo adalah kota budaya dan bisnis yang memiliki karakter unik — dari warisan batik yang mendunia hingga kuliner yang memikat wisatawan. Bisnis di Solo butuh website yang bisa merepresentasikan keindahan dan kualitas produk mereka secara digital.

Zheng Digital Lab siap membantu bisnis Solo memiliki website yang tidak cuma cantik, tapi juga fungsional dan siap bersaing di Google. Kami memahami bahwa pemilik bisnis di Solo menghargai kejujuran dan kepercayaan — nilai yang sama yang kami pegang teguh.

Dengan garansi uang kembali, proses transparan, dan DP ringan, Anda bisa memulai tanpa rasa khawatir. Zheng Digital Lab lahir dari semangat anti-scam — jadi Anda tidak perlu lagi takut ditipu web developer.`}
        portfolios={[]}
      />
    </>
  );
}
