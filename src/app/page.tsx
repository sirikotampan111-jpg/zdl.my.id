"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/use-store";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { LoadingScreen } from "@/components/loading-screen";
import { HomeHero } from "@/components/home-hero";
import { HomeKeunggulan } from "@/components/home-keunggulan";
import { HomeStatistik } from "@/components/home-statistik";
import { HomePortofolioPreview } from "@/components/home-portofolio-preview";
import { HomeTestimoni } from "@/components/home-testimoni";
import { HomeCta } from "@/components/home-cta";
import { PagePortofolio } from "@/components/page-portofolio";
import { PageLayanan } from "@/components/page-layanan";
import { PageKontak } from "@/components/page-kontak";

function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeKeunggulan />
      <HomeStatistik />
      <HomePortofolioPreview />
      <HomeTestimoni />
      <HomeCta />
    </>
  );
}

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function Home() {
  const { currentPage } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingScreen />;

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage />;
      case "portofolio":
        return <PagePortofolio />;
      case "layanan":
        return <PageLayanan />;
      case "kontak":
        return <PageKontak />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
