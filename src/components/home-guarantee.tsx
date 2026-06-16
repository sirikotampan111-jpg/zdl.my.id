"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Clock, Award, CheckCircle2, Eye, AlertTriangle } from "lucide-react";

const guarantees = [
  {
    icon: Shield,
    title: "Garansi Uang Kembali",
    description: "Website tidak sesuai? Uang kembali. Tanpa syarat rumit — ini jaminan Zheng.",
  },
  {
    icon: Eye,
    title: "Proses Transparan",
    description: "Pantau progress kapan saja. Kami tidak sembunyi — setiap tahap terbuka untuk Anda.",
  },
  {
    icon: Clock,
    title: "Tepat Waktu",
    description: "Deadline wajib dipenuhi. Terlambat tanpa alasan? Anda dapat kompensasi.",
  },
  {
    icon: CheckCircle2,
    title: "DP Ringan",
    description: "Mulai dari DP Rp500rb. Sisa bayar setelah website jadi dan Anda puas.",
  },
  {
    icon: Award,
    title: "Tanpa Biaya Tersembunyi",
    description: "Harga tertera = harga final. Tidak ada tagihan kejutan di kemudian hari.",
  },
  {
    icon: AlertTriangle,
    title: "Anti-Scam",
    description: "Zheng lahir karena melihat teman ditipu. Anti-scam bukan fitur — ini DNA kami.",
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

export function HomeGuarantee() {
  return (
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
            Zheng <span className="text-gold">Guarantee</span> — Anti-Scam
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Zheng Digital Lab lahir dari kejadian teman ditipu web developer. Anti-scam bukan sekadar
            fitur — ini alasan kami ada. Inilah jaminan nyata untuk Anda.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {guarantees.map((g) => (
            <motion.div key={g.title} variants={item}>
              <Card className="h-full bg-navy-lighter/50 border-gold/20 hover:border-gold/40 transition-colors text-center">
                <CardContent className="pt-6">
                  <div className="w-14 h-14 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <g.icon className="w-7 h-7 text-gold" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{g.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{g.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
