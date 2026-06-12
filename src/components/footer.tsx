"use client";

import { useStore } from "@/store/use-store";
import { Separator } from "@/components/ui/separator";
import { WHATSAPP_NUMBER, WHATSAPP_DISPLAY, WHATSAPP_LINK, BUSINESS_ADDRESS, SITE_DOMAIN, COMPANY_NAME } from "@/lib/config";

const footerLinks = [
  { id: "home", label: "Home" },
  { id: "portofolio", label: "Portofolio" },
  { id: "layanan", label: "Layanan" },
  { id: "kontak", label: "Kontak" },
];

export function Footer() {
  const { setCurrentPage } = useStore();

  const handleNav = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-navy text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/favicon.png"
                  alt="ZDL"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-lg">
                Zheng<span className="text-gold">DigitalLab</span>
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Kami membantu UMKM, Properti, Kuliner, Pendidikan, dan berbagai
              bisnis lainnya memiliki website modern yang cepat, profesional, dan
              siap bersaing di Google.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gold">Menu</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleNav(link.id)}
                    className="text-gray-300 hover:text-gold transition-colors text-sm cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gold">Kontak</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <span className="font-medium text-white">WhatsApp:</span>{" "}
                {WHATSAPP_DISPLAY}
              </li>
              <li>
                <span className="font-medium text-white">Website:</span>{" "}
                {SITE_DOMAIN}
              </li>
              <li className="leading-relaxed">
                <span className="font-medium text-white">Alamat:</span>{" "}
                {BUSINESS_ADDRESS}
              </li>
            </ul>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat WhatsApp
            </a>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.</p>
          <p>Crafted with precision & passion</p>
        </div>
      </div>
    </footer>
  );
}
