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

const stats = [
  { value: "150+", label: "project selesai" },
  { value: "0", label: "kasus penipuan" },
  { value: "99%", label: "klien puas" },
];

const cities = [
  "Jakarta", "Depok", "Bogor", "Bekasi", "Tangerang", "Bandung", "Surabaya", "Sidoarjo", "Gresik", "Solo", "Bali", "Kupang",
];

export function HomeHero() {
  const { setCurrentPage } = useStore();
  const router = useRouter();

  return (
    <section className="relative min-h-[95vh] flex items-center pt-24 pb-16 overflow-hidden">
      {/* Subtle warm radial accent only — no full-bg photo overlay */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[60%] h-[70%] bg-gradient-to-bl from-gold/[0.06] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[50%] bg-gradient-to-tr from-gold/[0.04] via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left content — 6 cols */}
          <div className="lg:col-span-6 space-y-8">
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
              <h1 className="heading-serif text-4xl sm:text-5xl md:text-[3.25rem] lg:text-6xl leading-[1.08] text-foreground">
                Jasa Pembuatan Website{" "}
                <span className="zheng-mark">Terjamin</span>
                <br />
                <span className="text-gold">&amp;</span> Anti-Scam
              </h1>

              {/* Subheading */}
              <p className="text-lg md:text-xl text-foreground/80 max-w-xl leading-relaxed">
                Kami memahami risiko mempercayakan website bisnis Anda kepada orang lain.{" "}
                <strong className="text-foreground">Zheng Digital Lab</strong> hadir sebagai solusi —{" "}
                jasa pembuatan website dengan{" "}
                <span className="hand-underline">garansi uang kembali</span> dan proses yang transparan.
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
                  className="flex items-center gap-1.5 text-sm text-foreground/70"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold" />
                  {badge}
                </div>
              ))}
            </motion.div>

            {/* Inline stats strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-6 pt-4 border-t border-border/60"
            >
              {stats.map((s, i) => (
                <div key={s.label} className="flex items-center gap-6">
                  {i > 0 && <div className="w-px h-8 bg-border/60" />}
                  <div>
                    <div className="heading-serif text-2xl md:text-3xl text-gold leading-none">
                      {s.value}
                    </div>
                    <div className="text-xs text-foreground/60 mt-1">{s.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right side — clean hero photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6"
          >
            <div className="relative">
              {/* Hero image — clean, no overlay */}
              <div className="relative rounded-2xl overflow-hidden shadow-warm border border-border/60">
                <img
                  src="/hero.png"
                  alt="Zheng Digital Lab — jasa pembuatan website profesional"
                  className="w-full h-auto object-cover aspect-[4/3]"
                  loading="eager"
                  width={1000}
                  height={665}
                />
              </div>

              {/* Floating guarantee badge over image */}
              <div className="absolute -bottom-5 -left-5 hidden md:flex items-center gap-3 bg-card border border-border rounded-xl p-4 shadow-warm max-w-xs">
                <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">Zheng Guarantee</p>
                  <p className="text-xs text-foreground/60">Garansi anti-scam sejak hari pertama</p>
                </div>
              </div>

              {/* Area served chip — top right */}
              <div className="absolute -top-3 -right-3 hidden md:block bg-card border border-border rounded-full px-4 py-2 shadow-warm">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gold" />
                  <span className="text-xs font-semibold text-foreground">
                    12 Kota · Jabodetabek · Jawa &amp; Bali
                  </span>
                </div>
              </div>
            </div>

            {/* City list under image — mobile-friendly */}
            <div className="mt-5 flex flex-wrap gap-1.5 md:hidden">
              {cities.map((city) => (
                <a
                  key={city}
                  href={`/jasa-website-${city.toLowerCase()}`}
                  className="text-xs text-foreground/60 hover:text-gold transition-colors px-2 py-0.5 rounded bg-muted/60"
                >
                  {city}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
