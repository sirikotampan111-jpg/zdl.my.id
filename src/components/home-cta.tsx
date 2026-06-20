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
    <section className="py-20 md:py-24 bg-foreground text-background relative overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/[0.06] rounded-full blur-3xl" />
      <div className="absolute inset-0 zheng-stripe" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-5"
          >
            <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl text-background leading-[1.1]">
              Jangan sampai bisnis kamu{" "}
              <span className="text-gold">ditipu</span> web developer
            </h2>
            <p className="text-background/70 text-lg max-w-xl leading-relaxed">
              Zheng Digital Studio hadir untuk memastikan setiap klien mendapatkan website yang dijanjikan. 
              Garansi uang kembali, proses transparan, DP ringan — semuanya dirancang untuk kepercayaan Anda.
            </p>
          </motion.div>

          {/* Right — buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3"
          >
            <Button
              size="lg"
              asChild
              className="bg-gold hover:bg-gold-hover text-foreground font-semibold rounded-lg px-8 h-13"
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
              className="border-background/20 text-background hover:bg-background hover:text-foreground rounded-lg px-8 h-13"
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
