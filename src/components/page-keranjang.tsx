"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useStore, CartItem } from "@/store/use-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  formatPrice,
  calculatePriceBreakdown,
  PPN_RATE,
  TRANSACTION_FEE,
  DP_MINIMAL,
} from "@/lib/data";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  LogIn,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Package,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { WHATSAPP_LINK } from "@/lib/config";

const paymentMethods = [
  { id: "qris", label: "QRIS", icon: QrCode, desc: "Scan QR untuk bayar" },
  { id: "bank", label: "Transfer Bank", icon: Building2, desc: "BCA, BNI, BRI, Mandiri" },
  { id: "ewallet", label: "E-Wallet", icon: Wallet, desc: "GoPay, OVO, DANA, ShopeePay" },
  { id: "cc", label: "Kartu Kredit", icon: CreditCard, desc: "Visa, Mastercard" },
];

function CartItemRow({
  item,
  onUpdateQty,
  onRemove,
}: {
  item: CartItem;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const isDPEligible = item.category === "html" || item.category === "nextjs";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      className="flex items-center gap-4 p-4 bg-card rounded-xl border hover:border-gold/30 transition-colors"
    >
      {/* Icon */}
      <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center shrink-0">
        <Package className="w-6 h-6 text-gold" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
        <p className="text-sm text-muted-foreground">
          {formatPrice(item.price)} per item
          {isDPEligible && (
            <span className="text-gold ml-1">• DP {formatPrice(DP_MINIMAL)}</span>
          )}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateQty(item.id, item.quantity - 1)}
          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-8 text-center font-semibold text-foreground">{item.quantity}</span>
        <button
          onClick={() => onUpdateQty(item.id, item.quantity + 1)}
          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-right w-32 shrink-0">
        <p className="font-bold text-foreground">{formatPrice(item.price * item.quantity)}</p>
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(item.id)}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function PageKeranjang() {
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal } = useStore();
  const { data: session } = useSession();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1=cart, 2=checkout, 3=success
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [payAmount, setPayAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");

  // Form
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [phone, setPhone] = useState("");
  const [business, setBusiness] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  const total = getCartTotal();
  const hasDPEligible = cart.some(
    (item) => item.category === "html" || item.category === "nextjs"
  );
  const dpBase = hasDPEligible ? DP_MINIMAL : total;
  const ppnAmount = Math.round(dpBase * PPN_RATE);
  const grandTotal = dpBase + ppnAmount + TRANSACTION_FEE;

  const handleCheckout = async () => {
    if (!name || !email || !phone) {
      toast.error("Lengkapi data pemesan");
      return;
    }
    if (!paymentMethod) {
      toast.error("Pilih metode pembayaran");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/midtrans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            category: item.category,
            quantity: item.quantity,
          })),
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
        toast.success("Demo: Transaksi berhasil disimulasikan!");
        clearCart();
        setStep(3);
      } else if (
        data.token &&
        typeof window !== "undefined" &&
        (window as unknown as Record<string, unknown>).snap
      ) {
        const snap = (window as unknown as Record<string, Record<string, (...args: unknown[]) => void>>).snap;
        snap.pay(data.token, {
          onSuccess: () => {
            toast.success("Pembayaran berhasil!");
            clearCart();
            setStep(3);
          },
          onPending: () => {
            toast.info("Pembayaran pending. Cek dashboard Anda.");
            clearCart();
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
        clearCart();
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

  // Empty cart
  if (cart.length === 0 && step !== 3) {
    return (
      <section className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gold" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Keranjang Kosong
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Belum ada layanan yang ditambahkan. Pilih paket layanan kami dan mulai
              bangun website impian Anda!
            </p>
            <Button
              onClick={() => {
                useStore.getState().setCurrentPage("layanan");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="bg-gold hover:bg-gold-hover text-navy font-semibold"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Lihat Layanan
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            <ShoppingCart className="w-8 h-8 inline mr-2 text-gold" />
            Keranjang <span className="gold-gradient-text">Belanja</span>
          </h1>
          <p className="text-muted-foreground">
            {step === 1 && "Review pesanan Anda sebelum checkout"}
            {step === 2 && "Lengkapi data dan pilih metode pembayaran"}
            {step === 3 && "Pesanan berhasil dibuat!"}
          </p>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[
            { n: 1, label: "Keranjang" },
            { n: 2, label: "Checkout" },
            { n: 3, label: "Selesai" },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step >= s.n
                    ? "bg-gold text-navy"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s.n}
              </div>
              <span
                className={`text-sm font-medium hidden sm:inline ${
                  step >= s.n ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
              {i < 2 && (
                <div
                  className={`w-8 h-0.5 mx-1 ${
                    step > s.n ? "bg-gold" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Cart Items */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">
                    {cart.length} item dalam keranjang
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      clearCart();
                      toast.success("Keranjang dikosongkan");
                    }}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Kosongkan
                  </Button>
                </div>
                <AnimatePresence>
                  {cart.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      onUpdateQty={updateQuantity}
                      onRemove={(id) => {
                        removeFromCart(id);
                        toast.success("Item dihapus dari keranjang");
                      }}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Order Summary */}
              <div>
                <Card className="border-gold/20 sticky top-24">
                  <CardContent className="pt-6 space-y-4">
                    <h3 className="font-bold text-foreground text-lg">
                      Ringkasan Pesanan
                    </h3>
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-muted-foreground truncate max-w-[60%]">
                            {item.name} x{item.quantity}
                          </span>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    {hasDPEligible && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">DP Minimal</span>
                        <span className="font-medium text-gold">
                          {formatPrice(dpBase)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">PPN 11%</span>
                      <span>{formatPrice(ppnAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Biaya Transaksi</span>
                      <span>{formatPrice(TRANSACTION_FEE)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Bayar</span>
                      <span className="text-gold">{formatPrice(grandTotal)}</span>
                    </div>
                    {hasDPEligible && (
                      <p className="text-xs text-muted-foreground">
                        DP dari {formatPrice(total)}. Sisa pelunasan setelah website selesai.
                      </p>
                    )}
                    <Button
                      onClick={() => setStep(2)}
                      className="w-full bg-gold hover:bg-gold-hover text-navy font-semibold"
                      disabled={cart.length === 0}
                    >
                      Checkout <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Step 2: Checkout Form + Payment */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Keranjang
              </Button>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Customer Info */}
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <h3 className="font-bold text-foreground text-lg">
                        Data Pemesan
                      </h3>

                      {/* Guest login prompt */}
                      {!session && (
                        <div className="bg-gold/5 border border-gold/20 rounded-lg p-3 flex items-center gap-3">
                          <LogIn className="w-5 h-5 text-gold shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              Login untuk tracking pesanan
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Atau lanjutkan sebagai tamu
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => signIn("google")}
                            className="text-gold border-gold/30"
                          >
                            Login
                          </Button>
                        </div>
                      )}

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
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Items Summary */}
                  <Card>
                    <CardContent className="pt-6 space-y-2">
                      <h3 className="font-bold text-foreground">Pesanan Anda</h3>
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm py-1"
                        >
                          <span className="text-muted-foreground">
                            {item.name} x{item.quantity}
                          </span>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Total Bayar</span>
                        <span className="text-gold">{formatPrice(grandTotal)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right: Payment Method */}
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <h3 className="font-bold text-foreground text-lg">
                        Pilih Metode Pembayaran
                      </h3>
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
                            <p className="text-xs text-muted-foreground">
                              {pm.desc}
                            </p>
                          </button>
                        ))}
                      </div>

                      {/* Price summary */}
                      {paymentMethod && (
                        <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{formatPrice(total)}</span>
                          </div>
                          {hasDPEligible && (
                            <div className="flex justify-between">
                              <span>DP Minimal</span>
                              <span className="text-gold">{formatPrice(dpBase)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>PPN 11%</span>
                            <span>{formatPrice(ppnAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Biaya Transaksi</span>
                            <span>{formatPrice(TRANSACTION_FEE)}</span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between font-bold text-base">
                            <span>Total Bayar</span>
                            <span className="text-gold">
                              {formatPrice(grandTotal)}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                        <span>Transaksi aman & terenkripsi via Midtrans</span>
                      </div>

                      <Button
                        onClick={handleCheckout}
                        className="w-full bg-gold hover:bg-gold-hover text-navy font-semibold h-12 text-base"
                        disabled={!paymentMethod || loading}
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                          <CreditCard className="w-5 h-5 mr-2" />
                        )}
                        Bayar {formatPrice(grandTotal)}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Pesanan Berhasil!
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Terima kasih atas pesanan Anda. Kami akan segera memproses pesanan Anda.
              </p>
              <Card className="max-w-md mx-auto mb-8">
                <CardContent className="pt-6 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Invoice</span>
                    <span className="font-mono font-bold text-gold">{orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold">
                      {formatPrice(payAmount || grandTotal)}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <div className="flex gap-3 justify-center">
                {session && (
                  <Button
                    onClick={() => router.push("/dashboard")}
                    className="bg-gold hover:bg-gold-hover text-navy font-semibold"
                  >
                    Lihat Dashboard
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => window.open(WHATSAPP_LINK, "_blank")}
                >
                  Konfirmasi via WA
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
