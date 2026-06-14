"use client";

import { PortfolioItem } from "@/lib/data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Globe, Tag } from "lucide-react";
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
  if (!portfolio) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
