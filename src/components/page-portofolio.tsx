"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { portfolios, portfolioCategories, PortfolioItem } from "@/lib/data";
import { LivePreviewCard } from "@/components/live-preview-card";
import { PortfolioModal } from "@/components/portfolio-modal";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 },
};

export function PagePortofolio() {
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [selectedPortfolio, setSelectedPortfolio] =
    useState<PortfolioItem | null>(null);

  const filtered =
    activeCategory === "Semua"
      ? portfolios
      : portfolios.filter((p) => p.category === activeCategory);

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
            Portofolio <span className="gold-gradient-text">Kami</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Lihat hasil karya kami dari berbagai kategori bisnis. Setiap website
            ditampilkan langsung dari website aslinya — bukan gambar hasil generate.
          </p>
        </motion.div>

        {/* Category filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-10"
        >
          {portfolioCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-gold text-navy"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Portfolio grid with LIVE previews */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            variants={container}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((p) => (
              <motion.div key={p.id} variants={item}>
                <LivePreviewCard
                  portfolio={p}
                  onClick={() => setSelectedPortfolio(p)}
                  height="h-56"
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
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
