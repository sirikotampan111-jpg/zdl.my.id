import type { Metadata } from "next";
import { KontakPageClient } from "@/components/client-pages";
import { BreadcrumbJsonLd } from "@/components/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zdl.my.id";

export const metadata: Metadata = {
  title: "Hubungi Kami — Konsultasi Website Gratis via WhatsApp",
  description:
    "Hubungi Zheng Digital Lab untuk konsultasi website gratis. Chat WhatsApp, kirim pesan, atau kunjungi kantor kami di Tangerang. Responsif & cepat!",
  keywords: [
    "kontak Zheng Digital Lab",
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
    title: "Hubungi Kami — Zheng Digital Lab",
    description:
      "Konsultasi website gratis via WhatsApp. Hubungi Zheng Digital Lab sekarang!",
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
