"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { PagePortofolio } from "@/components/page-portofolio";
import { PageLayanan } from "@/components/page-layanan";
import { PageKontak } from "@/components/page-kontak";

/**
 * Client-side page wrappers for Next.js route pages.
 * Each route page (/portofolio, /layanan, /kontak) renders these
 * client components with their own server-side metadata (title, description, etc.)
 * so Google can crawl and index each page separately.
 */

export function PortfolioPageClient() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <PagePortofolio />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

export function LayananPageClient() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <PageLayanan />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

export function KontakPageClient() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <PageKontak />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
