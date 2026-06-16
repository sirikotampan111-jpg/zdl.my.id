"use client";

import { motion } from "framer-motion";
import { useStore } from "@/store/use-store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ExternalLink, Zap, Search, Shield, MapPin } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/config";
import { navigateTo } from "@/lib/navigation";

const badges = [
  { icon: Shield, label: "Anti-Scam" },
  { icon: Search, label: "SEO Friendly" },
  { icon: Zap, label: "Next.js" },
  { icon: MapPin, label: "7 Kota" },
];

export function HomeHero() {
  const { setCurrentPage } = useStore();
  const router = useRouter();

  return (
    <section className="relative min-h-[92vh] flex items-center pt-16 overflow-hidden">
      {/* Dot pattern background */}
      <div className="absolute inset-0 -z-10 animated-grid" />
      {/* Warm decorative blur */}
      <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left content — takes 7 cols */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              {/* Eyebrow */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-[2px] bg-gold" />
                <span className="text-sm font-medium text-gold tracking-widest uppercase">
                  Zheng Digital Lab
                </span>
              </div>

              {/* H1 — Serif, asymmetric */}
              <h1 className="heading-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-foreground">
                Jasa Website{" "}
                <span className="zheng-mark">Terjamin</span>
                <br />
                <span className="text-gold">&amp;</span> Anti-Scam
              </h1>

              {/* Subheading */}
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                Teman kami ditipu web developer — uang dibawa lari, website tidak jadi.
                Zheng Digital Lab lahir agar <span className="hand-underline">itu tidak terulang</span>.
                Garansi uang kembali, proses transparan.
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              <Button
                size="lg"
                asChild
                className="bg-foreground text-background hover:bg-foreground/90 font-semibold rounded-none px-8"
              >
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                  Konsultasi Gratis
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigateTo("portofolio", setCurrentPage, router)}
                className="border-foreground/20 text-foreground hover:bg-foreground hover:text-background rounded-none px-8"
              >
                Lihat Portofolio
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>

            {/* Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
              {badges.map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <badge.icon className="w-4 h-4 text-gold" />
                  {badge.label}
                  {badge.label !== "7 Kota" && <span className="text-border">/</span>}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right side — trust proof card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 lg:pl-8"
          >
            <div className="zheng-border bg-card p-8 md:p-10 shadow-warm space-y-6">
              {/* Zheng Guarantee badge */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">Zheng Guarantee</p>
                  <p className="text-xs text-muted-foreground">Garansi anti-scam</p>
                </div>
              </div>

              {/* Stats in a raw, human way */}
              <div className="space-y-4">
                <div className="flex items-baseline gap-3">
                  <span className="heading-serif text-4xl md:text-5xl text-gold">150+</span>
                  <span className="text-sm text-muted-foreground">project selesai</span>
                </div>
                <div className="w-full h-px bg-border" />
                <div className="flex items-baseline gap-3">
                  <span className="heading-serif text-4xl md:text-5xl text-gold">0</span>
                  <span className="text-sm text-muted-foreground">kasus penipuan</span>
                </div>
                <div className="w-full h-px bg-border" />
                <div className="flex items-baseline gap-3">
                  <span className="heading-serif text-4xl md:text-5xl text-gold">99%</span>
                  <span className="text-sm text-muted-foreground">klien puas</span>
                </div>
              </div>

              {/* Area */}
              <div className="pt-2">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Melayani <span className="text-foreground font-medium">Tangerang, Surabaya, Sidoarjo, Gresik, Solo, Bali, Kupang</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
