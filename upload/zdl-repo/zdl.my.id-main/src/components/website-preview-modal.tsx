"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ExternalLink, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PortfolioItem } from "@/lib/data";

interface WebsitePreviewModalProps {
  portfolio: PortfolioItem | null;
  open: boolean;
  onClose: () => void;
}

export function WebsitePreviewModal({
  portfolio,
  open,
  onClose,
}: WebsitePreviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleIframeLoad = useCallback(() => {
    setLoading(false);
    setError(false);
  }, []);

  const handleIframeError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  // Reset state when portfolio changes
  const resetState = useCallback(() => {
    setLoading(true);
    setError(false);
  }, []);

  // Call reset when opening with new portfolio
  if (open && portfolio) {
    // We track previous portfolio to reset loading
  }

  return (
    <AnimatePresence>
      {open && portfolio && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          {/* Top bar */}
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur border-b border-border shrink-0"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gold/10 shrink-0">
                <Globe className="w-4 h-4 text-gold" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate">
                  {portfolio.domain}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {portfolio.category} — Zheng Digital Lab
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {portfolio.url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(portfolio.url, "_blank", "noopener")
                  }
                  className="gap-1.5 text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka Tab Baru
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="gap-1.5 text-xs"
              >
                <X className="w-4 h-4" />
                Tutup
              </Button>
            </div>
          </motion.div>

          {/* Browser-like frame */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className="flex-1 mx-2 mb-2 mt-1 rounded-xl overflow-hidden border border-border bg-background relative"
          >
            {/* Browser chrome bar */}
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border shrink-0">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                <div className="w-3 h-3 rounded-full bg-green-400/70" />
              </div>
              <div className="flex-1 flex items-center gap-2 bg-background rounded-md px-3 py-1 text-xs text-muted-foreground max-w-md mx-auto">
                <Globe className="w-3 h-3 shrink-0" />
                <span className="truncate">{portfolio.url || portfolio.domain}</span>
              </div>
            </div>

            {/* iframe or fallback */}
            {portfolio.url ? (
              <div className="relative w-full" style={{ height: "calc(100% - 36px)" }}>
                {loading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10">
                    <Loader2 className="w-8 h-8 text-gold animate-spin mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Memuat website {portfolio.domain}...
                    </p>
                  </div>
                )}
                {error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10">
                    <Globe className="w-12 h-12 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Website tidak dapat dimuat di preview
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(portfolio.url!, "_blank", "noopener")
                      }
                      className="gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Buka di Tab Baru
                    </Button>
                  </div>
                )}
                <iframe
                  key={portfolio.id}
                  src={portfolio.url}
                  className="w-full h-full border-0"
                  title={portfolio.domain}
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div
                  className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${portfolio.gradient} flex items-center justify-center mb-4`}
                >
                  <Globe className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {portfolio.domain}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Website sedang dalam proses pengembangan dan belum bisa
                  ditampilkan. Nantikan update selanjutnya!
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
