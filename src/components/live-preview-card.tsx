"use client";

import { PortfolioItem } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Tag } from "lucide-react";
import Image from "next/image";

interface LivePreviewCardProps {
  portfolio: PortfolioItem;
  onClick: () => void;
  height?: string;
}

/**
 * LivePreviewCard — Shows a real screenshot of the website (not AI-generated).
 * The screenshot is an actual capture of the live website.
 * Clicking opens a modal with live iframe preview or direct link.
 */
export function LivePreviewCard({
  portfolio,
  onClick,
  height = "h-56",
}: LivePreviewCardProps) {
  return (
    <Card
      className="overflow-hidden group hover:border-gold/50 transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Screenshot Area */}
      <div className={`relative ${height} overflow-hidden bg-muted`}>
        {/* Real website screenshot */}
        <Image
          src={portfolio.image}
          alt={`Screenshot ${portfolio.domain}`}
          fill
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Gradient overlay at bottom for readability */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center z-30 pointer-events-none">
          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium text-sm bg-black/50 px-3 py-1.5 rounded-full">
            <Globe className="w-3.5 h-3.5 inline mr-1" />
            Lihat Detail
          </span>
        </div>

        {/* LIVE badge */}
        {portfolio.livePreview && (
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
          Klik untuk preview
        </span>
      </CardContent>
    </Card>
  );
}
