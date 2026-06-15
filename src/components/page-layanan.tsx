"use client";

import { motion } from "framer-motion";
import {
  htmlServices,
  nextjsServices,
  adminService,
  additionalServices,
  htmlFeatures,
  nextjsFeatures,
  adminFeatures,
  formatPrice,
  DP_MINIMAL,
} from "@/lib/data";
import { WHATSAPP_LINK, BANK_NAME, BANK_ACCOUNT } from "@/lib/config";
import { useStore } from "@/store/use-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  MessageCircle,
  Code2,
  Rocket,
  Database,
  Sparkles,
  Building2,
  Info,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function generateWhatsAppLink(packageName: string, price: number, category: string) {
  const dpInfo = category === "html" || category === "nextjs"
    ? `\nDP Minimal: ${formatPrice(DP_MINIMAL)}`
    : "";

  const message = `Halo Zheng Digital Lab,

Saya tertarik dengan layanan website.

Paket: ${packageName}
Harga: ${formatPrice(price)}${dpInfo}

Mohon informasi proses selanjutnya.`;

  return `${WHATSAPP_LINK}?text=${encodeURIComponent(message)}`;
}

interface ServiceCardProps {
  id: string;
  name: string;
  price: number;
  category: string;
  badge?: string;
  bestValue?: boolean;
}

function ServiceCard({ id, name, price, category, badge, bestValue }: ServiceCardProps) {
  const { addToCart, cart, setCurrentPage } = useStore();
  const inCart = cart.find((c) => c.id === id);

  const handleAddToCart = () => {
    addToCart({ id, name, price, category });
    toast.success(`${name} ditambahkan ke keranjang!`);
  };

  return (
    <Card className={`relative hover:border-gold/50 transition-colors h-full ${bestValue ? "ring-2 ring-gold" : ""}`}>
      {badge && (
        <Badge className="absolute -top-2 right-4 bg-gold text-navy text-[10px]">
          {badge}
        </Badge>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-2xl font-bold text-foreground">
          {formatPrice(price)}
        </p>
        {(category === "html" || category === "nextjs") && (
          <p className="text-xs text-muted-foreground">
            DP mulai {formatPrice(DP_MINIMAL)}
          </p>
        )}
        <div className="space-y-2">
          <Button
            size="sm"
            className={`w-full font-semibold transition-all ${
              inCart
                ? "bg-gold text-navy hover:bg-gold-hover"
                : "bg-navy dark:bg-white text-white dark:text-navy hover:opacity-90"
            }`}
            onClick={inCart ? () => { setCurrentPage("keranjang"); window.scrollTo({ top: 0, behavior: "smooth" }); } : handleAddToCart}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {inCart ? "Lihat Keranjang" : "Tambah ke Keranjang"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
            asChild
          >
            <a
              href={generateWhatsAppLink(name, price, category)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function PageLayanan() {
  return (
    <section className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Paket <span className="gold-gradient-text">Layanan</span> Kami
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pilih paket yang sesuai dengan kebutuhan bisnis Anda. Semua paket sudah
            termasuk domain, hosting, dan support.
          </p>
        </motion.div>

        {/* Payment Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <Card className="border-gold/30 bg-gold/5">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-gold" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Info className="w-4 h-4 text-gold" />
                    Informasi Pembayaran
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-gold shrink-0" />
                      <span className="text-muted-foreground">Bank: <strong className="text-foreground">{BANK_NAME}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-gold shrink-0" />
                      <span className="text-muted-foreground">No. Rekening: <strong className="text-foreground">{BANK_ACCOUNT}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-gold shrink-0" />
                      <span className="text-muted-foreground">DP Minimal: <strong className="text-gold">Rp500.000</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-gold shrink-0" />
                      <span className="text-muted-foreground">Pembayaran DP dilakukan sebelum proses pengerjaan dimulai</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* HTML Package Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-20"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-navy dark:bg-navy-lighter rounded-xl flex items-center justify-center">
              <Code2 className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Paket Website HTML Ready Online
              </h2>
              <p className="text-muted-foreground text-sm">
                Website profesional dengan teknologi HTML siap online
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {htmlFeatures.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-gold shrink-0" />
                <span className="text-muted-foreground">{f}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-8 p-3 bg-gold/5 border border-gold/20 rounded-lg text-sm">
            <Info className="w-4 h-4 text-gold shrink-0" />
            <span className="text-muted-foreground">
              DP Minimal <strong className="text-gold">Rp500.000</strong> untuk memulai project
            </span>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
          >
            {htmlServices.map((s) => (
              <motion.div key={s.id} variants={item}>
                <ServiceCard
                  id={s.id}
                  name={s.name}
                  price={s.price}
                  category={s.category}
                  badge={s.badge}
                />
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-6 p-4 bg-muted/50 rounded-xl border text-sm text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Penambahan Halaman:</p>
            <p>• Landing Page - 3 Halaman: + Rp300.000/halaman</p>
            <p>• Mulai Paket 4 Halaman: + Rp150.000/halaman</p>
            <p>• Maksimal: 10 Halaman</p>
          </div>
        </motion.div>

        <Separator className="my-12" />

        {/* Next.js Package Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-20"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-navy" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Paket Website Next.js{" "}
                <span className="gold-gradient-text">Premium</span>
              </h2>
              <p className="text-muted-foreground text-sm">
                Website premium dengan teknologi Next.js & React
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {nextjsFeatures.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-gold shrink-0" />
                <span className="text-muted-foreground">{f}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-8 p-3 bg-gold/5 border border-gold/20 rounded-lg text-sm">
            <Info className="w-4 h-4 text-gold shrink-0" />
            <span className="text-muted-foreground">
              DP Minimal <strong className="text-gold">Rp500.000</strong> untuk memulai project
            </span>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
          >
            {nextjsServices.map((s) => (
              <motion.div key={s.id} variants={item}>
                <ServiceCard
                  id={s.id}
                  name={s.name}
                  price={s.price}
                  category={s.category}
                  badge={s.badge}
                  bestValue={s.badge === "Best Value"}
                />
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-6 p-4 bg-muted/50 rounded-xl border text-sm text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Penambahan Halaman:</p>
            <p>• Dari Landing Page: + Rp500.000/halaman</p>
            <p>• Dari Paket 2 Halaman: + Rp400.000/halaman</p>
            <p>• Dari Paket 4 Halaman ke Atas: + Rp200.000/halaman</p>
            <p>• Tanpa Batas Halaman</p>
          </div>
        </motion.div>

        <Separator className="my-12" />

        {/* Admin Panel Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-20"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-navy dark:bg-navy-lighter rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Admin Panel & Database
              </h2>
              <p className="text-muted-foreground text-sm">
                Kelola website Anda dengan dashboard admin yang powerful
              </p>
            </div>
          </div>

          <div className="max-w-md">
            <ServiceCard
              id={adminService.id}
              name={adminService.name}
              price={adminService.price}
              category={adminService.category}
            />
          </div>
        </motion.div>

        <Separator className="my-12" />

        {/* Additional Services Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-navy dark:bg-navy-lighter rounded-xl flex items-center justify-center">
              <Rocket className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Layanan Tambahan
              </h2>
              <p className="text-muted-foreground text-sm">
                Optimalkan website Anda dengan layanan tambahan kami
              </p>
            </div>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {additionalServices.map((s) => (
              <motion.div key={s.id} variants={item}>
                <Card className={`hover:border-gold/50 transition-colors ${s.badge ? "ring-2 ring-gold/50" : ""}`}>
                  {s.badge && (
                    <Badge className="absolute -top-2 right-4 bg-gold text-navy text-[10px]">
                      {s.badge}
                    </Badge>
                  )}
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{s.name}</h3>
                      <Rocket className="w-4 h-4 text-gold" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {formatPrice(s.price)}
                    </p>
                    {/* SEO backlink detail */}
                    {s.id === "seo-website" && (
                      <div className="space-y-1.5 p-3 bg-muted/50 rounded-lg border text-xs">
                        <p className="font-semibold text-foreground text-[11px]">Termasuk 4 Backlink Medium:</p>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Check className="w-3 h-3 text-gold shrink-0" />
                          <span>Google Business Profile</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Check className="w-3 h-3 text-gold shrink-0" />
                          <span>Blogspot</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Check className="w-3 h-3 text-gold shrink-0" />
                          <span>Linktree</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Check className="w-3 h-3 text-gold shrink-0" />
                          <span>Google Sites</span>
                        </div>
                      </div>
                    )}
                    <ServiceCardActions id={s.id} name={s.name} price={s.price} category={s.category} />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function ServiceCardActions({ id, name, price, category }: { id: string; name: string; price: number; category: string }) {
  const { addToCart, cart, setCurrentPage } = useStore();
  const inCart = cart.find((c) => c.id === id);

  const handleAddToCart = () => {
    addToCart({ id, name, price, category });
    toast.success(`${name} ditambahkan ke keranjang!`);
  };

  return (
    <div className="space-y-2">
      <Button
        size="sm"
        className={`w-full font-semibold transition-all ${
          inCart
            ? "bg-gold text-navy hover:bg-gold-hover"
            : "bg-navy dark:bg-white text-white dark:text-navy hover:opacity-90"
        }`}
        onClick={inCart ? () => { setCurrentPage("keranjang"); window.scrollTo({ top: 0, behavior: "smooth" }); } : handleAddToCart}
      >
        <ShoppingCart className="w-3.5 h-3.5" />
        {inCart ? "Lihat Keranjang" : "Tambah ke Keranjang"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
        asChild
      >
        <a
          href={generateWhatsAppLink(name, price, category)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          WhatsApp
        </a>
      </Button>
    </div>
  );
}
