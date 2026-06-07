"use client";

import { motion } from "framer-motion";

export function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-navy flex flex-col items-center justify-center"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden">
          <img
            src="/favicon.png"
            alt="ZDL"
            className="w-full h-full object-contain"
          />
        </div>
        <span className="font-bold text-3xl text-white">
          Zheng<span className="text-gold">DigitalLab</span>
        </span>
      </motion.div>

      {/* Loading bar */}
      <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gold rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      </div>

      {/* Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-white/50 text-sm mt-4"
      >
        Loading...
      </motion.p>
    </motion.div>
  );
}
