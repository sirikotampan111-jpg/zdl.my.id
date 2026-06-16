"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { stats } from "@/lib/data";

function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [started, value]);

  return (
    <div ref={ref} className="heading-serif text-5xl md:text-6xl text-gold tabular-nums">
      {count}{suffix}
    </div>
  );
}

export function HomeStatistik() {
  return (
    <section className="py-24 relative">
      {/* Dot pattern */}
      <div className="absolute inset-0 animated-grid -z-10" />

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
            <span className="text-sm font-medium text-gold tracking-widest uppercase">Statistik</span>
          </div>
          <h2 className="heading-serif text-3xl md:text-4xl lg:text-5xl text-foreground">
            Zheng dalam <span className="text-gold">Angka</span>
          </h2>
        </motion.div>

        {/* Stats in editorial grid — not 4 equal cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="space-y-2"
            >
              <CountUp value={stat.value} suffix={stat.suffix} />
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
