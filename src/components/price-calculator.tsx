"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  calculatePriceBreakdown,
  formatPrice,
  PPN_RATE,
  TRANSACTION_FEE,
  DP_MINIMAL,
} from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Calculator,
  Code2,
  Sparkles,
  CreditCard,
  FileText,
  Plus,
  ShieldCheck,
  ChevronRight,
  Mail,
  Search,
  Megaphone,
  Database,
  Info,
} from "lucide-react";

// ── Pricing Logic ──────────────────────────────────────────────
type Tech = "html" | "nextjs";

interface AddOn {
  id: string;
  name: string;
  price: number;
  icon: React.ElementType;
}

const addOns: AddOn[] = [
  { id: "admin-panel", name: "Admin Panel", price: 2_000_000, icon: Database },
  { id: "email-bisnis", name: "Email Bisnis", price: 500_000, icon: Mail },
  { id: "seo-website", name: "SEO + 4 Backlink Medium", price: 1_200_000, icon: Search },
  { id: "ads-setup", name: "Google / Meta Ads Setup", price: 350_000, icon: Megaphone },
];

function calculateBasePrice(tech: Tech, pages: number): number {
  if (tech === "html") {
    // Landing page = Rp600K
    // Pages 2-3: +Rp300K each
    // Pages 4+: +Rp150K each
    let price = 600_000;
    for (let i = 2; i <= pages; i++) {
      price += i <= 3 ? 300_000 : 150_000;
    }
    return price;
  }
  // Next.js
  // Landing = Rp1.5M
  // Page 2: +Rp500K
  // Pages 3-4: +Rp400K each
  // Pages 5+: +Rp200K each
  let price = 1_500_000;
  for (let i = 2; i <= pages; i++) {
    if (i === 2) price += 500_000;
    else if (i <= 4) price += 400_000;
    else price += 200_000;
  }
  return price;
}

// ── Animation Variants ─────────────────────────────────────────
const containerVariant = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const stepVariant = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

// ── Component ──────────────────────────────────────────────────
interface PriceCalculatorProps {
  onOrder: (packageName: string, price: number, category: string) => void;
}

export function PriceCalculator({ onOrder }: PriceCalculatorProps) {
  const [tech, setTech] = useState<Tech>("html");
  const [pages, setPages] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());

  // Derived
  const webBasePrice = useMemo(() => calculateBasePrice(tech, pages), [tech, pages]);
  const addOnsTotal = useMemo(
    () => addOns.filter((a) => selectedAddOns.has(a.id)).reduce((s, a) => s + a.price, 0),
    [selectedAddOns],
  );
  const basePrice = webBasePrice + addOnsTotal;

  const breakdown = useMemo(() => calculatePriceBreakdown(basePrice, true), [basePrice]);

  const techLabel = tech === "html" ? "HTML" : "Next.js";
  const packageLabel = `Website ${techLabel} ${pages} Halaman`;
  const category = tech;

  // Handlers
  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <motion.div
      variants={containerVariant}
      initial="hidden"
      animate="show"
    >
      <Card className="border-gold/20 overflow-hidden">
        {/* Header */}
        <div className="bg-navy dark:bg-navy-lighter px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center">
              <Calculator className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Kalkulator Harga
              </h3>
              <p className="text-sm text-white/60">
                Hitung estimasi biaya website Anda
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-8">
          {/* ── Step 1: Pilih Teknologi ─────────────────────── */}
          <motion.div variants={stepVariant} className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gold text-navy text-xs font-bold">
                1
              </span>
              <h4 className="font-semibold text-foreground">Pilih Teknologi</h4>
            </div>

            <RadioGroup
              value={tech}
              onValueChange={(v) => {
                setTech(v as Tech);
                setPages(1);
              }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {/* HTML Option */}
              <Label
                htmlFor="tech-html"
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  tech === "html"
                    ? "border-gold bg-gold/5 ring-1 ring-gold/20"
                    : "border-border hover:border-gold/30"
                }`}
              >
                <RadioGroupItem value="html" id="tech-html" />
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      tech === "html" ? "bg-gold/15" : "bg-muted"
                    }`}
                  >
                    <Code2
                      className={`w-5 h-5 ${
                        tech === "html" ? "text-gold" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">HTML</p>
                    <p className="text-xs text-muted-foreground">
                      Website statis, siap online cepat
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 ${
                    tech === "html" ? "text-gold" : "text-muted-foreground/40"
                  }`}
                />
              </Label>

              {/* Next.js Option */}
              <Label
                htmlFor="tech-nextjs"
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  tech === "nextjs"
                    ? "border-gold bg-gold/5 ring-1 ring-gold/20"
                    : "border-border hover:border-gold/30"
                }`}
              >
                <RadioGroupItem value="nextjs" id="tech-nextjs" />
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      tech === "nextjs" ? "bg-gold/15" : "bg-muted"
                    }`}
                  >
                    <Sparkles
                      className={`w-5 h-5 ${
                        tech === "nextjs" ? "text-gold" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Next.js</p>
                    <p className="text-xs text-muted-foreground">
                      Website premium, performa tinggi
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 ${
                    tech === "nextjs" ? "text-gold" : "text-muted-foreground/40"
                  }`}
                />
              </Label>
            </RadioGroup>
          </motion.div>

          <Separator />

          {/* ── Step 2: Jumlah Halaman ─────────────────────── */}
          <motion.div variants={stepVariant} className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gold text-navy text-xs font-bold">
                2
              </span>
              <h4 className="font-semibold text-foreground">Jumlah Halaman</h4>
            </div>

            {/* Price info per page */}
            <div className="flex items-center gap-2 p-3 bg-gold/5 border border-gold/20 rounded-lg text-sm">
              <Info className="w-4 h-4 text-gold shrink-0" />
              <span className="text-muted-foreground">
                {tech === "html" ? (
                  <>
                    Landing <strong className="text-gold">Rp600K</strong> &middot;
                    Hal 2-3: +<strong className="text-gold">Rp300K</strong>/hal &middot;
                    Hal 4+: +<strong className="text-gold">Rp150K</strong>/hal
                  </>
                ) : (
                  <>
                    Landing <strong className="text-gold">Rp1.5M</strong> &middot;
                    Hal 2: +<strong className="text-gold">Rp500K</strong> &middot;
                    Hal 3-4: +<strong className="text-gold">Rp400K</strong>/hal &middot;
                    Hal 5+: +<strong className="text-gold">Rp200K</strong>/hal
                  </>
                )}
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">
                  Jumlah halaman
                </Label>
                <span className="text-2xl font-bold text-gold">
                  {pages}
                </span>
              </div>

              <Slider
                min={1}
                max={10}
                step={1}
                value={[pages]}
                onValueChange={(v) => setPages(v[0])}
                className="w-full"
              />

              {/* Page markers */}
              <div className="flex justify-between px-0.5">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPages(n)}
                    className={`w-7 h-7 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center justify-center ${
                      pages === n
                        ? "bg-gold text-navy scale-110"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              {/* Quick summary */}
              <div className="flex items-center justify-between text-sm pt-1">
                <span className="text-muted-foreground">Harga website (tanpa fitur tambahan)</span>
                <span className="font-semibold text-foreground">
                  {formatPrice(webBasePrice)}
                </span>
              </div>
            </div>
          </motion.div>

          <Separator />

          {/* ── Step 3: Fitur Tambahan ─────────────────────── */}
          <motion.div variants={stepVariant} className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gold text-navy text-xs font-bold">
                3
              </span>
              <h4 className="font-semibold text-foreground">Fitur Tambahan</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addOns.map((addon) => {
                const Icon = addon.icon;
                const isSelected = selectedAddOns.has(addon.id);
                return (
                  <Label
                    key={addon.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-gold bg-gold/5 ring-1 ring-gold/20"
                        : "border-border hover:border-gold/30"
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleAddOn(addon.id)}
                      className="data-[state=checked]:bg-gold data-[state=checked]:border-gold data-[state=checked]:text-navy"
                    />
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        isSelected ? "bg-gold/15" : "bg-muted"
                      }`}
                    >
                      <Icon
                        className={`w-4.5 h-4.5 ${
                          isSelected ? "text-gold" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">
                        {addon.name}
                      </p>
                      <p className="text-xs text-gold font-semibold">
                        +{formatPrice(addon.price)}
                      </p>
                    </div>
                  </Label>
                );
              })}
            </div>
          </motion.div>

          <Separator />

          {/* ── Step 4: Estimasi Harga ─────────────────────── */}
          <motion.div variants={stepVariant} className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gold text-navy text-xs font-bold">
                4
              </span>
              <h4 className="font-semibold text-foreground">Estimasi Harga</h4>
            </div>

            {/* Package summary */}
            <div className="p-4 bg-muted/50 rounded-xl border space-y-2 text-sm">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gold" />
                <span className="font-semibold text-foreground">Ringkasan Pesanan</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{packageLabel}</span>
                <span className="font-medium text-foreground">{formatPrice(webBasePrice)}</span>
              </div>
              {addOns
                .filter((a) => selectedAddOns.has(a.id))
                .map((a) => (
                  <div key={a.id} className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Plus className="w-3 h-3" />
                      {a.name}
                    </span>
                    <span className="font-medium text-foreground">{formatPrice(a.price)}</span>
                  </div>
                ))}
            </div>

            {/* Full breakdown */}
            <div className="p-4 bg-navy dark:bg-navy-lighter rounded-xl text-white space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-gold" />
                <span className="font-semibold text-gold">Rincian Pembayaran</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-white/70">Harga dasar</span>
                <span className="font-medium">{formatPrice(breakdown.basePrice)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-white/70">
                  PPN {(PPN_RATE * 100).toFixed(0)}%
                </span>
                <span className="font-medium">
                  {formatPrice(breakdown.fullPPN)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-white/70">
                  Biaya transaksi
                </span>
                <span className="font-medium">{formatPrice(TRANSACTION_FEE)}</span>
              </div>

              <Separator className="bg-white/15" />

              <div className="flex justify-between font-bold">
                <span>Total pembayaran</span>
                <span className="text-gold text-lg">
                  {formatPrice(breakdown.fullTotal)}
                </span>
              </div>

              <Separator className="bg-white/15" />

              {/* DP Breakdown */}
              <div className="flex items-center gap-2 mt-2">
                <CreditCard className="w-4 h-4 text-gold" />
                <span className="font-semibold text-gold text-sm">Opsi DP (Down Payment)</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-white/70">DP minimal</span>
                <span className="font-medium">{formatPrice(breakdown.dpAmount)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-white/70">
                  PPN DP {(PPN_RATE * 100).toFixed(0)}%
                </span>
                <span className="font-medium">{formatPrice(breakdown.dpPPN)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-white/70">Biaya transaksi</span>
                <span className="font-medium">{formatPrice(TRANSACTION_FEE)}</span>
              </div>

              <div className="flex justify-between font-bold">
                <span>DP yang harus dibayar</span>
                <span className="text-gold">{formatPrice(breakdown.dpTotal)}</span>
              </div>

              <div className="flex justify-between text-xs text-white/50 mt-1">
                <span>Sisa pelunasan (setelah website selesai)</span>
                <span>{formatPrice(breakdown.sisaTotal)}</span>
              </div>
            </div>

            {/* CTA */}
            <Button
              size="lg"
              className="w-full bg-gold hover:bg-gold-hover text-navy font-semibold text-base"
              onClick={() => onOrder(packageLabel, basePrice, category)}
            >
              <CreditCard className="w-5 h-5" />
              Pesan Sekarang
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Harga estimasi dapat berubah sesuai kompleksitas project. Konsultasi gratis via WhatsApp.
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
