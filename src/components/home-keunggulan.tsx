"use client";

import { motion } from "framer-motion";
import { keunggulanItems } from "@/lib/data";
import {
  Zap,
  Search,
  Smartphone,
  Globe,
  Mail,
  Headphones,
} from "lucide-react";

const iconMap = {
  Zap,
  Search,
  Smartphone,
  Globe,
  Mail,
  Headphones,
};

export function HomeKeunggulan() {
  return (
    <section className="py-24 relative">
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
            <span className="text-sm font-medium text-gold tracking-widest uppercase">Keunggulan</span>
          </div>
          <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl text-foreground">
            Kenapa <span className="zheng-mark">Zheng</span>?
          </h2>
        </motion.div>

        {/* Editorial list — not cards */}
        <div className="divide-y divide-border">
          {keunggulanItems.map((k, i) => {
            const IconComponent = iconMap[k.icon];
            return (
              <motion.div
                key={k.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group py-8 first:pt-0 last:pb-0"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
                  {/* Number + Icon */}
                  <div className="md:col-span-1 flex items-center gap-3">
                    <span className="heading-serif text-2xl text-gold/40 group-hover:text-gold transition-colors">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Title */}
                  <div className="md:col-span-3">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4 text-gold" />
                      <h3 className="font-semibold text-lg text-foreground group-hover:text-gold transition-colors">
                        {k.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-8">
                    <p className="text-muted-foreground leading-relaxed">
                      {k.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
