"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/use-store";
import { formatPrice, generateInvoiceNumber } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function PageKeranjang() {
  const { cart, removeFromCart, updateQuantity, getTotal, clearCart } = useStore();
  const [nama, setNama] = useState("");
  const [namaBisnis, setNamaBisnis] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [catatan, setCatatan] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [showSuccess, setShowSuccess] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const total = getTotal();

  const handleSubmit = () => {
    // Validation
    if (!nama.trim()) {
      toast.error("Nama harus diisi");
      return;
    }
    if (!namaBisnis.trim()) {
      toast.error("Nama Bisnis harus diisi");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Email tidak valid");
      return;
    }
    if (!whatsapp.trim()) {
      toast.error("WhatsApp harus diisi");
      return;
    }
    if (cart.length === 0) {
      toast.error("Keranjang kosong");
      return;
    }

    // Generate invoice
    const invoice = generateInvoiceNumber();
    setInvoiceNumber(invoice);

    // Build WhatsApp message
    const itemsList = cart
      .map((item) => `- ${item.name} x${item.quantity} (${formatPrice(item.price * item.quantity)})`)
      .join("\n");

    const message = `Halo Zheng Digital Lab,

Saya ingin memesan layanan website.

Nama: ${nama}
Nama Bisnis: ${namaBisnis}
Paket:
${itemsList}
Total: Rp ${total.toLocaleString("id-ID")}
Catatan: ${catatan || "-"}

Mohon informasi proses selanjutnya.`;

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/6288973745596?text=${encodedMessage}`;

    // Open WhatsApp
    window.open(waUrl, "_blank");

    // Show success dialog
    setShowSuccess(true);

    // Clear cart and form
    clearCart();
    setNama("");
    setNamaBisnis("");
    setEmail("");
    setWhatsapp("");
    setCatatan("");
  };

  // Empty cart state
  if (cart.length === 0 && !showSuccess) {
    return (
      <section className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
          >
            <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Keranjang Kosong
            </h2>
            <p className="text-muted-foreground mb-6">
              Belum ada layanan yang ditambahkan. Pilih paket layanan yang sesuai
              dengan kebutuhan Anda.
            </p>
            <Button
              className="bg-gold hover:bg-gold-hover text-navy"
              onClick={() => {
                useStore.getState().setCurrentPage("layanan");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Lihat Paket Layanan
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Keranjang <span className="gold-gradient-text">Pesanan</span>
          </h1>
          <p className="text-muted-foreground">
            Review pesanan Anda dan lengkapi form untuk melanjutkan checkout.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((cartItem) => (
              <motion.div
                key={cartItem.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 p-4 bg-card rounded-xl border"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {cartItem.name}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {cartItem.category === "html"
                      ? "HTML"
                      : cartItem.category === "nextjs"
                        ? "Next.js"
                        : cartItem.category === "admin"
                          ? "Admin Panel"
                          : "Layanan Tambahan"}
                  </p>
                  <p className="text-gold font-bold text-sm mt-1">
                    {formatPrice(cartItem.price)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      updateQuantity(cartItem.id, cartItem.quantity - 1)
                    }
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center font-medium">
                    {cartItem.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      updateQuantity(cartItem.id, cartItem.quantity + 1)
                    }
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeFromCart(cartItem.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}

            <Separator className="my-6" />

            {/* Checkout Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gold" />
                Data Pemesan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama *</Label>
                  <Input
                    id="nama"
                    placeholder="Nama lengkap"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="namaBisnis">Nama Bisnis *</Label>
                  <Input
                    id="namaBisnis"
                    placeholder="Nama bisnis Anda"
                    value={namaBisnis}
                    onChange={(e) => setNamaBisnis(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@contoh.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp *</Label>
                  <Input
                    id="whatsapp"
                    placeholder="08xx-xxxx-xxxx"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="catatan">Catatan Project</Label>
                <Textarea
                  id="catatan"
                  placeholder="Catatan tambahan untuk project Anda (opsional)"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-3 mt-4">
                <Label>Metode Pembayaran</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  <div className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-gold/50 transition-colors">
                    <RadioGroupItem value="qris" id="qris" />
                    <Label htmlFor="qris" className="flex items-center gap-2 cursor-pointer">
                      <QrCode className="w-4 h-4 text-gold" />
                      QRIS
                    </Label>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-gold/50 transition-colors">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank" className="flex items-center gap-2 cursor-pointer">
                      <Building2 className="w-4 h-4 text-gold" />
                      Transfer Bank
                    </Label>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-gold/50 transition-colors">
                    <RadioGroupItem value="ewallet" id="ewallet" />
                    <Label htmlFor="ewallet" className="flex items-center gap-2 cursor-pointer">
                      <Wallet className="w-4 h-4 text-gold" />
                      E-Wallet
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((cartItem) => (
                  <div key={cartItem.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate mr-2">
                      {cartItem.name} x{cartItem.quantity}
                    </span>
                    <span className="text-foreground font-medium shrink-0">
                      {formatPrice(cartItem.price * cartItem.quantity)}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(total)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="font-bold text-gold">{formatPrice(total)}</span>
                </div>
                <Button
                  size="lg"
                  className="w-full bg-gold hover:bg-gold-hover text-navy font-semibold mt-4"
                  onClick={handleSubmit}
                >
                  Pesan Sekarang
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-center text-xl">
              Pesanan Berhasil Dikirim!
            </DialogTitle>
            <DialogDescription className="text-center">
              Pesanan Anda telah dikirim melalui WhatsApp. Tim kami akan segera
              menghubungi Anda.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center space-y-2 mt-4">
            <p className="text-sm text-muted-foreground">Nomor Invoice:</p>
            <p className="text-xl font-bold text-gold">{invoiceNumber}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Simpan nomor invoice ini untuk referensi Anda.
            </p>
          </div>
          <Button
            className="w-full mt-6 bg-gold hover:bg-gold-hover text-navy"
            onClick={() => {
              setShowSuccess(false);
              useStore.getState().setCurrentPage("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Kembali ke Home
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  );
}
