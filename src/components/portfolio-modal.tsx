"use client";

import { useState, useCallback, useEffect } from "react";
import { PortfolioItem } from "@/lib/data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Globe, Tag, Loader2, AlertTriangle, RefreshCw, Monitor } from "lucide-react";
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
  const [iframeState, setIframeState] = useState<
    "loading" | "loaded" | "error" | "timeout"
  >("loading");
  // Show iframe or screenshot in modal
  const [showIframe, setShowIframe] = useState(true);

  // Reset state when portfolio changes
  useEffect(() => {
    if (open) {
      setIframeState("loading");
      setShowIframe(true);
    }
  }, [open, portfolio?.id]);

  // Set a timeout to detect if iframe can't load (e.g., X-Frame-Options blocking)
  useEffect(() => {
    if (!open || !portfolio?.livePreview || !showIframe) return;

    const timer = setTimeout(() => {
      if (iframeState === "loading") {
        setIframeState("timeout");
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, [open, portfolio?.livePreview, portfolio?.id, showIframe, iframeState]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setIframeState("loading");
      setShowIframe(true);
      onClose();
    }
  };

  const handleIframeLoad = useCallback(() => {
    setIframeState("loaded");
  }, []);

  const handleIframeError = useCallback(() => {
    setIframeState("error");
  }, []);

  const handleRetry = () => {
    setIframeState("loading");
    setShowIframe(true);
  };

  const handleShowScreenshot = () => {
    setShowIframe(false);
  };

  if (!portfolio) return null;

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
                    {showIframe ? "Live Preview" : "Screenshot"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {portfolio.livePreview && !showIframe && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-8"
                  onClick={handleRetry}
                >
                  <Monitor className="w-3 h-3 mr-1" />
                  Coba Live
                </Button>
              )}
              <Button
                size="sm"
                className="bg-gold hover:bg-gold/90 text-navy font-semibold gap-1.5"
                onClick={() =>
                  window.open(portfolio.url, "_blank", "noopener")
                }
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Buka Website
              </Button>
            </div>
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

        {/* Content area */}
        <div className="flex-1 relative bg-white overflow-hidden">
          {showIframe && portfolio.livePreview ? (
            <>
              {/* Loading state */}
              {iframeState === "loading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10">
                  <Loader2 className="w-8 h-8 text-gold animate-spin mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Memuat website {portfolio.domain}...
                  </p>
                </div>
              )}

              {/* Timeout state */}
              {iframeState === "timeout" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10 p-6">
                  <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                    <Monitor className="w-7 h-7 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Website Membutuhkan Waktu Lama</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                    Website {portfolio.domain} membutuhkan waktu lama untuk dimuat. Beberapa website mungkin tidak dapat ditampilkan langsung di sini karena pengaturan keamanan.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRetry}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Coba Lagi
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleShowScreenshot}
                    >
                      Lihat Screenshot
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gold hover:bg-gold/90 text-navy"
                      onClick={() =>
                        window.open(portfolio.url, "_blank", "noopener")
                      }
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Buka di Tab Baru
                    </Button>
                  </div>
                </div>
              )}

              {/* Error state - iframe blocked */}
              {iframeState === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10 p-6">
                  <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Tidak Dapat Memuat Preview</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                    Website {portfolio.domain} tidak dapat ditampilkan langsung di sini karena pengaturan keamanan website tersebut.
                  </p>
                  <p className="text-xs text-muted-foreground text-center max-w-sm mb-5">
                    {portfolio.description}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleShowScreenshot}
                    >
                      Lihat Screenshot
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRetry}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Coba Lagi
                    </Button>
                    <Button
                      className="bg-gold hover:bg-gold/90 text-navy font-semibold"
                      onClick={() =>
                        window.open(portfolio.url, "_blank", "noopener")
                      }
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Buka Website
                    </Button>
                  </div>
                </div>
              )}

              {/* Live iframe */}
              <iframe
                key={portfolio.id}
                src={portfolio.url}
                className="w-full h-full border-0"
                title={portfolio.domain}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
              />
            </>
          ) : (
            /* Screenshot view — shows the real website screenshot */
            <div className="flex items-center justify-center h-full bg-muted p-4 overflow-auto">
              <div className="relative w-full max-w-4xl mx-auto" style={{ aspectRatio: "16/10" }}>
                <Image
                  src={portfolio.image}
                  alt={`Screenshot ${portfolio.domain}`}
                  fill
                  className="object-contain rounded-lg shadow-lg"
                  sizes="(max-width: 1024px) 100vw, 900px"
                  priority
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom description bar */}
        <div className="px-4 py-2 border-t bg-muted/30 shrink-0">
          <p className="text-xs text-muted-foreground text-center">
            {portfolio.description}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
