"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Clock,
  Award,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Zap,
  Search,
  Smartphone,
} from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/config";

interface CityPageProps {
  city: string;
  region: string;
  description: string;
  longDescription: string;
  portfolios: { name: string; domain: string; url: string }[];
}

const guarantees = [
  {
    icon: Shield,
    title: "Garansi Uang Kembali",
    description: "Website tidak sesuai yang dijanjikan? Uang Anda kembali sepenuhnya.",
  },
  {
    icon: Clock,
    title: "Tepat Waktu",
    description: "Deadline yang disepakati wajib dipenuhi. Terlambat = kompensasi.",
  },
  {
    icon: Award,
    title: "Harga Transparan",
    description: "Tidak ada biaya tersembunyi. Harga tertera adalah harga final.",
  },
  {
    icon: CheckCircle2,
    title: "DP Ringan",
    description: "Mulai dari DP Rp500rb. Sisa bayar setelah website jadi dan Anda puas.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function CityPageClient({ city, region, description, longDescription, portfolios }: CityPageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 -z-10 animated-grid" />
          <div className="absolute inset-0 -z-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/[0.04] rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto text-center space-y-6"
            >
              <div className="zheng-badge mx-auto w-fit">
                <MapPin className="w-3.5 h-3.5" />
                {region}
              </div>

              <h1 className="heading-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
                Jasa Pembuatan Website{" "}
                <span className="gold-gradient-text">{city}</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {description}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  size="lg"
                  asChild
                  className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90 font-semibold rounded-lg"
                >
                  <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                    Konsultasi Gratis
                    <ExternalLink className="w-4 h-4 ml-1.5" />
                  </a>
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
                {[
                  { icon: Shield, label: "Anti-Scam" },
                  { icon: Search, label: "SEO Friendly" },
                  { icon: Zap, label: "Next.js" },
                  { icon: Smartphone, label: "Responsive" },
                ].map((b) => (
                  <div key={b.label} className="flex items-center gap-1.5 text-xs text-muted-foreground px-2.5 py-1 rounded-lg bg-muted/60">
                    <b.icon className="w-3 h-3 text-gold" />
                    {b.label}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="space-y-5"
              >
                <h2 className="heading-serif text-3xl md:text-4xl text-foreground">
                  Mengapa Pilih Zheng Digital Studio di{" "}
                  <span className="gold-gradient-text">{city}</span>?
                </h2>
                <div className="text-muted-foreground leading-relaxed space-y-4">
                  {longDescription.split("\n\n").map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Portfolios from this area */}
        {portfolios.length > 0 && (
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mb-14"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-[2px] bg-gold" />
                  <span className="text-xs font-semibold text-gold tracking-widest uppercase">Portofolio</span>
                </div>
                <h2 className="heading-serif text-3xl md:text-4xl text-foreground">
                  Klien Zheng Digital Studio di <span className="gold-gradient-text">{city}</span>
                </h2>
                <p className="mt-3 text-muted-foreground max-w-lg">
                  Beberapa website yang telah kami bangun untuk bisnis di {city} dan sekitarnya.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {portfolios.map((p) => (
                  <Card key={p.domain} className="hover:border-gold/30 transition-colors area-card rounded-xl">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-foreground mb-1">{p.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{p.domain}</p>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold text-sm hover:underline inline-flex items-center gap-1"
                      >
                        Lihat Website <ExternalLink className="w-3 h-3" />
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Guarantees */}
        <section className="py-20 md:py-24 bg-cream relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gold/[0.06] rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/[0.04] rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-14"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-gold/20 bg-gold/5 text-gold text-xs font-semibold uppercase tracking-wide rounded-full mb-6">
                <Shield className="w-3.5 h-3.5" />
                Zheng Guarantee
              </div>
              <h2 className="heading-serif text-3xl md:text-4xl text-foreground mb-4">
                Jaminan <span className="gold-gradient-text">Zheng Digital Studio</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Jasa website di {city} yang terjamin, anti-scam, dan berani kasih garansi uang kembali.
              </p>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {guarantees.map((g) => (
                <motion.div key={g.title} variants={item}>
                  <Card className="h-full bg-white border-border/60 hover:border-gold/25 hover:shadow-warm transition-all text-center rounded-xl">
                    <CardContent className="pt-6">
                      <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <g.icon className="w-5 h-5 text-gold" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-1 text-sm">{g.title}</h3>
                      <p className="text-muted-foreground text-xs leading-relaxed">{g.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-24 bg-foreground text-background relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/[0.06] rounded-full blur-3xl" />
          <div className="absolute inset-0 zheng-stripe" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-6"
            >
              <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl text-background leading-tight">
                Siap Bikin Website di <span className="text-gold">{city}</span>?
              </h2>
              <p className="text-background/60 max-w-2xl mx-auto text-lg">
                Konsultasi gratis, tanpa komitmen. Ceritakan kebutuhan bisnis kamu dan kami buatkan
                penawaran terbaik. Garansi uang kembali jika tidak sesuai.
              </p>
              <Button
                size="lg"
                asChild
                className="bg-gold hover:bg-gold-hover text-foreground font-semibold rounded-lg"
              >
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                  Chat WhatsApp Sekarang
                  <ExternalLink className="w-4 h-4 ml-1.5" />
                </a>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
