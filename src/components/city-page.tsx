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
  Globe,
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
    description: "Website tidak sesuai yang dijanjikan? Uang Anda kembali sepenuhnya. Tanpa syarat.",
  },
  {
    icon: Clock,
    title: "Tepat Waktu",
    description: "Deadline yang disepakati wajib dipenuhi. Terlambat tanpa alasan = kompensasi.",
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
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function CityPageClient({ city, region, description, longDescription, portfolios }: CityPageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden animated-grid">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-navy/5 dark:bg-gold/5 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto text-center space-y-6"
            >
              <Badge className="bg-gold/10 text-gold border-gold/20 px-4 py-1.5 text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                {region}
              </Badge>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Jasa Pembuatan Website{" "}
                <span className="gold-gradient-text">{city}</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {description}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  asChild
                  className="w-full sm:w-auto bg-gold hover:bg-gold-hover text-navy font-semibold"
                >
                  <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                    Konsultasi Gratis
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                {[
                  { icon: Shield, label: "Anti-Scam" },
                  { icon: Search, label: "SEO Friendly" },
                  { icon: Zap, label: "Next.js" },
                  { icon: Smartphone, label: "Responsive" },
                ].map((b) => (
                  <Badge key={b.label} variant="secondary" className="px-3 py-1.5 text-sm flex items-center gap-1.5">
                    <b.icon className="w-3.5 h-3.5 text-gold" />
                    {b.label}
                  </Badge>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  Mengapa Pilih Zheng Digital Lab di{" "}
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
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Klien Zheng di <span className="gold-gradient-text">{city}</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Beberapa website yang telah kami bangun untuk bisnis di {city} dan sekitarnya.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolios.map((p) => (
                  <Card key={p.domain} className="hover:border-gold/50 transition-colors">
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
        <section className="py-20 bg-navy text-white relative overflow-hidden">
          <div className="absolute inset-0 -z-0">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Zheng <span className="text-gold">Guarantee</span>
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Jasa website di {city} yang terjamin, anti-scam, dan berani kasih garansi uang kembali.
              </p>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {guarantees.map((g) => (
                <motion.div key={g.title} variants={item}>
                  <Card className="h-full bg-navy-lighter/50 border-gold/20 hover:border-gold/40 transition-colors text-center">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <g.icon className="w-6 h-6 text-gold" />
                      </div>
                      <h3 className="font-semibold text-white mb-1 text-sm">{g.title}</h3>
                      <p className="text-gray-300 text-xs leading-relaxed">{g.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-navy -z-10" />
          <div className="absolute inset-0 animated-grid z-[-5]" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Siap Bikin Website di <span className="gold-gradient-text">{city}</span>?
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Konsultasi gratis, tanpa komitmen. Ceritakan kebutuhan bisnis Anda dan kami buatkan
                penawaran terbaik. Garansi uang kembali jika tidak sesuai.
              </p>
              <Button
                size="lg"
                asChild
                className="bg-gold hover:bg-gold-hover text-navy font-semibold"
              >
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                  Chat WhatsApp Sekarang
                  <ExternalLink className="w-4 h-4" />
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
