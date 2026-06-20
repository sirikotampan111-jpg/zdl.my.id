"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
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

export function HomeKeunggulan() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Mengapa Memilih{" "}
            <span className="gold-gradient-text">Zheng Digital Studio</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Kami memberikan solusi website terbaik untuk bisnis Anda dengan fitur-fitur
            unggulan yang tidak akan Anda temukan di tempat lain.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {keunggulanItems.map((k) => {
            const IconComponent = iconMap[k.icon];
            return (
              <motion.div key={k.title} variants={item}>
                <Card className="h-full hover:border-gold/50 transition-colors group cursor-default">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                      <IconComponent className="w-6 h-6 text-gold" />
                    </div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">
                      ✔ {k.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {k.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
