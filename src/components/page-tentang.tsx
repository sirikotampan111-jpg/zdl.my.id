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
  Users,
  CheckCircle2,
  ExternalLink,
  AlertTriangle,
  Heart,
  Eye,
  Fingerprint,
  MapPin,
} from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/config";

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

const guarantees = [
  {
    icon: Shield,
    title: "Garansi 100% Uang Kembali",
    description:
      "Website tidak sesuai yang dijanjikan? Uang Anda kembali sepenuhnya. Tanpa syarat rumit, tanpa ribet. Ini bukan janji — ini jaminan tertulis Zheng Digital Lab.",
  },
  {
    icon: Clock,
    title: "Tepat Waktu atau Kompensasi",
    description:
      "Kami menepati deadline. Jika terlambat tanpa persetujuan Anda, kami berikan kompensasi. Waktu Anda berharga dan kami hormati itu.",
  },
  {
    icon: Award,
    title: "Harga Transparan, Tanpa Biaya Tersembunyi",
    description:
      "Harga yang tertera adalah harga final. Tidak ada markup misterius, tidak ada tagihan kejutan. Transparansi penuh dari awal konsultasi sampai website online.",
  },
  {
    icon: Users,
    title: "Support Setelah Online",
    description:
      "Banyak web developer hilang setelah dibayar. Kami tidak. Support teknis, konsultasi, dan bantuan tetap tersedia setelah website Anda online. Hubungan kami berkelanjutan.",
  },
  {
    icon: Eye,
    title: "Proses Transparan, Bisa Dipantau",
    description:
      "Anda bisa memantau progress website kapan saja. Kami tidak sembunyi — setiap tahap dikerjakan secara terbuka dan bisa Anda review langsung.",
  },
  {
    icon: CheckCircle2,
    title: "DP Ringan, Bayar Setelah Puas",
    description:
      "Cukup DP Rp500.000 untuk mulai. Sisanya dibayar setelah website selesai dan Anda sudah puas melihat hasilnya. Risiko di tangan kami, bukan di tangan Anda.",
  },
];

const serviceAreas = [
  { city: "Tangerang & Jabodetabek", desc: "Kantor pusat di Tangerang — melayani seluruh Jabodetabek" },
  { city: "Surabaya", desc: "Kota terbesar kedua Indonesia — pusat bisnis Jawa Timur" },
  { city: "Sidoarjo", desc: "Kawasan industri dan bisnis yang berkembang pesat" },
  { city: "Gresik", desc: "Kota industri dengan potensi UMKM yang besar" },
  { city: "Solo", desc: "Kota budaya dan bisnis di Jawa Tengah" },
  { city: "Bali", desc: "Pusat pariwisata dan bisnis hospitality Indonesia" },
  { city: "Kupang", desc: "Gerbang bisnis Indonesia Timur — potensi digital yang belum tergarap" },
];

const milestones = [
  { year: "Awal", event: "Pendiri melihat teman ditipu web developer — uang dibawa lari, website tidak jadi. Frustasi dan keprihatinan menjadi cikal bakal Zheng Digital Lab" },
  { year: "2019", event: "Zheng Digital Lab resmi didirikan dengan misi: agar tidak ada lagi orang ditipu jasa pembuatan website" },
  { year: "2020", event: "Klien pertama dari sektor properti — Livia Real Estate, membuktikan bahwa web developer terjamin itu ada" },
  { year: "2021", event: "Ekspansi ke 4 sektor utama: Properti, Interior, Kuliner, dan Pendidikan — 50+ website online tanpa satu pun klien komplain" },
  { year: "2022", event: "Meningkatkan standar dengan teknologi Next.js — performa website klien naik 3x lipat, lebih cepat dari kompetitor" },
  { year: "2023", event: "100+ project selesai dengan 0 kasus penipuan — membuktikan komitmen Zheng Digital Lab" },
  { year: "2024", event: "Menambah layanan SEO & Backlink — website klien mulai mendominasi halaman 1 Google di kota masing-masing" },
  { year: "2025", event: "150+ project selesai, melayani 7 kota besar: Tangerang, Surabaya, Sidoarjo, Gresik, Solo, Bali, Kupang" },
];

export function TentangPageClient() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        {/* Hero Section */}
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
                <AlertTriangle className="w-4 h-4 mr-1" />
                Lahir dari Kejadian Nyata
              </Badge>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Temanku Ditipu Web Developer.{" "}
                <span className="gold-gradient-text">Maka Zheng Digital Lab Lahir.</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Uang dibawa lari, website tidak jadi. Itu yang dialami teman pendiri kami.
                Frustasi itu jadi alasan Zheng Digital Lab ada — agar Anda tidak perlu mengalami hal yang sama.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Origin Story */}
        <section className="py-20 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  Cerita di Balik <span className="gold-gradient-text">Zheng Digital Lab</span>
                </h2>

                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Semuanya bermula dari satu kejadian yang seharusnya tidak perlu terjadi. Seorang teman
                    pendiri kami — seorang pemilik UMKM yang antusias ingin go digital — mempercayakan
                    pembuatan website bisnisnya kepada seorang web developer. Uang sudah dibayar penuh di
                    muka. Janji-janji manis diucapkan. Tapi minggu berganti minggu, website tidak kunjung
                    jadi. Pesan tidak dibalas. Nomor tidak aktif. Uang hilang. Website pun tidak ada.
                  </p>
                  <p>
                    Kami melihat sendiri betapa frustrasinya. Bukan soal uangnya — tapi soal kepercayaan
                    yang dihianati. Bisnis yang sudah siap berkembang jadi terhambat. Semangat yang
                    seharusnya dipakai untuk maju, jadi terpakai untuk kecewa. Dan yang paling menyakitkan:
                    kejadian ini bukan kasus pertama, dan pasti bukan yang terakhir — kecuali ada yang
                    berubah.
                  </p>
                  <p>
                    Dari situlah <strong className="text-foreground">Zheng Digital Lab</strong> lahir.
                    Bukan sekadar perusahaan web development, tapi sebuah gerakan untuk membuktikan bahwa
                    masih ada web developer yang bisa dipercaya. Yang menepati janji. Yang transparan
                    dalam proses. Yang memberikan garansi nyata — bukan sekadar kata-kata. Yang tidak
                    akan menghilang setelah menerima pembayaran.
                  </p>
                  <p>
                    Nama <strong className="text-foreground">Zheng</strong> menjadi simbol komitmen itu.
                    Setiap website yang kami bangun adalah bukti bahwa kepercayaan tidak perlu dikhianati.
                    Setiap klien yang puas adalah pembuktian bahwa industri ini bisa dilakukan dengan
                    jujur. Dan setiap garansi yang kami berikan adalah peringatan bagi diri kami sendiri:
                    tidak boleh gagal, karena ada orang-orang yang mempercayakan bisnisnya kepada kami.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Zheng Guarantee */}
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
              <Badge className="bg-gold/20 text-gold border-gold/30 px-4 py-1.5 text-sm mb-4">
                <Shield className="w-4 h-4 mr-1" />
                Zheng Guarantee
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Jaminan <span className="text-gold">Zheng</span> — Anti-Scam
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Kami tidak cuma berjanji — kami memberikan jaminan nyata. Karena Zheng Digital Lab
                lahir dari kejadian teman ditipu, anti-scam bukan sekadar fitur — ini DNA kami.
              </p>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {guarantees.map((g) => (
                <motion.div key={g.title} variants={item}>
                  <Card className="h-full bg-navy-lighter/50 border-gold/20 hover:border-gold/40 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <g.icon className="w-5 h-5 text-gold" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-white mb-2">{g.title}</h3>
                          <p className="text-gray-300 text-sm leading-relaxed">{g.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Service Areas */}
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
                Melayani <span className="gold-gradient-text">7 Kota Besar</span> Indonesia
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Dimanapun bisnis Anda berada, Zheng Digital Lab siap melayani dengan standar kualitas
                yang sama — terjamin, anti-scam, dan profesional.
              </p>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {serviceAreas.map((area) => (
                <motion.div key={area.city} variants={item}>
                  <Card className="h-full hover:border-gold/50 transition-colors group">
                    <CardContent className="pt-5">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-gold transition-colors">
                            {area.city}
                          </h3>
                          <p className="text-muted-foreground text-sm">{area.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Perjalanan <span className="gold-gradient-text">Zheng</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Dari kejadian pahit menjadi kepercayaan ratusan klien — setiap milestone adalah bukti
                bahwa web developer terjamin itu bukan mitos.
              </p>
            </motion.div>

            <div className="max-w-3xl mx-auto">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex gap-4 mb-8 last:mb-0"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-gold/10 border-2 border-gold rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-gold font-bold text-xs">{m.year}</span>
                    </div>
                    {i < milestones.length - 1 && (
                      <div className="w-0.5 h-full bg-gold/20 mt-2" />
                    )}
                  </div>
                  <div className="pb-8">
                    <p className="text-muted-foreground leading-relaxed">{m.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
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
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                Jangan Biarkan Bisnis Anda{" "}
                <span className="gold-gradient-text">Ditipu Lagi</span>
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                Zheng Digital Lab hadir agar Anda tidak perlu lagi khawatir ditipu web developer.
                Garansi uang kembali, proses transparan, hasil terjamin. Konsultasi gratis sekarang.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
                    Konsultasi Gratis via WhatsApp
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
