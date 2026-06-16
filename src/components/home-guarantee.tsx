"use client";

import { motion } from "framer-motion";
import { Shield, Eye, Clock, CheckCircle2, Award, AlertTriangle } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const guarantees = [
  { icon: Shield, title: "Garansi Uang Kembali", desc: "Tidak sesuai? Uang kembali. Tanpa syarat rumit." },
  { icon: Eye, title: "Proses Transparan", desc: "Pantau progress kapan saja — kami tidak sembunyi." },
  { icon: Clock, title: "Tepat Waktu", desc: "Terlambat? Kompensasi untuk Anda. Janji itu janji." },
  { icon: CheckCircle2, title: "DP Ringan", desc: "Mulai Rp500rb. Sisa bayar setelah website jadi dan kamu puas." },
  { icon: Award, title: "Tanpa Biaya Tersembunyi", desc: "Harga tertera = harga final. Tidak ada tagihan kejutan." },
  { icon: AlertTriangle, title: "Anti-Scam", desc: "DNA kami. Lahir dari kejadian nyata teman ditipu developer." },
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
          <p className="mt-4 text-muted-foreground max-w-lg leading-relaxed">
            Zheng Digital Lab lahir karena teman kami ditipu web developer. Anti-scam bukan fitur marketing — ini alasan kami ada.
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
              className="bg-white rounded-xl border border-border/60 p-6 hover:border-gold/30 hover:shadow-warm transition-all"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <g.icon className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1.5">{g.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{g.desc}</p>
                </div>
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
            <p className="text-muted-foreground text-sm">
              Masih ragu? Konsultasi dulu gratis. Kami buktikan, bukan cuma janji.
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
