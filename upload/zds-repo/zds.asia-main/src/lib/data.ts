export interface PortfolioItem {
  id: string;
  domain: string;
  category: "Properti" | "Interior" | "Kuliner" | "Bisnis & Edukasi";
  gradient: string;
  image?: string;
  url?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  category: "html" | "nextjs" | "admin" | "tambahan";
  badge?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  business: string;
  quote: string;
  rating: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

export const portfolios: PortfolioItem[] = [
  // Properti
  {
    id: "liviarealestate",
    domain: "liviarealestate.asia",
    category: "Properti",
    gradient: "from-emerald-600 to-teal-500",
    image: "/images/portfolio/liviarealestate.png",
    url: "https://www.liviarealestate.asia",
  },
  // Interior
  {
    id: "lianahomeinterior",
    domain: "lianahomeinterior.com",
    category: "Interior",
    gradient: "from-amber-500 to-orange-400",
    image: "/images/portfolio/lianahomeinterior.png",
    url: "https://www.lianahomeinterior.com",
  },
  {
    id: "designhomeliving",
    domain: "designhomeliving.org",
    category: "Interior",
    gradient: "from-rose-500 to-pink-400",
    image: "/images/portfolio/designhomeliving.png",
    url: "https://www.designhomeliving.org",
  },
  {
    id: "terradekor",
    domain: "terradekor.com",
    category: "Interior",
    gradient: "from-violet-600 to-purple-500",
    image: "/images/portfolio/terradekor.png",
    url: "https://www.terradekor.com",
  },
  // Kuliner
  {
    id: "kopikir",
    domain: "kopikir.store",
    category: "Kuliner",
    gradient: "from-yellow-600 to-amber-500",
    image: "/images/portfolio/kopikir.png",
    url: "https://www.kopikir.store",
  },
  {
    id: "kementriansegosbebek",
    domain: "kementriansegosbebek.id",
    category: "Kuliner",
    gradient: "from-lime-500 to-green-500",
    image: "/images/portfolio/kementriansegosbebek.png",
    url: "https://www.kementriansegosbebek.id",
  },
  // Bisnis & Edukasi
  {
    id: "bimbelstarlish",
    domain: "bimbelstarlish.com",
    category: "Bisnis & Edukasi",
    gradient: "from-sky-500 to-blue-400",
    image: "/images/portfolio/bimbelstarlish.png",
    url: "https://www.bimbelstarlish.com",
  },
  {
    id: "kirimikanhias",
    domain: "kirimikanhias.com",
    category: "Bisnis & Edukasi",
    gradient: "from-indigo-500 to-blue-500",
    image: "/images/portfolio/kirimikanhias.png",
    url: "https://kirimikanhias.com",
  },
];

export const portfolioCategories = [
  "Semua",
  "Properti",
  "Interior",
  "Kuliner",
  "Bisnis & Edukasi",
] as const;

export const htmlServices: ServiceItem[] = [
  {
    id: "html-landing",
    name: "Landing Page HTML",
    price: 600000,
    category: "html",
  },
  {
    id: "html-2",
    name: "Website HTML 2 Halaman",
    price: 900000,
    category: "html",
    badge: "Populer",
  },
  {
    id: "html-3",
    name: "Website HTML 3 Halaman",
    price: 1200000,
    category: "html",
    badge: "Best Value",
  },
  {
    id: "html-4",
    name: "Website HTML 4 Halaman",
    price: 1400000,
    category: "html",
  },
  {
    id: "html-5",
    name: "Website HTML 5 Halaman",
    price: 1500000,
    category: "html",
  },
];

export const nextjsServices: ServiceItem[] = [
  {
    id: "nextjs-landing",
    name: "Landing Page Next.js",
    price: 1500000,
    category: "nextjs",
  },
  {
    id: "nextjs-2",
    name: "Website Next.js 2 Halaman",
    price: 2000000,
    category: "nextjs",
    badge: "Populer",
  },
  {
    id: "nextjs-3",
    name: "Website Next.js 3 Halaman",
    price: 2400000,
    category: "nextjs",
    badge: "Best Value",
  },
  {
    id: "nextjs-4",
    name: "Website Next.js 4 Halaman",
    price: 2800000,
    category: "nextjs",
  },
  {
    id: "nextjs-5",
    name: "Website Next.js 5 Halaman",
    price: 3000000,
    category: "nextjs",
  },
];

export const adminService: ServiceItem = {
  id: "admin-panel",
  name: "Admin Panel & Database",
  price: 2000000,
  category: "admin",
};

export const additionalServices: ServiceItem[] = [
  {
    id: "email-bisnis",
    name: "Email Bisnis",
    price: 500000,
    category: "tambahan",
  },
  {
    id: "seo-website",
    name: "SEO Website",
    price: 1200000,
    category: "tambahan",
  },
  {
    id: "ads-setup",
    name: "Google / Meta Ads Setup",
    price: 350000,
    category: "tambahan",
  },
];

export const allServices: ServiceItem[] = [
  ...htmlServices,
  ...nextjsServices,
  adminService,
  ...additionalServices,
];

export const htmlFeatures = [
  "Domain .com / .net",
  "Hosting",
  "Responsive",
  "Basic SEO One Page",
  "Gratis 2x Revisi",
  "Siap Online",
];

export const nextjsFeatures = [
  "Domain Gratis (.id .co.id .com .net .org)",
  "Hosting",
  "SEO Friendly",
  "Responsive",
  "Performa Tinggi",
  "Support Teknis",
  "Revisi Gratis Selama 1 Bulan",
];

export const adminFeatures = [
  "Dashboard Admin",
  "Login Admin",
  "Database",
  "CRUD Data",
  "Kelola Produk",
  "Kelola Artikel",
  "Kelola Customer",
  "Sistem Pemesanan",
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Kak Livia",
    business: "Livia Real Estate",
    quote:
      "Website yang dibuat oleh Zheng Digital Studio sangat profesional dan cepat. Klien kami langsung tertarik melihat tampilannya. Sangat recommended!",
    rating: 5,
  },
  {
    id: "2",
    name: "Cici Liana Zhou",
    business: "Liana Home Interior",
    quote:
      "Proses pengerjaan cepat dan hasilnya memuaskan. Tim ZDS sangat responsif dan mau diajak diskusi sampai hasilnya sesuai keinginan.",
    rating: 5,
  },
  {
    id: "3",
    name: "Koh Novel",
    business: "Design Home Living",
    quote:
      "Website interior kami jadi lebih modern dan SEO friendly. Pelanggan baru banyak yang datang dari Google. Terima kasih ZDS!",
    rating: 5,
  },
  {
    id: "4",
    name: "Koh Edison",
    business: "Terra Dekor",
    quote:
      "Untuk bisnis dekorasi, website profesional itu wajib. Zheng Digital Studio memberikan solusi yang tepat dengan harga yang terjangkau.",
    rating: 5,
  },
  {
    id: "5",
    name: "Cici Charlie Liu",
    business: "Bimbel Starlish",
    quote:
      "Dari awal konsultasi sampai website online, semuanya smooth. Support setelah jadi juga sangat membantu. Top!",
    rating: 5,
  },
  {
    id: "6",
    name: "Bapak Wisnu",
    business: "Kementrian Segos Bebek",
    quote:
      "Website kuliner kami sekarang tampil lebih profesional dan mudah ditemukan di Google. Pelayanan ZDS sangat memuaskan!",
    rating: 5,
  },
];

export const faqItems: FAQItem[] = [
  {
    question: "Berapa lama waktu pengerjaan website?",
    answer:
      "Waktu pengerjaan tergantung kompleksitas project. Untuk Landing Page biasanya 3-5 hari kerja, website multi-halaman 7-14 hari kerja, dan website dengan admin panel 14-21 hari kerja.",
  },
  {
    question: "Apakah domain dan hosting sudah termasuk?",
    answer:
      "Ya, semua paket sudah termasuk domain dan hosting. Untuk paket HTML mendapat domain .com/.net, sedangkan paket Next.js mendapat domain gratis termasuk .id, .co.id, .com, .net, dan .org.",
  },
  {
    question: "Bagaimana proses revisi?",
    answer:
      "Paket HTML mendapat gratis 2x revisi, sedangkan paket Next.js mendapat revisi gratis selama 1 bulan setelah website online. Revisi tambahan bisa dibicarakan lebih lanjut.",
  },
  {
    question: "Apakah bisa request fitur khusus?",
    answer:
      "Tentu saja! Kami menerima request fitur khusus sesuai kebutuhan bisnis Anda. Silakan konsultasikan kebutuhan Anda melalui WhatsApp dan kami akan memberikan penawaran terbaik.",
  },
  {
    question: "Apa metode pembayaran yang tersedia?",
    answer:
      "Pembayaran dilakukan melalui transfer Bank Seabank dengan nomor rekening 901913604812. DP minimal Rp500.000 untuk paket HTML dan Next.js. Pelunasan dilakukan setelah website selesai dan online.",
  },
];

export const stats: StatItem[] = [
  { value: 150, suffix: "+", label: "Project Selesai" },
  { value: 120, suffix: "+", label: "Website Online" },
  { value: 99, suffix: "%", label: "Kepuasan Klien" },
  { value: 5, suffix: "+", label: "Tahun Pengalaman" },
];

export const keunggulanItems = [
  {
    icon: "Zap" as const,
    title: "Website Cepat",
    description:
      "Website dibangun dengan teknologi terbaru untuk performa optimal dan loading super cepat.",
  },
  {
    icon: "Search" as const,
    title: "SEO Friendly",
    description:
      "Optimasi mesin pencari agar website Anda mudah ditemukan di Google dan meningkatkan visibilitas.",
  },
  {
    icon: "Smartphone" as const,
    title: "Responsive Semua Device",
    description:
      "Tampilan sempurna di desktop, tablet, dan smartphone. Pengalaman pengguna yang konsisten.",
  },
  {
    icon: "Globe" as const,
    title: "Domain & Hosting Included",
    description:
      "Tidak perlu repot cari domain dan hosting sendiri. Semua sudah termasuk dalam paket.",
  },
  {
    icon: "Mail" as const,
    title: "Email Profesional",
    description:
      "Dapatkan email bisnis dengan domain sendiri untuk meningkatkan kredibilitas perusahaan.",
  },
  {
    icon: "Headphones" as const,
    title: "Support Setelah Website Jadi",
    description:
      "Kami tetap mendampingi Anda setelah website online. Support teknis dan revisi tersedia.",
  },
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export const PPN_RATE = 0.11;
export const TRANSACTION_FEE = 4000;
export const DP_MINIMAL = 500000;
export const DP_RATE = 0.5;

export const projectStages = [
  { key: "planning", label: "Planning", icon: "ClipboardList" as const },
  { key: "design", label: "Design", icon: "Palette" as const },
  { key: "development", label: "Development", icon: "Code" as const },
  { key: "testing", label: "Testing", icon: "Bug" as const },
  { key: "online", label: "Online", icon: "Rocket" as const },
] as const;

export function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  // SECURITY: Always use crypto — no Math.random fallback
  // In Node.js server context, crypto is always available
  if (typeof crypto === "undefined" || !crypto.randomUUID) {
    throw new Error("[SECURITY] crypto.randomUUID is not available. Cannot generate secure invoice number.");
  }
  const random = String(crypto.randomUUID().replace(/-/g, "").slice(0, 4));
  return `ZDS-${year}${month}${day}-${random}`;
}

export function generateTicketNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  // SECURITY: Always use crypto — no Math.random fallback
  if (typeof crypto === "undefined" || !crypto.randomUUID) {
    throw new Error("[SECURITY] crypto.randomUUID is not available. Cannot generate secure ticket number.");
  }
  const random = String(crypto.randomUUID().replace(/-/g, "").slice(0, 4));
  return `TKT-${year}${month}${day}-${random}`;
}

export interface PriceBreakdown {
  basePrice: number;
  isDP: boolean;
  dpAmount: number;
  ppn: number;
  transactionFee: number;
  total: number;
}

export function calculatePriceBreakdown(
  price: number,
  isDPEligible: boolean
): PriceBreakdown {
  const basePrice = price;
  const isDP = isDPEligible && price >= 1000000;
  const dpAmount = isDP ? Math.ceil(basePrice * DP_RATE) : basePrice;
  const chargeable = dpAmount;
  const ppn = Math.ceil(chargeable * PPN_RATE);
  const total = chargeable + ppn + TRANSACTION_FEE;

  return {
    basePrice,
    isDP,
    dpAmount,
    ppn,
    transactionFee: TRANSACTION_FEE,
    total,
  };
}
