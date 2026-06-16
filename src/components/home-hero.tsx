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
  { icon: Zap, label: "Next.js Performance" },
  { icon: MapPin, label: "Tangerang · Surabaya · Bali" },
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

export function HomeHero() {
  const { setCurrentPage } = useStore();
  const router = useRouter();

  return (
    <section className="relative min-h-[90vh] flex items-center pt-16 overflow-hidden animated-grid">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-navy/5 dark:bg-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-3xl mx-auto text-center space-y-6"
        >
          {/* Badge */}
          <motion.div variants={item}>
            <Badge className="bg-gold/10 text-gold border-gold/20 px-4 py-1.5 text-sm">
              <Shield className="w-4 h-4 mr-1" />
              Zheng Digital Lab — Terjamin & Anti-Scam
            </Badge>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={item}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight"
          >
            Jasa Pembuatan Website{" "}
            <span className="gold-gradient-text">Terjamin & Anti-Scam</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={item}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Website profesional untuk bisnis Anda — dengan <strong>garansi uang kembali</strong> jika
            tidak sesuai. Melayani Tangerang, Jabodetabek, Surabaya, Sidoarjo, Gresik, Solo,
            Bali & Kupang. Zheng Digital Lab lahir agar Anda tidak pernah lagi ditipu web developer.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              asChild
              className="w-full sm:w-auto bg-gold hover:bg-gold-hover text-navy font-semibold"
            >
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
              >
                Konsultasi Gratis
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                navigateTo("portofolio", setCurrentPage, router);
              }}
              className="w-full sm:w-auto border-navy dark:border-white/20 text-foreground hover:bg-navy hover:text-white dark:hover:bg-white dark:hover:text-navy"
            >
              Lihat Portofolio
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Badges */}
          <motion.div
            variants={container}
            className="flex flex-wrap items-center justify-center gap-3 pt-4"
          >
            {badges.map((badge) => (
              <motion.div key={badge.label} variants={item}>
                <Badge
                  variant="secondary"
                  className="px-3 py-1.5 text-sm flex items-center gap-1.5"
                >
                  <badge.icon className="w-3.5 h-3.5 text-gold" />
                  {badge.label}
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
