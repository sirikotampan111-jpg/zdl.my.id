"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/use-store";
import { portfolios, PortfolioItem } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { PortfolioModal } from "@/components/portfolio-modal";
import Image from "next/image";

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

export function HomePortofolioPreview() {
  const { setCurrentPage } = useStore();
  const [selectedPortfolio, setSelectedPortfolio] =
    useState<PortfolioItem | null>(null);
  const featured = portfolios.slice(0, 6);

  return (
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
            Portofolio <span className="gold-gradient-text">Terbaru Kami</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Beberapa project terbaru yang telah kami selesaikan untuk klien kami.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {featured.map((p) => (
            <motion.div key={p.id} variants={item}>
              <Card
                className="overflow-hidden group hover:border-gold/50 transition-colors cursor-pointer"
                onClick={() => setSelectedPortfolio(p)}
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.domain}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${p.gradient} opacity-30 group-hover:opacity-10 transition-opacity`}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium text-sm">
                      Lihat Detail
                    </span>
                  </div>
                </div>
                <CardContent className="pt-4">
                  <Badge
                    variant="secondary"
                    className="bg-gold/10 text-gold border-gold/20"
                  >
                    {p.category}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              setCurrentPage("portofolio");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="border-navy dark:border-white/20 text-foreground hover:bg-navy hover:text-white dark:hover:bg-white dark:hover:text-navy"
          >
            Lihat Semua Portofolio
            <ArrowRight className="w-4 h-4" />
          </Button>
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
