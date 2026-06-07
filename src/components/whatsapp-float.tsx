"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/use-store";
import { MessageCircle } from "lucide-react";

export function WhatsAppFloat() {
  const { currentPage } = useStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Hide on Kontak page
  if (currentPage === "kontak") return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href="https://wa.me/6288973745596"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-colors pulse-gold"
          aria-label="Chat WhatsApp"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </motion.a>
      )}
    </AnimatePresence>
  );
}
