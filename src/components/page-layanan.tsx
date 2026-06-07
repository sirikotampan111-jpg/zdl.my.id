"use client";

import { motion } from "framer-motion";
import { useStore } from "@/store/use-store";
import {
  htmlServices,
  nextjsServices,
  adminService,
  additionalServices,
  htmlFeatures,
  nextjsFeatures,
  adminFeatures,
  formatPrice,
} from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  ShoppingCart,
  Code2,
  Rocket,
  Database,
  Plus,
  Sparkles,
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

export function PageLayanan() {
  const { addToCart } = useStore();

  const handleAddToCart = (serviceId: string, serviceName: string, price: number, category: string) => {
    addToCart({ id: serviceId, name: serviceName, price, category });
    toast.success(`${serviceName} ditambahkan ke keranjang!`);
  };

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

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-8">
            {htmlFeatures.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-gold shrink-0" />
                <span className="text-muted-foreground">{f}</span>
              </div>
            ))}
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
                <Card className="relative hover:border-gold/50 transition-colors h-full">
                  {s.badge && (
                    <Badge className="absolute -top-2 right-4 bg-gold text-navy text-[10px]">
                      {s.badge}
                    </Badge>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {s.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-2xl font-bold text-foreground">
                      {formatPrice(s.price)}
                    </p>
                    <Button
                      size="sm"
                      className="w-full bg-gold hover:bg-gold-hover text-navy"
                      onClick={() =>
                        handleAddToCart(s.id, s.name, s.price, s.category)
                      }
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Tambah ke Keranjang
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Additional info */}
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

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-8">
            {nextjsFeatures.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-gold shrink-0" />
                <span className="text-muted-foreground">{f}</span>
              </div>
            ))}
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
                <Card
                  className={`relative hover:border-gold/50 transition-colors h-full ${
                    s.badge === "Best Value"
                      ? "ring-2 ring-gold"
                      : ""
                  }`}
                >
                  {s.badge && (
                    <Badge className="absolute -top-2 right-4 bg-gold text-navy text-[10px]">
                      {s.badge}
                    </Badge>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {s.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-2xl font-bold text-foreground">
                      {formatPrice(s.price)}
                    </p>
                    <Button
                      size="sm"
                      className="w-full bg-gold hover:bg-gold-hover text-navy"
                      onClick={() =>
                        handleAddToCart(s.id, s.name, s.price, s.category)
                      }
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Tambah ke Keranjang
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Additional info */}
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

          <Card className="hover:border-gold/50 transition-colors max-w-md">
            <CardHeader>
              <CardTitle className="text-lg">Admin Panel & Database</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-bold text-foreground">
                {formatPrice(adminService.price)}
              </p>
              <div className="space-y-2">
                {adminFeatures.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-gold shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </div>
                ))}
              </div>
              <Button
                className="w-full bg-gold hover:bg-gold-hover text-navy"
                onClick={() =>
                  handleAddToCart(
                    adminService.id,
                    adminService.name,
                    adminService.price,
                    adminService.category
                  )
                }
              >
                <ShoppingCart className="w-4 h-4" />
                Tambah ke Keranjang
              </Button>
            </CardContent>
          </Card>
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
                <Card className="hover:border-gold/50 transition-colors">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{s.name}</h3>
                      <Plus className="w-4 h-4 text-gold" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {formatPrice(s.price)}
                    </p>
                    <Button
                      size="sm"
                      className="w-full bg-gold hover:bg-gold-hover text-navy"
                      onClick={() =>
                        handleAddToCart(s.id, s.name, s.price, s.category)
                      }
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Tambah ke Keranjang
                    </Button>
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
