"use client";

import { motion } from "framer-motion";
import { useStore } from "@/store/use-store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink, Shield } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/config";
import { navigateTo } from "@/lib/navigation";

export function HomeCta() {
  const { setCurrentPage } = useStore();
  const router = useRouter();

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-foreground -z-10" />
      <div className="absolute inset-0 zheng-stripe z-[-5]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl text-background leading-[1.1]">
              Jangan sampai bisnis Anda{" "}
              <span className="text-gold">ditipu</span> web developer
            </h2>
            <p className="text-background/60 text-lg max-w-xl leading-relaxed">
              Zheng Digital Lab lahir agar Anda tidak perlu lagi khawatir.
              Garansi uang kembali, proses transparan, DP ringan.
            </p>
          </motion.div>

          {/* Right — buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-4"
          >
            <Button
              size="lg"
              asChild
              className="bg-gold hover:bg-gold-hover text-foreground font-semibold rounded-none px-8 h-14"
            >
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                <Shield className="w-4 h-4 mr-2" />
                Konsultasi Gratis
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigateTo("layanan", setCurrentPage, router)}
              className="border-background/20 text-background hover:bg-background hover:text-foreground rounded-none px-8 h-14"
            >
              Pilih Paket
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
