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
  Eye,
  MapPin,
} from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/config";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const guarantees = [
  {
    icon: Shield,
    title: "Garansi 100% Uang Kembali",
    description:
      "Website tidak sesuai yang dijanjikan? Uang Anda kembali sepenuhnya tanpa syarat rumit. Jaminan ini tertulis hitam di atas putih dalam setiap kontrak kerja sama.",
  },
  {
    icon: Clock,
    title: "Tepat Waktu atau Kompensasi",
    description:
      "Setiap proyek memiliki timeline yang disepakati di awal. Jika terlambat tanpa persetujuan Anda, kami berikan kompensasi yang diatur secara tertulis dalam kontrak.",
  },
  {
    icon: Award,
    title: "Harga Transparan, Tanpa Biaya Tersembunyi",
    description:
      "Harga yang tertera adalah harga final. Tidak ada markup misterius, tidak ada tagihan kejutan. Semua biaya dijelaskan secara detail sebelum kontrak ditandatangani.",
  },
  {
    icon: Users,
    title: "Support Setelah Online",
    description:
      "Website yang sudah online tetap menjadi tanggung jawab kami. Paket support teknis dan maintenance tersedia untuk memastikan website Anda terus berjalan optimal.",
  },
  {
    icon: Eye,
    title: "Proses Transparan, Bisa Dipantau",
    description:
      "Setiap tahapan pekerjaan dapat Anda pantau melalui dashboard khusus. Tidak ada proses yang disembunyikan — semua progres tercatat dan dapat diakses kapan saja.",
  },
  {
    icon: CheckCircle2,
    title: "DP Ringan, Pembayaran Bertahap",
    description:
      "Cukup DP Rp500.000 untuk memulai. Pembayaran sisanya dilakukan secara bertahap sesuai milestone yang disepakati, dengan pelunasan setelah website selesai dan Anda puas.",
  },
];

const serviceAreas = [
  { city: "Jakarta", desc: "Ibu kota negara & pusat bisnis terbesar Indonesia" },
  { city: "Depok", desc: "Kota pendidikan dan bisnis di kawasan Jabodetabek" },
  { city: "Bogor", desc: "Kota hujan dengan potensi kuliner dan agrowisata" },
  { city: "Bekasi", desc: "Kota dengan pertumbuhan bisnis tertinggi di Jabodetabek" },
  { city: "Tangerang & Jabodetabek", desc: "Kantor pusat di Tangerang — melayani seluruh Jabodetabek" },
  { city: "Bandung", desc: "Kota kreatif dengan ekosistem startup dan fashion" },
  { city: "Surabaya", desc: "Kota terbesar kedua Indonesia — pusat bisnis Jawa Timur" },
  { city: "Sidoarjo", desc: "Kawasan industri dan bisnis yang berkembang pesat" },
  { city: "Gresik", desc: "Kota industri dengan potensi UMKM yang besar" },
  { city: "Solo", desc: "Kota budaya dan bisnis di Jawa Tengah" },
  { city: "Bali", desc: "Pusat pariwisata dan bisnis hospitality Indonesia" },
  { city: "Kupang", desc: "Gerbang bisnis Indonesia Timur — potensi digital yang belum tergarap" },
];

const milestones = [
  { year: "2019", event: "Zheng Digital Lab resmi didirikan dengan fokus menyediakan layanan web development yang transparan dan dapat dipertanggungjawabkan" },
  { year: "2020", event: "Melayani klien pertama dari sektor properti — Livia Real Estate, menjadi titik awal ekspansi ke sektor industri lainnya" },
  { year: "2021", event: "Ekspansi ke 4 sektor utama: Properti, Interior, Kuliner, dan Pendidikan. Lebih dari 50 website berhasil diluncurkan tanpa komplain" },
  { year: "2022", event: "Meningkatkan standar teknologi dengan adopsi Next.js — performa website klien meningkat hingga 3x lipat" },
  { year: "2023", event: "Lebih dari 100 project selesai dengan zero kasus penipuan, membuktikan komitmen terhadap integritas layanan" },
  { year: "2024", event: "Menambah layanan SEO & Backlink — membantu website klien mendominasi halaman pertama Google untuk kata kunci target" },
  { year: "2025", event: "Lebih dari 150 project selesai, melayani 12 kota besar Indonesia: Jakarta, Depok, Bogor, Bekasi, Tangerang, Bandung, Surabaya, Sidoarjo, Gresik, Solo, Bali, Kupang" },
];

export function TentangPageClient() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 -z-10 animated-grid" />
          <div className="absolute inset-0 -z-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/[0.04] rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto text-center space-y-6"
            >
              <div className="zheng-badge mx-auto w-fit">
                <Shield className="w-3.5 h-3.5" />
                Web Development dengan Standar Industri
              </div>

              <h1 className="heading-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
                Membangun Kepercayaan Lewat{" "}
                <span className="gold-gradient-text">Transparansi & Garansi Nyata</span>
              </h1>

              <p className="text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed">
                Zheng Digital Lab adalah perusahaan web development yang berkomitmen
                memberikan kepastian bagi setiap klien melalui sistem garansi terukur,
                proses transparan, dan akuntabilitas penuh di setiap tahapan pekerjaan.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Origin Story — professional tone */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <h2 className="heading-serif text-3xl md:text-4xl text-foreground">
                  Mengapa <span className="gold-gradient-text">Zheng Digital Lab</span> Ada
                </h2>

                <div className="space-y-5 text-foreground/80 leading-relaxed">
                  <p>
                    Industri jasa pembuatan website di Indonesia tumbuh pesat, namun
                    tidak semua penyedia layanan menerapkan standar profesional yang sama.
                    Sering kali klien menghadapi kendala seperti proyek yang terlambat
                    tanpa kompensasi, biaya yang berubah di tengah jalan, hingga komunikasi
                    yang terputus setelah pembayaran dilakukan. Kondisi ini merugikan
                    seluruh ekosistem bisnis digital dan menurunkan kepercayaan pelaku usaha
                    terhadap jasa web development secara umum.
                  </p>
                  <p>
                    Zheng Digital Lab lahir untuk menjawab kebutuhan tersebut. Didirikan
                    pada tahun 2019, perusahaan kami dibangun dengan prinsip yang sederhana
                    namun konsisten: setiap pekerjaan harus didukung oleh kontrak yang
                    jelas, garansi yang terukur, dan transparansi penuh dari awal hingga
                    peluncuran website. Kami percaya bahwa kepercayaan klien tidak dibangun
                    melalui janji, melainkan melalui sistem akuntabilitas yang dapat
                    diverifikasi.
                  </p>
                  <p>
                    <strong className="text-foreground">Zheng Digital Lab</strong> menerapkan
                    beberapa mekanisme jaminan inti yang membedakan kami dari penyedia jasa
                    web development pada umumnya. Pertama, garansi uang kembali 100% apabila
                    hasil tidak sesuai dengan yang disepakati. Kedua, sistem kompensasi
                    keterlambatan yang tertulis dalam kontrak. Ketiga, DP ringan Rp500.000
                    dengan pembayaran bertahap berdasarkan milestone, sehingga risiko finansial
                    klien dapat diminimalkan sejak awal kerja sama.
                  </p>
                  <p>
                    Hingga saat ini, lebih dari 150 project telah kami selesaikan dengan
                    nol kasus penipuan tercatat. Angka tersebut bukan sekadar statistik
                    pemasaran, melainkan hasil dari penerapan sistem yang konsisten dan
                    komitmen tim terhadap setiap proyek yang kami tangani. Setiap website
                    yang kami bangun merupakan representasi langsung dari standar kualitas
                    dan integritas yang kami pegang.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Zheng Guarantee */}
        <section className="py-20 md:py-24 bg-cream relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gold/[0.06] rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/[0.04] rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-14"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-gold/20 bg-gold/5 text-gold text-xs font-semibold uppercase tracking-wide rounded-full mb-6">
                <Shield className="w-3.5 h-3.5" />
                Zheng Guarantee
              </div>
              <h2 className="heading-serif text-3xl md:text-4xl text-foreground mb-4">
                Sistem Jaminan <span className="gold-gradient-text">Zheng Digital Lab</span>
              </h2>
              <p className="text-foreground/70 max-w-2xl mx-auto">
                Setiap jaminan yang kami berikan tertulis dalam kontrak kerja sama.
                Bukan sekadar janji di atas kertas, melainkan mekanisme akuntabilitas
                yang dapat dijalankan dan dipertanggungjawabkan.
              </p>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {guarantees.map((g) => (
                <motion.div key={g.title} variants={item}>
                  <Card className="h-full bg-white border-border/60 hover:border-gold/25 hover:shadow-warm transition-all rounded-xl">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <g.icon className="w-5 h-5 text-gold" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1.5">{g.title}</h3>
                          <p className="text-foreground/70 text-sm leading-relaxed">{g.description}</p>
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
        <section className="py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-14"
            >
              <h2 className="heading-serif text-3xl md:text-4xl text-foreground mb-4">
                Melayani <span className="gold-gradient-text">12 Kota Besar</span> Indonesia
              </h2>
              <p className="text-foreground/70 max-w-2xl mx-auto">
                Dimanapun bisnis Anda berada, Zheng Digital Lab siap melayani dengan
                standar kualitas yang sama — terjamin, transparan, dan profesional.
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
                  <Card className="h-full hover:border-gold/30 transition-colors group area-card rounded-xl">
                    <CardContent className="pt-5">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-gold transition-colors text-sm">
                            {area.city}
                          </h3>
                          <p className="text-foreground/60 text-xs mt-0.5">{area.desc}</p>
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
        <section className="py-20 md:py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-14"
            >
              <h2 className="heading-serif text-3xl md:text-4xl text-foreground mb-4">
                Perjalanan <span className="gold-gradient-text">Zheng Digital Lab</span>
              </h2>
              <p className="text-foreground/70 max-w-2xl mx-auto">
                Enam tahun pengalaman, lebih dari 150 project selesai, nol kasus penipuan.
                Setiap milestone adalah bukti komitmen kami terhadap kualitas dan integritas.
              </p>
            </motion.div>

            <div className="max-w-3xl mx-auto">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -16 : 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex gap-5 mb-8 last:mb-0"
                >
                  <div className="flex flex-col items-center">
                    <div className="timeline-dot mt-1" />
                    {i < milestones.length - 1 && (
                      <div className="w-px flex-1 bg-gold/15 mt-2" />
                    )}
                  </div>
                  <div className="pb-6">
                    <span className="text-xs font-semibold text-gold uppercase tracking-wide">{m.year}</span>
                    <p className="text-foreground/70 leading-relaxed mt-1">{m.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="zheng-cta-section py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-6"
            >
              <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl text-background leading-tight">
                Mulai Kerja Sama dengan{" "}
                <span className="gold-gradient-text">Zheng Digital Lab</span>
              </h2>
              <p className="text-background/70 max-w-2xl mx-auto text-lg">
                Konsultasikan kebutuhan website bisnis Anda tanpa biaya. Tim kami siap
                memberikan rekomendasi solusi yang sesuai dengan tujuan dan anggaran Anda.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  size="lg"
                  asChild
                  className="w-full sm:w-auto bg-gold hover:bg-gold-hover text-navy font-semibold rounded-lg"
                >
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Konsultasi Gratis via WhatsApp
                    <ExternalLink className="w-4 h-4 ml-1.5" />
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
