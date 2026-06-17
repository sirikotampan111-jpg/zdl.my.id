"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Shield, Eye, Clock, CheckCircle2, Award, AlertTriangle, Search } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const guarantees = [
  {
    icon: Search,
    title: "Garansi Website Terindex",
    desc: "Website dijamin terindeks Google dan terintegrasi dengan Google Search Console. Bukan cuma online — pasti ketemu.",
    image: "/images/guarantees/terindex.png",
    alt: "Ilustrasi website terindeks Google",
  },
  {
    icon: Eye,
    title: "Proses Transparan",
    desc: "Pantau progress kapan saja — kami tidak sembunyi.",
    image: "/images/guarantees/transparan.png",
    alt: "Ilustrasi proses transparan",
  },
  {
    icon: Clock,
    title: "Tepat Waktu",
    desc: "Terlambat? Kompensasi untuk Anda. Janji itu janji.",
    image: "/images/guarantees/tepat-waktu.png",
    alt: "Ilustrasi tepat waktu",
  },
  {
    icon: CheckCircle2,
    title: "DP Ringan",
    desc: "Mulai Rp500rb. Sisa bayar setelah website jadi dan kamu puas.",
    image: "/images/guarantees/dp-ringan.png",
    alt: "Ilustrasi DP ringan",
  },
  {
    icon: Award,
    title: "Tanpa Biaya Tersembunyi",
    desc: "Harga tertera = harga final. Tidak ada tagihan kejutan.",
    image: "/images/guarantees/tanpa-biaya.png",
    alt: "Ilustrasi tanpa biaya tersembunyi",
  },
  {
    icon: AlertTriangle,
    title: "Anti-Scam",
    desc: "DNA kami. Lahir dari kejadian nyata teman ditipu developer.",
    image: "/images/guarantees/anti-scam.png",
    alt: "Ilustrasi anti-scam",
  },
];

export function HomeGuarantee() {
  return (
    <section className="py-20 md:py-24 bg-cream relative overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gold/[0.06] rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/[0.04] rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-gold/20 bg-gold/5 text-gold text-xs font-semibold uppercase tracking-wide rounded-full mb-6">
            <Shield className="w-3.5 h-3.5" />
            Zheng Guarantee
          </div>
          <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl text-foreground">
            Jaminan <span className="gold-gradient-text">Anti-Scam</span>
          </h2>
          <p className="mt-4 text-foreground/80 max-w-lg leading-relaxed text-base md:text-[1.05rem]">
            Zheng Digital Lab hadir untuk mengubah standar industri web development. Anti-scam bukan sekadar fitur — ini komitmen kami untuk transparansi dan akuntabilitas.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {guarantees.map((g, i) => (
            <motion.div
              key={g.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="group bg-white rounded-2xl border border-border/60 overflow-hidden hover:border-gold/40 hover:shadow-warm transition-all duration-300 flex flex-col"
            >
              {/* Image — top of card */}
              <div className="relative aspect-[4/3] bg-gradient-to-br from-gold/[0.04] to-cream overflow-hidden">
                <Image
                  src={g.image}
                  alt={g.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
              </div>

              {/* Body — title + description */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <g.icon className="w-4 h-4 text-gold" strokeWidth={2.2} />
                  </div>
                  <h3 className="font-sans font-bold text-foreground text-[1.05rem] leading-snug tracking-tight">
                    {g.title}
                  </h3>
                </div>
                <p className="text-sm md:text-[0.95rem] text-foreground/75 leading-relaxed">
                  {g.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA inside guarantee section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 pt-8 border-t border-border"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="text-foreground/80 text-sm">
              Masih ragu? Konsultasi dulu gratis. Kami buktikan dengan hasil nyata, bukan sekadar janji.
            </p>
            <Button
              size="sm"
              asChild
              className="bg-foreground hover:bg-foreground/90 text-background font-semibold rounded-lg shrink-0"
            >
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                Chat WhatsApp
                <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
