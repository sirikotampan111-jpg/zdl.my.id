"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/use-store";
import { useRouter } from "next/navigation";
import { portfolios, PortfolioItem } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { LivePreviewCard } from "@/components/live-preview-card";
import { PortfolioModal } from "@/components/portfolio-modal";
import { navigateTo } from "@/lib/navigation";

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

export function HomePortofolioPreview() {
  const { setCurrentPage } = useStore();
  const router = useRouter();
  const [selectedPortfolio, setSelectedPortfolio] =
    useState<PortfolioItem | null>(null);
  const featured = portfolios.slice(0, 6);

  return (
    <section className="py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-gold" />
            <span className="text-xs font-semibold text-gold tracking-widest uppercase">Portofolio</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl text-foreground">
                Karya <span className="zheng-mark">Terbaru</span> Kami
              </h2>
              <p className="mt-3 text-muted-foreground max-w-lg leading-relaxed">
                Beberapa project terbaru yang sudah kami selesaikan. Klik untuk lihat langsung website aslinya.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigateTo("portofolio", setCurrentPage, router)}
              className="border-border text-foreground hover:bg-foreground hover:text-background rounded-lg self-start sm:self-auto"
            >
              Lihat Semua
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {featured.map((p) => (
            <motion.div key={p.id} variants={item} className="portfolio-card rounded-xl overflow-hidden border border-border bg-card">
              <LivePreviewCard
                portfolio={p}
                onClick={() => setSelectedPortfolio(p)}
                height="h-48"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Portfolio Detail Modal */}
      <PortfolioModal
        portfolio={selectedPortfolio}
        open={!!selectedPortfolio}
        onClose={() => setSelectedPortfolio(null)}
      />
    </section>
  );
}
