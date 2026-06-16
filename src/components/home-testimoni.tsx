"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { testimonials } from "@/lib/data";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

export function HomeTestimoni() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const t = testimonials[current];

  return (
    <section className="py-24 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-gold" />
            <span className="text-sm font-medium text-gold tracking-widest uppercase">Testimoni</span>
          </div>
          <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl text-foreground">
            Kata <span className="zheng-mark">klien</span> kami
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* Quote — large serif */}
              <blockquote className="heading-serif text-2xl md:text-3xl lg:text-4xl text-foreground leading-snug">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Attribution */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.business}</p>
                  <div className="flex items-center gap-0.5 pt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < t.rating ? "text-gold fill-gold" : "text-border"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={prev}
                    className="w-10 h-10 border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-muted-foreground tabular-nums min-w-[3ch] text-center">
                    {current + 1}/{testimonials.length}
                  </span>
                  <button
                    onClick={next}
                    className="w-10 h-10 border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
