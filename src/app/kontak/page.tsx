import type { Metadata } from "next";
import { KontakPageClient } from "@/components/client-pages";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zds.asia";

export const metadata: Metadata = {
  title: "Hubungi Kami — Konsultasi Website Gratis via WhatsApp",
  description:
    "Hubungi Zheng Digital Studio untuk konsultasi website gratis. Chat WhatsApp, kirim pesan, atau kunjungi kantor kami di Tangerang. Responsif & cepat!",
  keywords: [
    "kontak Zheng Digital Studio",
    "konsultasi website",
    "hubungi web developer",
    "WhatsApp website",
    "jasa website Tangerang",
    "konsultasi gratis website",
  ],
  alternates: {
    canonical: `${SITE_URL}/kontak`,
  },
  openGraph: {
    title: "Hubungi Kami — Zheng Digital Studio",
    description:
      "Konsultasi website gratis via WhatsApp. Hubungi Zheng Digital Studio sekarang!",
    url: `${SITE_URL}/kontak`,
    type: "website",
    locale: "id_ID",
  },
};

export default function KontakPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Kontak", url: `${SITE_URL}/kontak` },
        ]}
      />
      <KontakPageClient />
    </>
  );
}
