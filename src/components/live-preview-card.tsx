"use client";

import { useState, useCallback } from "react";
import { PortfolioItem } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Tag, AlertTriangle, ExternalLink } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface LivePreviewCardProps {
  portfolio: PortfolioItem;
  onClick: () => void;
  height?: string;
}

/**
 * LivePreviewCard — Shows the ACTUAL live website screenshot captured from the URL.
 * Uses image.thum.io to capture real-time website appearance.
 * Not AI-generated — this is the real tampilan from the website's tautan.
 */
export function LivePreviewCard({
  portfolio,
  onClick,
  height = "h-56",
}: LivePreviewCardProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);

  // Generate live screenshot URL from the actual website URL
  const liveScreenshotUrl = `https://image.thum.io/get/width/1280/crop/800/${portfolio.url}`;

  const handleImgLoad = useCallback(() => {
    setImgLoading(false);
  }, []);

  const handleImgError = useCallback(() => {
    setImgError(true);
    setImgLoading(false);
  }, []);

  return (
    <Card
      className="overflow-hidden group hover:border-gold/50 transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Preview Area */}
      <div className={`relative ${height} overflow-hidden bg-muted`}>
        {/* Loading state */}
        {imgLoading && !imgError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-muted">
            <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mb-2" />
            <p className="text-[11px] text-muted-foreground">
              Memuat dari {portfolio.domain}...
            </p>
          </div>
        )}

        {/* Error fallback — use local screenshot */}
        {imgError ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-muted p-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 mb-2" />
            <p className="text-xs font-medium text-foreground mb-1">
              {portfolio.domain}
            </p>
            <p className="text-[10px] text-muted-foreground text-center mb-2">
              Preview live gagal dimuat
            </p>
            <Button
              size="sm"
              className="bg-gold hover:bg-gold/90 text-navy text-[10px] h-6 px-2"
              onClick={(e) => {
                e.stopPropagation();
                window.open(portfolio.url, "_blank", "noopener");
              }}
            >
              <ExternalLink className="w-2.5 h-2.5 mr-1" />
              Buka Website
            </Button>
          </div>
        ) : (
          /* Live screenshot from actual website URL */
          <Image
            src={liveScreenshotUrl}
            alt={`Tampilan asli ${portfolio.domain}`}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onLoad={handleImgLoad}
            onError={handleImgError}
            unoptimized
          />
        )}

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center z-30 pointer-events-none">
          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium text-sm bg-black/50 px-3 py-1.5 rounded-full">
            <Globe className="w-3.5 h-3.5 inline mr-1" />
            Lihat Detail
          </span>
        </div>

        {/* LIVE badge */}
        {portfolio.livePreview && !imgError && (
          <div className="absolute top-2 right-2 z-30">
            <span className="flex items-center gap-1 bg-green-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </span>
          </div>
        )}

        {/* Domain label at bottom */}
        <div className="absolute bottom-2 left-2 z-30">
          <span className="bg-black/50 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-sm">
            {portfolio.domain}
          </span>
        </div>
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
        <span className="text-[10px] text-muted-foreground">
          Tampilan asli dari tautan
        </span>
      </CardContent>
    </Card>
  );
}
