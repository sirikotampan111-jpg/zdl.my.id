"use client";

import { motion } from "framer-motion";
import { Shield, Eye, Clock, CheckCircle2, Award, AlertTriangle } from "lucide-react";

const guarantees = [
  { icon: Shield, title: "Garansi Uang Kembali", desc: "Tidak sesuai? Uang kembali. Tanpa syarat." },
  { icon: Eye, title: "Proses Transparan", desc: "Pantau progress kapan saja." },
  { icon: Clock, title: "Tepat Waktu", desc: "Terlambat = kompensasi untuk Anda." },
  { icon: CheckCircle2, title: "DP Ringan", desc: "Mulai Rp500rb. Sisa setelah puas." },
  { icon: Award, title: "Tanpa Biaya Tersembunyi", desc: "Harga tertera = harga final." },
  { icon: AlertTriangle, title: "Anti-Scam", desc: "DNA kami. Lahir dari kejadian nyata." },
];

export function HomeGuarantee() {
  return (
    <section className="py-24 bg-foreground text-background relative overflow-hidden">
      {/* Stripe accent */}
      <div className="absolute inset-0 zheng-stripe" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-gold" />
            <span className="text-sm font-medium text-gold tracking-widest uppercase">Zheng Guarantee</span>
          </div>
          <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl">
            Jaminan <span className="text-gold">Anti-Scam</span>
          </h2>
          <p className="mt-4 text-background/60 max-w-xl leading-relaxed">
            Zheng lahir dari kejadian teman ditipu web developer. Anti-scam bukan fitur — ini alasan kami ada.
          </p>
        </motion.div>

        {/* Grid — 2 col on md, 3 on lg */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          {guarantees.map((g, i) => (
            <motion.div
              key={g.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-start gap-4 py-4 border-b border-background/10"
            >
              <g.icon className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm mb-1">{g.title}</h3>
                <p className="text-sm text-background/60">{g.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
