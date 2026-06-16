"use client";

import { useStore } from "@/store/use-store";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { WHATSAPP_NUMBER, WHATSAPP_DISPLAY, WHATSAPP_LINK, BUSINESS_ADDRESS, SITE_DOMAIN, COMPANY_NAME } from "@/lib/config";
import { navigateTo } from "@/lib/navigation";
import { MapPin, Mail, Phone } from "lucide-react";

const footerLinks = [
  { id: "home", label: "Beranda" },
  { id: "portofolio", label: "Portofolio" },
  { id: "layanan", label: "Layanan" },
  { id: "tentang", label: "Tentang" },
  { id: "kontak", label: "Kontak" },
];

const cityLinks = [
  { href: "/jasa-website-tangerang", label: "Tangerang" },
  { href: "/jasa-website-surabaya", label: "Surabaya" },
  { href: "/jasa-website-sidoarjo", label: "Sidoarjo" },
  { href: "/jasa-website-gresik", label: "Gresik" },
  { href: "/jasa-website-solo", label: "Solo" },
  { href: "/jasa-website-bali", label: "Bali" },
  { href: "/jasa-website-kupang", label: "Kupang" },
];

export function Footer() {
  const { setCurrentPage } = useStore();
  const router = useRouter();

  const handleNav = (page: string) => {
    navigateTo(page, setCurrentPage, router);
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/favicon.png"
                  alt="ZDL"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="heading-serif text-lg">
                Zheng Digital Lab
              </span>
            </div>
            <p className="text-background/50 text-sm leading-relaxed">
              Jasa pembuatan website profesional — terjamin, anti-scam, garansi uang kembali.
              Lahir agar kamu tidak perlu lagi ditipu web developer.
            </p>
            {/* WhatsApp button */}
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat WhatsApp
            </a>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gold text-sm uppercase tracking-wide">Menu</h3>
            <ul className="space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleNav(link.id)}
                    className="text-background/50 hover:text-gold transition-colors text-sm cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* City Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gold text-sm uppercase tracking-wide">Area Layanan</h3>
            <ul className="space-y-2.5">
              {cityLinks.map((city) => (
                <li key={city.href}>
                  <a
                    href={city.href}
                    className="text-background/50 hover:text-gold transition-colors text-sm"
                  >
                    Jasa Website {city.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gold text-sm uppercase tracking-wide">Kontak</h3>
            <ul className="space-y-3 text-sm text-background/50">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-background">WhatsApp</span>
                  <br />
                  {WHATSAPP_DISPLAY}
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-background">Website</span>
                  <br />
                  {SITE_DOMAIN}
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-background">Alamat</span>
                  <br />
                  <span className="leading-relaxed">{BUSINESS_ADDRESS}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-10 bg-background/8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-background/30">
          <p>&copy; {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.</p>
          <p>Terjamin &middot; Anti-Scam &middot; Garansi Uang Kembali</p>
        </div>
      </div>
    </footer>
  );
}
