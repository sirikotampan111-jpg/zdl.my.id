"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { faqItems } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  MessageCircle,
  ExternalLink,
  Send,
  Phone,
  Building2,
  MapPin,
  Check,
} from "lucide-react";
import { toast } from "sonner";

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

export function PageKontak() {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [subjek, setSubjek] = useState("");
  const [pesan, setPesan] = useState("");

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !email.trim() || !pesan.trim()) {
      toast.error("Harap isi semua field yang wajib diisi");
      return;
    }

    const message = `Halo Zheng Digital Lab,

Nama: ${nama}
Email: ${email}
Subjek: ${subjek || "-"}

Pesan:
${pesan}

Mohon informasi lebih lanjut. Terima kasih.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/6288973745596?text=${encodedMessage}`, "_blank");
    toast.success("Pesan dikirim via WhatsApp!");

    setNama("");
    setEmail("");
    setSubjek("");
    setPesan("");
  };

  return (
    <section className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Hubungi <span className="gold-gradient-text">Kami</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Punya pertanyaan atau ingin konsultasi? Jangan ragu untuk menghubungi
            kami melalui berbagai channel di bawah ini.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Send className="w-5 h-5 text-gold" />
                  Kirim Pesan
                </h2>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-nama">Nama *</Label>
                    <Input
                      id="contact-nama"
                      placeholder="Nama lengkap Anda"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Email *</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="email@contoh.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-subjek">Subjek</Label>
                    <Input
                      id="contact-subjek"
                      placeholder="Subjek pesan Anda"
                      value={subjek}
                      onChange={(e) => setSubjek(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-pesan">Pesan *</Label>
                    <Textarea
                      id="contact-pesan"
                      placeholder="Tulis pesan Anda di sini..."
                      value={pesan}
                      onChange={(e) => setPesan(e.target.value)}
                      rows={5}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gold hover:bg-gold-hover text-navy font-semibold"
                  >
                    <Send className="w-4 h-4" />
                    Kirim via WhatsApp
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Map + Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Address */}
            <Card className="border-gold/20">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Alamat</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Kp. Jawaringan, RT.003/RW.004, Mekar Bakti, Kec. Panongan, Kabupaten Tangerang, Banten 17510
                    </p>
                    <Button
                      size="sm"
                      variant="link"
                      asChild
                      className="text-gold hover:text-gold-hover px-0 h-auto py-1 text-sm"
                    >
                      <a
                        href="https://maps.app.goo.gl/xFZmgdisDB2uDjTb6"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Buka di Google Maps
                        <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Google Maps */}
            <Card className="overflow-hidden">
              <iframe
                src="https://maps.google.com/maps?q=Kp.+Jawaringan+Mekar+Bakti+Panongan+Tangerang+Banten+17510&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Zheng Digital Lab"
                className="w-full"
              />
            </Card>

            {/* Contact Cards */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <motion.div variants={item}>
                <Card className="hover:border-gold/50 transition-colors">
                  <CardContent className="pt-6 text-center space-y-2">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-foreground">WhatsApp</h3>
                    <p className="text-sm text-muted-foreground">0889-7374-5596</p>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                    >
                      <a
                        href="https://wa.me/6288973745596"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Chat Sekarang
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={item}>
                <Card className="hover:border-gold/50 transition-colors">
                  <CardContent className="pt-6 text-center space-y-2">
                    <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center mx-auto">
                      <Building2 className="w-5 h-5 text-gold" />
                    </div>
                    <h3 className="font-semibold text-foreground">Pembayaran</h3>
                    <p className="text-sm text-muted-foreground">Seabank</p>
                    <p className="text-xs font-mono text-foreground">901913604812</p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* WhatsApp CTA */}
            <Button
              size="lg"
              asChild
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              <a
                href="https://wa.me/6288973745596"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Phone className="w-5 h-5" />
                Hubungi via WhatsApp
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </motion.div>
        </div>

        {/* Payment Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <Card className="border-gold/30 bg-gold/5">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-gold" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-foreground">Informasi Pembayaran</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-gold shrink-0" />
                      <span className="text-muted-foreground">Bank: <strong className="text-foreground">Seabank</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-gold shrink-0" />
                      <span className="text-muted-foreground">No. Rekening: <strong className="text-foreground">901913604812</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-gold shrink-0" />
                      <span className="text-muted-foreground">DP Minimal: <strong className="text-gold">Rp500.000</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-gold shrink-0" />
                      <span className="text-muted-foreground">Pelunasan setelah website online</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Pertanyaan yang <span className="gold-gradient-text">Sering Ditanyakan</span>
            </h2>
            <p className="text-muted-foreground">
              Temukan jawaban untuk pertanyaan umum tentang layanan kami.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            {faqItems.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-card border rounded-lg px-4"
              >
                <AccordionTrigger className="text-left text-foreground font-medium hover:text-gold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
