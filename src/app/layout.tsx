import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zheng Digital Lab - Website Profesional untuk Bisnis Anda",
  description:
    "Kami membantu UMKM, Properti, Kuliner, Pendidikan memiliki website modern yang cepat, profesional, dan siap bersaing di Google.",
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
  ],
  authors: [{ name: "Zheng Digital Lab" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Zheng Digital Lab - Website Profesional untuk Bisnis Anda",
    description:
      "Kami membantu UMKM, Properti, Kuliner, Pendidikan memiliki website modern yang cepat, profesional, dan siap bersaing di Google.",
    url: "https://zdl.web.id",
    siteName: "Zheng Digital Lab",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zheng Digital Lab - Website Profesional untuk Bisnis Anda",
    description:
      "Kami membantu UMKM, Properti, Kuliner, Pendidikan memiliki website modern yang cepat, profesional, dan siap bersaing di Google.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
