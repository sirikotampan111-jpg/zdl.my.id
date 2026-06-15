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
import { ExternalLink, Globe, Tag, Loader2, Monitor } from "lucide-react";
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
  // Default: show live screenshot (tampilan asli dari tautan)
  // User can switch to iframe with "Coba Live" button
  const [showIframe, setShowIframe] = useState(false);
  const [screenshotLoaded, setScreenshotLoaded] = useState(false);
  const [screenshotError, setScreenshotError] = useState(false);

  // Reset state when portfolio changes
  useEffect(() => {
    if (open) {
      setIframeState("loading");
      setShowIframe(false);
      setScreenshotLoaded(false);
      setScreenshotError(false);
    }
  }, [open, portfolio?.id]);

  // Set a timeout to detect if iframe can't load
  useEffect(() => {
    if (!open || !showIframe) return;

    const timer = setTimeout(() => {
      if (iframeState === "loading") {
        setIframeState("timeout");
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, [open, showIframe, iframeState]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setIframeState("loading");
      setShowIframe(false);
      setScreenshotLoaded(false);
      setScreenshotError(false);
      onClose();
    }
  };

  const handleIframeLoad = useCallback(() => {
    setIframeState("loaded");
  }, []);

  const handleIframeError = useCallback(() => {
    setIframeState("error");
  }, []);

  const handleTryLive = () => {
    setIframeState("loading");
    setShowIframe(true);
  };

  const handleBackToScreenshot = () => {
    setShowIframe(false);
  };

  if (!portfolio) return null;

  // Live screenshot URL from actual website
  const liveScreenshotUrl = `https://image.thum.io/get/width/1280/${portfolio.url}`;

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
                    {showIframe
                      ? iframeState === "loaded"
                        ? "Live Preview"
                        : "Memuat..."
                      : "Tampilan Asli dari Tautan"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {showIframe && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-8"
                  onClick={handleBackToScreenshot}
                >
                  Kembali ke Screenshot
                </Button>
              )}
              {!showIframe && portfolio.livePreview && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-8"
                  onClick={handleTryLive}
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
          {showIframe ? (
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
                  <Monitor className="w-12 h-12 text-amber-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Preview Langsung Tidak Tersedia</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                    Website {portfolio.domain} tidak dapat ditampilkan langsung karena pengaturan keamanan.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBackToScreenshot}
                    >
                      Kembali ke Screenshot
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gold hover:bg-gold/90 text-navy"
                      onClick={() =>
                        window.open(portfolio.url, "_blank", "noopener")
                      }
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Buka Website
                    </Button>
                  </div>
                </div>
              )}

              {/* Error state */}
              {iframeState === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10 p-6">
                  <Monitor className="w-12 h-12 text-amber-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Preview Langsung Gagal</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                    Website {portfolio.domain} memblokir preview langsung.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBackToScreenshot}
                    >
                      Kembali ke Screenshot
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gold hover:bg-gold/90 text-navy"
                      onClick={() =>
                        window.open(portfolio.url, "_blank", "noopener")
                      }
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
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
            /* Default: Live screenshot view — captured from actual website URL */
            <div className="flex items-center justify-center h-full bg-muted overflow-auto">
              {/* Loading state for screenshot */}
              {!screenshotLoaded && !screenshotError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted z-10">
                  <Loader2 className="w-8 h-8 text-gold animate-spin mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Mengambil tampilan dari {portfolio.domain}...
                  </p>
                </div>
              )}

              {/* Screenshot error */}
              {screenshotError && (
                <div className="flex flex-col items-center justify-center p-6">
                  <Monitor className="w-12 h-12 text-amber-500 mb-4" />
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Gagal mengambil tampilan dari {portfolio.domain}
                  </p>
                  <Button
                    size="sm"
                    className="bg-gold hover:bg-gold/90 text-navy font-semibold"
                    onClick={() =>
                      window.open(portfolio.url, "_blank", "noopener")
                    }
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Buka Website Langsung
                  </Button>
                </div>
              )}

              {/* The actual live screenshot from the website URL */}
              <div className="relative w-full h-full max-w-4xl mx-auto">
                <Image
                  src={liveScreenshotUrl}
                  alt={`Tampilan asli ${portfolio.domain}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 900px"
                  priority
                  unoptimized
                  onLoad={() => setScreenshotLoaded(true)}
                  onError={() => setScreenshotError(true)}
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
