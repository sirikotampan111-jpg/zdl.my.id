import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { AuthProvider, Chatbot } from "@/components/client-providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zdl.my.id";
const SITE_NAME = "Zheng Digital Lab";
const SITE_DESCRIPTION =
  "Kami membantu UMKM, Properti, Kuliner, Pendidikan memiliki website modern yang cepat, profesional, dan siap bersaing di Google.";

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
    default: "Zheng Digital Lab - Website Profesional untuk Bisnis Anda",
    template: "%s | Zheng Digital Lab",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "website profesional",
    "jasa pembuatan website",
    "Zheng Digital Lab",
    "website UMKM",
    "website properti",
    "website kuliner",
    "Next.js website",
    "ZDL",
    "website bisnis",
    "jasa website murah",
    "website modern",
    "website siap SEO",
    "paket website Indonesia",
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
    icon: "/favicon.png",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
  openGraph: {
    title: "Zheng Digital Lab - Website Profesional untuk Bisnis Anda",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zheng Digital Lab - Website Profesional untuk Bisnis Anda",
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
