"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  formatPrice,
  calculatePriceBreakdown,
} from "@/lib/data";
import {
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  LogIn,
  CheckCircle2,
  Loader2,
  Package,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { WHATSAPP_LINK } from "@/lib/config";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  packageName: string;
  packagePrice: number;
  packageCategory: string;
}

const paymentMethods = [
  { id: "qris", label: "QRIS", icon: QrCode, desc: "Scan QR untuk bayar" },
  {
    id: "bank",
    label: "Transfer Bank",
    icon: Building2,
    desc: "BCA, BNI, BRI, Mandiri",
  },
  {
    id: "ewallet",
    label: "E-Wallet",
    icon: Wallet,
    desc: "GoPay, OVO, DANA, ShopeePay",
  },
  {
    id: "cc",
    label: "Kartu Kredit",
    icon: CreditCard,
    desc: "Visa, Mastercard",
  },
];

export function CheckoutModal({
  open,
  onClose,
  packageName,
  packagePrice,
  packageCategory,
}: CheckoutModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [payAmount, setPayAmount] = useState(0);

  // Form state
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [phone, setPhone] = useState("");
  const [business, setBusiness] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  // Price calculation
  const breakdown = calculatePriceBreakdown(
    packagePrice,
    packageCategory === "html" || packageCategory === "nextjs"
  );

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  const resetAndClose = () => {
    setStep(1);
    setName(session?.user?.name || "");
    setEmail(session?.user?.email || "");
    setPhone("");
    setBusiness("");
    setNotes("");
    setPaymentMethod("");
    setOrderId("");
    setPayAmount(0);
    setLoading(false);
    onClose();
  };

  const handleCheckout = async () => {
    if (!name || !email || !phone) {
      toast.error("Lengkapi data pemesan");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/midtrans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageName,
          packagePrice,
          packageCategory,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          businessName: business,
          notes,
          paymentMethod,
          userId: (session?.user as Record<string, unknown>)?.id || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal membuat transaksi");
        setLoading(false);
        return;
      }

      setOrderId(data.orderId);
      setPayAmount(data.payAmount);

      if (data.isDemo) {
        // Demo mode - simulate payment
        toast.success("Demo: Transaksi berhasil disimulasikan!");
        setStep(3);
      } else if (
        data.token &&
        typeof window !== "undefined" &&
        (window as unknown as Record<string, unknown>).snap
      ) {
        // Real Midtrans Snap
        const snap = (window as unknown as Record<string, Record<string, (...args: unknown[]) => void>>).snap;
        snap.pay(data.token, {
          onSuccess: () => {
            toast.success("Pembayaran berhasil!");
            setStep(3);
          },
          onPending: () => {
            toast.info("Pembayaran pending. Cek dashboard Anda.");
            setStep(3);
          },
          onError: () => {
            toast.error("Pembayaran gagal. Coba lagi.");
          },
          onClose: () => {
            toast.info("Anda menutup halaman pembayaran.");
          },
        });
      } else if (data.redirect_url) {
        // Fallback: open Midtrans payment page in new tab if Snap JS not loaded
        window.open(data.redirect_url, "_blank");
        setStep(3);
      } else {
        toast.error("Gagal memuat halaman pembayaran. Coba lagi.");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => resetAndClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-gold" />
            Checkout — {packageName}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Price Breakdown */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Harga Paket</span>
                  <span>{formatPrice(breakdown.basePrice)}</span>
                </div>
                {breakdown.isDP && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">DP Minimal</span>
                    <span className="font-medium">
                      {formatPrice(breakdown.dpAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">PPN 11%</span>
                  <span>{formatPrice(breakdown.ppn)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Biaya Transaksi</span>
                  <span>{formatPrice(breakdown.transactionFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total Bayar</span>
                  <span className="text-gold">
                    {formatPrice(breakdown.total)}
                  </span>
                </div>
                {breakdown.isDP && (
                  <p className="text-xs text-muted-foreground">
                    DP dari {formatPrice(breakdown.basePrice)}. Sisa pelunasan:{" "}
                    {formatPrice(breakdown.basePrice - breakdown.dpAmount)}
                  </p>
                )}
              </div>

              {/* Login required - mandatory */}
              {!session ? (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800/30 rounded-xl flex items-center justify-center shrink-0">
                      <LogIn className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                        Login wajib untuk checkout
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Masuk dengan Gmail untuk melanjutkan pemesanan
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => signIn("google")}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login dengan Gmail
                  </Button>
                </div>
              ) : (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-800/30 rounded-lg flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Login sebagai {session.user?.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-3">
                <div>
                  <Label>Nama Lengkap *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Anda"
                  />
                </div>
                <div>
                  <Label>Nama Bisnis</Label>
                  <Input
                    value={business}
                    onChange={(e) => setBusiness(e.target.value)}
                    placeholder="Opsional"
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@contoh.com"
                  />
                </div>
                <div>
                  <Label>WhatsApp *</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08xx"
                  />
                </div>
                <div>
                  <Label>Catatan Project</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Deskripsi singkat project Anda..."
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    if (!session) {
                      toast.error("Silakan login terlebih dahulu", {
                        action: {
                          label: "Login Gmail",
                          onClick: () => signIn("google"),
                        },
                      });
                      return;
                    }
                    if (!name || !email || !phone) {
                      toast.error("Lengkapi data wajib (*)");
                      return;
                    }
                    setStep(2);
                  }}
                  className="bg-gold hover:bg-gold-hover text-navy"
                >
                  Lanjut Bayar <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Kembali
              </Button>
              <h3 className="font-semibold">Pilih Metode Pembayaran</h3>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      paymentMethod === pm.id
                        ? "border-gold bg-gold/5"
                        : "border-muted hover:border-gold/30"
                    }`}
                  >
                    <pm.icon
                      className={`w-5 h-5 mb-2 ${
                        paymentMethod === pm.id
                          ? "text-gold"
                          : "text-muted-foreground"
                      }`}
                    />
                    <p className="text-sm font-medium">{pm.label}</p>
                    <p className="text-xs text-muted-foreground">{pm.desc}</p>
                  </button>
                ))}
              </div>
              {paymentMethod && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Paket</span>
                    <span>{packageName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Invoice</span>
                    <span className="font-mono text-gold">
                      {orderId || "ZDL-..."}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-gold">
                      {formatPrice(breakdown.total)}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                <span>Transaksi aman & terenkripsi</span>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full bg-gold hover:bg-gold-hover text-navy font-semibold"
                disabled={!paymentMethod || loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CreditCard className="w-4 h-4 mr-2" />
                )}{" "}
                Bayar {formatPrice(breakdown.total)}
              </Button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4 py-4"
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold">Pesanan Berhasil!</h3>
              <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-1 text-left">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice</span>
                  <span className="font-mono font-bold text-gold">
                    {orderId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paket</span>
                  <span>{packageName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold">
                    {formatPrice(payAmount || breakdown.total)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {session && (
                  <Button
                    onClick={() => {
                      resetAndClose();
                      router.push("/dashboard");
                    }}
                    className="flex-1 bg-gold hover:bg-gold-hover text-navy"
                  >
                    Lihat Dashboard
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(WHATSAPP_LINK, "_blank")
                  }
                  className="flex-1"
                >
                  Konfirmasi via WA
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
