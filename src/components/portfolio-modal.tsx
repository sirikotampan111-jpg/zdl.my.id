"use client";

import { useState, useCallback } from "react";
import { PortfolioItem } from "@/lib/data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Globe, Tag, Loader2 } from "lucide-react";
import Image from "next/image";

interface PortfolioModalProps {
  portfolio: PortfolioItem | null;
  open: boolean;
  onClose: () => void;
}

export function PortfolioModal({
  portfolio,
  open,
  onClose,
}: PortfolioModalProps) {
  const [iframeLoading, setIframeLoading] = useState(true);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setIframeLoading(true);
      onClose();
    }
  };

  const handleIframeLoad = useCallback(() => {
    setIframeLoading(false);
  }, []);

  if (!portfolio) return null;

  // If livePreview is enabled, show the website in an iframe
  if (portfolio.livePreview && portfolio.url) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden flex flex-col">
          {/* Header bar */}
          <DialogHeader className="px-4 py-3 border-b shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gold/10 shrink-0">
                  <Globe className="w-4 h-4 text-gold" />
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-sm font-semibold truncate">
                    {portfolio.domain}
                  </DialogTitle>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge
                      variant="secondary"
                      className="bg-gold/10 text-gold border-gold/20 text-[10px] px-1.5 py-0"
                    >
                      <Tag className="w-2.5 h-2.5 mr-0.5" />
                      {portfolio.category}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      Live Preview
                    </span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-gold hover:bg-gold/90 text-navy font-semibold gap-1.5 shrink-0"
                onClick={() =>
                  window.open(portfolio.url, "_blank", "noopener")
                }
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Buka Website
              </Button>
            </div>
          </DialogHeader>

          {/* Browser-like address bar */}
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b shrink-0">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
              <div className="w-3 h-3 rounded-full bg-green-400/70" />
            </div>
            <div className="flex-1 flex items-center gap-2 bg-background rounded-md px-3 py-1 text-xs text-muted-foreground max-w-md mx-auto">
              <Globe className="w-3 h-3 shrink-0" />
              <span className="truncate">{portfolio.url}</span>
            </div>
          </div>

          {/* iframe container */}
          <div className="flex-1 relative bg-white">
            {iframeLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10">
                <Loader2 className="w-8 h-8 text-gold animate-spin mb-3" />
                <p className="text-sm text-muted-foreground">
                  Memuat website {portfolio.domain}...
                </p>
              </div>
            )}
            <iframe
              key={portfolio.id}
              src={portfolio.url}
              className="w-full h-full border-0"
              title={portfolio.domain}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              onLoad={handleIframeLoad}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Default: static image + description modal
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        {/* Image */}
        <div className="relative w-full h-56 sm:h-64 bg-muted">
          <Image
            src={portfolio.image}
            alt={portfolio.domain}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 512px"
          />
          <div
            className={`absolute inset-0 bg-gradient-to-t ${portfolio.gradient} opacity-20`}
          />
        </div>

        <div className="px-6 pb-6 pt-2 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {portfolio.domain}
            </DialogTitle>
          </DialogHeader>

          <p className="text-muted-foreground text-sm leading-relaxed">
            {portfolio.description}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant="secondary"
              className="bg-gold/10 text-gold border-gold/20"
            >
              <Tag className="w-3 h-3 mr-1" />
              {portfolio.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Globe className="w-3 h-3 mr-1" />
              {portfolio.domain}
            </Badge>
          </div>

          <Button
            className="w-full bg-gold hover:bg-gold/90 text-navy font-semibold"
            onClick={() => window.open(portfolio.url, "_blank", "noopener")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Kunjungi Website
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
