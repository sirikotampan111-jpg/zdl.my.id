"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { PortfolioItem } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Globe,
  Tag,
  Loader2,
  AlertTriangle,
  Monitor,
} from "lucide-react";

interface LivePreviewCardProps {
  portfolio: PortfolioItem;
  onClick: () => void;
  height?: string;
}

/**
 * LivePreviewCard — Shows a real website inside an iframe card.
 * No AI-generated images, only the actual live website preview.
 * Falls back gracefully if iframe is blocked by the target website.
 */
export function LivePreviewCard({
  portfolio,
  onClick,
  height = "h-56",
}: LivePreviewCardProps) {
  const [iframeState, setIframeState] = useState<
    "loading" | "loaded" | "error" | "timeout"
  >("loading");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set a timeout to detect blocked iframes
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (iframeState === "loading") {
        setIframeState("timeout");
      }
    }, 12000); // 12 seconds timeout

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [iframeState]);

  const handleLoad = useCallback(() => {
    setIframeState("loaded");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const handleError = useCallback(() => {
    setIframeState("error");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const isProblematic = iframeState === "error" || iframeState === "timeout";

  return (
    <Card
      className="overflow-hidden group hover:border-gold/50 transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Live Preview Area */}
      <div className={`relative ${height} overflow-hidden bg-muted`}>
        {/* Loading state */}
        {iframeState === "loading" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-muted">
            <Loader2 className="w-6 h-6 text-gold animate-spin mb-2" />
            <p className="text-xs text-muted-foreground">
              Memuat {portfolio.domain}...
            </p>
          </div>
        )}

        {/* Error / Timeout fallback */}
        {isProblematic && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-muted p-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3">
              {iframeState === "error" ? (
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              ) : (
                <Monitor className="w-5 h-5 text-amber-500" />
              )}
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              {portfolio.domain}
            </p>
            <p className="text-[10px] text-muted-foreground text-center mb-3">
              Preview tidak tersedia. Klik untuk buka website langsung.
            </p>
            <Button
              size="sm"
              className="bg-gold hover:bg-gold/90 text-navy text-xs h-7"
              onClick={(e) => {
                e.stopPropagation();
                window.open(portfolio.url, "_blank", "noopener");
              }}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Buka Website
            </Button>
          </div>
        )}

        {/* Live iframe — the actual website */}
        <iframe
          ref={iframeRef}
          src={portfolio.url}
          className="w-full h-full border-0 pointer-events-none group-hover:pointer-events-auto"
          style={{
            transform: "scale(1)",
            transformOrigin: "top left",
            // Scale down to show a mini version of the full website
            width: "1280px",
            height: "900px",
            transform: `scale(${1 / 2.2})`,
          }}
          title={portfolio.domain}
          sandbox="allow-scripts allow-same-origin allow-popups"
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center z-30 pointer-events-none">
          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium text-sm bg-black/50 px-3 py-1.5 rounded-full">
            <Globe className="w-3.5 h-3.5 inline mr-1" />
            Lihat Detail
          </span>
        </div>

        {/* Live badge */}
        {iframeState === "loaded" && (
          <div className="absolute top-2 right-2 z-30">
            <span className="flex items-center gap-1 bg-green-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </span>
          </div>
        )}
      </div>

      {/* Card footer */}
      <CardContent className="pt-3 pb-3 flex items-center justify-between">
        <Badge
          variant="secondary"
          className="bg-gold/10 text-gold border-gold/20 text-[10px]"
        >
          <Tag className="w-2.5 h-2.5 mr-0.5" />
          {portfolio.category}
        </Badge>
        <span className="text-[11px] text-muted-foreground font-mono">
          {portfolio.domain}
        </span>
      </CardContent>
    </Card>
  );
}
