import { WHATSAPP_NUMBER, BUSINESS_ADDRESS, SITE_URL as CONFIG_SITE_URL } from "@/lib/config";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || CONFIG_SITE_URL || "https://www.zdl.my.id";

/**
 * JSON-LD Structured Data for Zheng Digital Lab
 * Helps Google understand the business, services, and pages for better indexing & rich results.
 */

export function LocalBusinessJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Zheng Digital Lab",
    alternateName: ["ZDL", "Zheng Digital Lab Jakarta", "Zheng Digital Lab Tangerang", "Zheng Digital Lab Bandung", "Zheng Digital Lab Surabaya"],
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.png`,
    description:
      "Jasa pembuatan website profesional terjamin & anti-scam. Melayani Jakarta, Depok, Bogor, Bekasi, Tangerang, Bandung, Surabaya, Sidoarjo, Gresik, Solo, Bali & Kupang. Garansi uang kembali.",
    telephone: `+62${WHATSAPP_NUMBER}`,
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
      latitude: -6.2582536,
      longitude: 106.5153282,
    },
    areaServed: [
      { "@type": "City", name: "Jakarta" },
      { "@type": "AdministrativeArea", name: "Jabodetabek" },
      { "@type": "City", name: "Depok" },
      { "@type": "City", name: "Bogor" },
      { "@type": "City", name: "Bekasi" },
      { "@type": "City", name: "Tangerang" },
      { "@type": "City", name: "Bandung" },
      { "@type": "City", name: "Surabaya" },
      { "@type": "City", name: "Sidoarjo" },
      { "@type": "City", name: "Gresik" },
      { "@type": "City", name: "Solo" },
      { "@type": "State", name: "Bali" },
      { "@type": "City", name: "Kupang" },
    ],
    priceRange: "Rp600K - Rp3M",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:00",
      closes: "21:00",
    },
    sameAs: [],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Paket Layanan Website",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Landing Page HTML",
            description: "Website 1 halaman responsive dengan domain .com/.net, hosting, dan basic SEO.",
          },
          price: "600000",
          priceCurrency: "IDR",
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Website Next.js",
            description: "Website multi-halaman Next.js dengan domain gratis, hosting, SEO friendly, dan support teknis.",
          },
          price: "1500000",
          priceCurrency: "IDR",
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Admin Panel & Database",
            description: "Dashboard admin, login admin, database, CRUD data, dan sistem pemesanan.",
          },
          price: "2000000",
          priceCurrency: "IDR",
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "SEO + 4 Backlink Medium",
            description: "Optimasi SEO website + 4 backlink dari Google Business Profile, Blogspot, Linktree, dan Google Sites.",
          },
          price: "1200000",
          priceCurrency: "IDR",
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebSiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Zheng Digital Lab",
    alternateName: "ZDL",
    url: SITE_URL,
    description: "Jasa pembuatan website profesional terjamin & anti-scam. Melayani Jakarta, Depok, Bogor, Bekasi, Tangerang, Bandung, Surabaya, Sidoarjo, Gresik, Solo, Bali & Kupang.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "id",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
