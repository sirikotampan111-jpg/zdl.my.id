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
    <section className="py-20 md:py-24 bg-foreground text-background relative overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute inset-0 zheng-stripe" />
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-gold/[0.04] rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-4 h-4 text-gold" />
            <span className="text-xs font-semibold text-gold tracking-widest uppercase">Zheng Guarantee</span>
          </div>
          <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl">
            Jaminan <span className="text-gold">Anti-Scam</span>
          </h2>
          <p className="mt-4 text-background/50 max-w-lg leading-relaxed">
            Zheng Digital Lab lahir karena teman kami ditipu web developer. Anti-scam bukan fitur marketing — ini alasan kami ada.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-0">
          {guarantees.map((g, i) => (
            <motion.div
              key={g.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="guarantee-item"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <g.icon className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{g.title}</h3>
                  <p className="text-sm text-background/50">{g.desc}</p>
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
          className="mt-12 pt-8 border-t border-background/10"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="text-background/60 text-sm">
              Masih ragu? Konsultasi dulu gratis. Kami buktikan, bukan cuma janji.
            </p>
            <Button
              size="sm"
              asChild
              className="bg-gold hover:bg-gold-hover text-foreground font-semibold rounded-lg shrink-0"
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
