"use client";

import { motion } from "framer-motion";
import { useStore } from "@/store/use-store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink, Shield, CheckCircle2, MapPin } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/config";
import { navigateTo } from "@/lib/navigation";

const trustBadges = [
  "Garansi Uang Kembali",
  "Proses Transparan",
  "DP Ringan",
];

const cities = [
  "Tangerang", "Surabaya", "Sidoarjo", "Gresik", "Solo", "Bali", "Kupang",
];

export function HomeHero() {
  const { setCurrentPage } = useStore();
  const router = useRouter();

  return (
    <section className="relative min-h-[95vh] flex items-center pt-20 pb-16 overflow-hidden">
      {/* Subtle warm gradient overlay */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[60%] h-[70%] bg-gradient-to-bl from-gold/[0.04] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[50%] bg-gradient-to-tr from-gold/[0.03] via-transparent to-transparent" />
      </div>
      {/* Dot pattern */}
      <div className="absolute inset-0 -z-20 animated-grid" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left content — 7 cols */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              {/* Eyebrow */}
              <div className="zheng-badge">
                <Shield className="w-3.5 h-3.5" />
                Zheng Digital Lab
              </div>

              {/* H1 */}
              <h1 className="heading-serif text-4xl sm:text-5xl md:text-[3.5rem] lg:text-6xl leading-[1.08] text-foreground">
                Jasa Pembuatan Website{" "}
                <span className="zheng-mark">Terjamin</span>
                <br />
                <span className="text-gold">&amp;</span> Anti-Scam
              </h1>

              {/* Subheading — more conversational */}
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                Teman kami pernah ditipu web developer — uang dibawa lari, website tidak jadi.
                Itu yang bikin <strong className="text-foreground">Zheng Digital Lab</strong> lahir.
                Supaya kamu <span className="hand-underline">tidak perlu alami hal sama</span>.
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-start gap-3"
            >
              <Button
                size="lg"
                asChild
                className="bg-foreground text-background hover:bg-foreground/90 font-semibold rounded-lg px-7 h-12"
              >
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                  Konsultasi Gratis
                  <ExternalLink className="w-4 h-4 ml-1.5" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigateTo("portofolio", setCurrentPage, router)}
                className="border-border text-foreground hover:bg-foreground hover:text-background rounded-lg px-7 h-12"
              >
                Lihat Portofolio
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1"
            >
              {trustBadges.map((badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold" />
                  {badge}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right side — trust proof card */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5"
          >
            <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-warm space-y-7">
              {/* Guarantee header */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gold/10 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">Zheng Guarantee</p>
                  <p className="text-xs text-muted-foreground">Garansi anti-scam sejak hari pertama</p>
                </div>
              </div>

              {/* Stats — bold, editorial feel */}
              <div className="space-y-5">
                <div className="flex items-baseline gap-3">
                  <span className="heading-serif text-5xl md:text-6xl text-gold">150+</span>
                  <div>
                    <span className="text-sm text-muted-foreground block">project selesai</span>
                    <span className="text-xs text-muted-foreground/60">tanpa satu pun komplain</span>
                  </div>
                </div>
                <div className="section-divider" />
                <div className="flex items-baseline gap-3">
                  <span className="heading-serif text-5xl md:text-6xl text-gold">0</span>
                  <div>
                    <span className="text-sm text-muted-foreground block">kasus penipuan</span>
                    <span className="text-xs text-muted-foreground/60">bukan janji — ini fakta</span>
                  </div>
                </div>
                <div className="section-divider" />
                <div className="flex items-baseline gap-3">
                  <span className="heading-serif text-5xl md:text-6xl text-gold">99%</span>
                  <div>
                    <span className="text-sm text-muted-foreground block">klien puas</span>
                    <span className="text-xs text-muted-foreground/60">rating dari feedback langsung</span>
                  </div>
                </div>
              </div>

              {/* Area served */}
              <div className="pt-1">
                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-gold" />
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Area Layanan</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cities.map((city) => (
                    <a
                      key={city}
                      href={`/jasa-website-${city.toLowerCase()}`}
                      className="text-xs text-muted-foreground hover:text-gold transition-colors px-2 py-0.5 rounded bg-muted/60"
                    >
                      {city}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
