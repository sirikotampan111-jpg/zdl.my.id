"use client";

import { motion } from "framer-motion";
import { useStore } from "@/store/use-store";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";

export function HomeCta() {
  const { setCurrentPage } = useStore();

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-navy -z-10" />
      <div className="absolute inset-0 animated-grid -z-5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Siap Membuat Bisnis Anda{" "}
            <span className="gold-gradient-text">Lebih Profesional</span>?
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Mulai dari paket hemat hingga premium, semua kebutuhan website bisnis Anda
            bisa kami wujudkan. Konsultasikan sekarang!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => {
                setCurrentPage("layanan");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-full sm:w-auto bg-gold hover:bg-gold-hover text-navy font-semibold"
            >
              Pilih Paket Layanan
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10"
            >
              <a
                href="https://wa.me/6288973745596"
                target="_blank"
                rel="noopener noreferrer"
              >
                Hubungi Kami via WhatsApp
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
