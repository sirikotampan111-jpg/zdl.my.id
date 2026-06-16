import type { Metadata } from "next";
import { TentangPageClient } from "@/components/page-tentang";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zdl.my.id";

export const metadata: Metadata = {
  title: "Tentang Zheng Digital Lab — Lahir dari Kejadian Teman Ditipu Web Developer",
  description:
    "Zheng Digital Lab didirikan karena pendirinya melihat sendiri temannya ditipu web developer — uang dibawa lari, website tidak jadi. Kami hadir agar itu tidak terulang. Garansi uang kembali, anti-scam, terjamin. Melayani Tangerang, Surabaya, Sidoarjo, Gresik, Solo, Bali & Kupang.",
  keywords: [
    "tentang Zheng Digital Lab",
    "jasa website terpercaya",
    "web developer anti scam",
    "garansi website uang kembali",
    "jasa website Tangerang",
    "jasa website Surabaya",
    "jasa website Bali",
    "jasa website Sidoarjo",
    "jasa website Gresik",
    "jasa website Solo",
    "jasa website Kupang",
    "jasa website Jabodetabek",
    "Zheng Digital Lab story",
  ],
  alternates: {
    canonical: `${SITE_URL}/tentang`,
  },
  openGraph: {
    title: "Tentang Zheng Digital Lab — Anti-Scam, Terjamin",
    description:
      "Zheng Digital Lab lahir karena pendirinya melihat teman ditipu web developer. Kami hadir agar Anda tidak pernah mengalami hal sama. Garansi uang kembali.",
    url: `${SITE_URL}/tentang`,
    type: "website",
    locale: "id_ID",
  },
};

export default function TentangPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Tentang", url: `${SITE_URL}/tentang` },
        ]}
      />
      <TentangPageClient />
    </>
  );
}
