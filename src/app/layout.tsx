import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { AuthProvider, Chatbot } from "@/components/client-providers";
import { CartSync } from "@/components/cart-sync";
import { LocalBusinessJsonLd, WebSiteJsonLd } from "@/components/json-ld";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zds.asia";
const SITE_NAME = "Zheng Digital Studio";
const SITE_DESCRIPTION =
  "Jasa pembuatan website profesional Jakarta, Depok, Bogor, Bekasi, Tangerang, Bandung, Surabaya, Sidoarjo, Gresik, Solo, Bali & Kupang. Zheng Digital Studio — terjamin, anti-scam, garansi uang kembali.";

// Guard: ensure SITE_URL is a valid URL for metadataBase
function safeMetadataBase(url: string): URL | undefined {
  try {
    return new URL(url);
  } catch {
    return undefined;
  }
}

export const metadata: Metadata = {
  ...(safeMetadataBase(SITE_URL) ? { metadataBase: safeMetadataBase(SITE_URL) } : {}),
  title: {
    default: "Jasa Pembuatan Website Profesional — Zheng Digital Studio | Terjamin & Anti-Scam",
    template: "%s | Zheng Digital Studio",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "jasa pembuatan website Jakarta",
    "jasa pembuatan website Depok",
    "jasa pembuatan website Bogor",
    "jasa pembuatan website Bekasi",
    "jasa pembuatan website Tangerang",
    "jasa pembuatan website Bandung",
    "jasa pembuatan website Surabaya",
    "jasa pembuatan website Sidoarjo",
    "jasa pembuatan website Gresik",
    "jasa pembuatan website Solo",
    "jasa pembuatan website Bali",
    "jasa pembuatan website Kupang",
    "jasa pembuatan website Jabodetabek",
    "jasa website profesional",
    "jasa website terpercaya",
    "website UMKM",
    "website properti",
    "website kuliner",
    "website anti scam",
    "website garansi uang kembali",
    "Zheng Digital Studio",
    "ZDS",
    "jasa website murah",
    "website modern",
    "website siap SEO",
    "paket website Indonesia",
    "web developer Jakarta",
    "web developer Tangerang",
    "web developer Bandung",
    "web developer Surabaya",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
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
    icon: [
      { url: "/favicon.png", sizes: "64x64", type: "image/png" },
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
  openGraph: {
    title: "Jasa Pembuatan Website Profesional — Zheng Digital Studio | Terjamin & Anti-Scam",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jasa Pembuatan Website Profesional — Zheng Digital Studio | Terjamin & Anti-Scam",
    description: SITE_DESCRIPTION,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <LocalBusinessJsonLd />
        <WebSiteJsonLd />
        <script
          src={
            process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
              ? "https://app.midtrans.com/snap/v2/assets/snap.js"
              : "https://app.sandbox.midtrans.com/snap/v2/assets/snap.js"
          }
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""}
          async
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" />
            <Chatbot />
            <CartSync />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
