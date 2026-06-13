import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/auth-provider";
import { Chatbot } from "@/components/chatbot";
import { SITE_NAME, SITE_DOMAIN, SITE_URL } from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DESCRIPTION =
  "Jasa pembuatan website profesional untuk UMKM, properti, kuliner & bisnis Indonesia. Website cepat, SEO friendly, responsive mulai Rp600.000. Domain & hosting gratis!";

const KEYWORDS = [
  "jasa website",
  "jasa pembuatan website",
  "jasa website murah",
  "jasa website UMKM",
  "jasa website bisnis",
  "website profesional",
  "website UMKM",
  "website bisnis kecil",
  "website properti",
  "website kuliner",
  "website restoran",
  "website toko online",
  "jasa buat website",
  "pembuatan website Indonesia",
  "website SEO friendly",
  "website modern",
  "jasa web design",
  "jasa desain website",
  "website landing page",
  "website Next.js",
  "website HTML",
  "website untuk bisnis",
  "website untuk UMKM",
  "jasa website Tangerang",
  "jasa website Jakarta",
  "Zheng Digital Lab",
  "ZDL",
  "paket website Indonesia",
  "website dengan admin panel",
  "website e-commerce",
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `Jasa Pembuatan Website Profesional UMKM & Bisnis | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Business",
  classification: "Web Development Services",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.png",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
  openGraph: {
    title: `Jasa Website Profesional UMKM & Bisnis | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "id_ID",
    images: [
      {
        url: `${SITE_URL}/favicon.png`,
        width: 512,
        height: 512,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Jasa Website Profesional UMKM & Bisnis | ${SITE_NAME}`,
    description: DESCRIPTION,
    images: [`${SITE_URL}/favicon.png`],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

// JSON-LD Structured Data for LocalBusiness
function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: SITE_NAME,
    description: DESCRIPTION,
    url: SITE_URL,
    telephone: "+6288973745596",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kp. Jawaringan, RT.003/RW.004, Mekar Bakti",
      addressLocality: "Tangerang",
      addressRegion: "Banten",
      postalCode: "17510",
      addressCountry: "ID",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -6.2,
      longitude: 106.5,
    },
    areaServed: {
      "@type": "Country",
      name: "Indonesia",
    },
    priceRange: "Rp600.000 - Rp5.000.000",
    openingHours: "Mo-Sa 08:00-21:00",
    sameAs: [`https://wa.me/6288973745596`],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Paket Website Profesional",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Website HTML Landing Page",
            description: "Website HTML 1 halaman, responsive, domain .com, hosting, basic SEO",
          },
          price: "600000",
          priceCurrency: "IDR",
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Website Next.js 3 Halaman",
            description: "Website Next.js 3 halaman, SEO friendly, domain gratis, admin panel ready",
          },
          price: "2400000",
          priceCurrency: "IDR",
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Admin Panel & Database",
            description: "Dashboard admin lengkap dengan CRUD, login, database, sistem pemesanan",
          },
          price: "2000000",
          priceCurrency: "IDR",
        },
      ],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "150",
      bestRating: "5",
    },
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Layanan",
        item: `${SITE_URL}/#layanan`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Portofolio",
        item: `${SITE_URL}/#portofolio`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Kontak",
        item: `${SITE_URL}/#kontak`,
      },
    ],
  };

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Berapa lama waktu pengerjaan website?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Waktu pengerjaan tergantung kompleksitas project. Untuk Landing Page biasanya 3-5 hari kerja, website multi-halaman 7-14 hari kerja, dan website dengan admin panel 14-21 hari kerja.",
        },
      },
      {
        "@type": "Question",
        name: "Apakah domain dan hosting sudah termasuk?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ya, semua paket sudah termasuk domain dan hosting. Untuk paket HTML mendapat domain .com/.net, sedangkan paket Next.js mendapat domain gratis termasuk .id, .co.id, .com, .net, dan .org.",
        },
      },
      {
        "@type": "Question",
        name: "Apa metode pembayaran yang tersedia?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Pembayaran dilakukan melalui transfer bank, QRIS, e-wallet (GoPay, OVO, DANA, ShopeePay), dan kartu kredit. DP minimal Rp500.000 untuk paket HTML dan Next.js.",
        },
      },
    ],
  };

  // SECURITY: Escape </script> sequences to prevent XSS in JSON-LD context
  // JSON.stringify does NOT prevent this attack vector
  const safeJson = (data: unknown) =>
    JSON.stringify(data).replace(/<\/script>/gi, "<\\/script>");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson(faqData) }}
      />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="geo.region" content="ID-BT" />
        <meta name="geo.placename" content="Tangerang" />
        <meta name="geo.position" content="-6.2;106.5" />
        <meta name="ICBM" content="-6.2, 106.5" />
        <script
          src={
            process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
              ? "https://app.midtrans.com/snap/v2/assets/snap.js"
              : "https://app.sandbox.midtrans.com/snap/v2/assets/snap.js"
          }
          data-client-key={
            process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ||
            "SB-Mid-client-PLACEHOLDER"
          }
          async
        />
        <JsonLd />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" />
            <Chatbot />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
