"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, Lock, User, Building2, Phone, ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regBusiness, setRegBusiness] = useState("");

  // Check for auth errors in URL params (from NextAuth redirects)
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      const errorMessages: Record<string, string> = {
        OAuthSignin: "Gagal memulai login dengan Google.",
        OAuthCallback: "Gagal menyelesaikan login dengan Google.",
        OAuthCreateAccount: "Gagal membuat akun dari Google.",
        EmailCreateAccount: "Gagal membuat akun dengan email ini.",
        Callback: "Gagal menyelesaikan proses login.",
        OAuthAccountNotLinked: "Akun Google belum terhubung. Coba login dengan email & password.",
        CredentialsSignin: "Email atau password salah.",
        SessionRequired: "Silakan login terlebih dahulu.",
        default: "Terjadi kesalahan saat login. Coba lagi.",
      };
      const message = errorMessages[error] || errorMessages.default;
      setAuthError(message);
      toast.error(message);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!email || !password) {
      toast.error("Email dan password harus diisi");
      return;
    }
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        const errorMsg = result.error === "CredentialsSignin"
          ? "Email atau password salah"
          : result.error;
        setAuthError(errorMsg);
        toast.error(errorMsg);
      } else if (result?.ok) {
        toast.success("Login berhasil!");
        router.push("/dashboard");
      } else {
        // No error and no ok - unexpected
        setAuthError("Terjadi kesalahan yang tidak diketahui.");
        toast.error("Terjadi kesalahan yang tidak diketahui.");
      }
    } catch (error) {
      console.error("[LOGIN] Error:", error);
      setAuthError("Terjadi kesalahan koneksi. Coba lagi.");
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!regEmail || !regPassword) {
      toast.error("Email dan password harus diisi");
      return;
    }
    if (regPassword.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          phone: regPhone,
          businessName: regBusiness,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Registrasi gagal";
        setAuthError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      toast.success("Registrasi berhasil! Silakan login.");
      setIsLogin(true);
      setEmail(regEmail);
      setPassword("");
    } catch (error) {
      console.error("[REGISTER] Error:", error);
      setAuthError("Terjadi kesalahan koneksi. Coba lagi.");
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Use callbackUrl to redirect back to dashboard after Google login
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Button
          variant="ghost"
          className="mb-4 text-muted-foreground hover:text-foreground"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Home
        </Button>

        <Card className="border-gold/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center mb-3">
              <img src="/favicon.png" alt="ZDL" className="w-8 h-8 object-contain" />
            </div>
            <CardTitle className="text-2xl">
              {isLogin ? "Masuk ke Akun" : "Daftar Akun Baru"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Masuk untuk melihat pesanan dan riwayat pembayaran"
                : "Buat akun untuk mulai memesan layanan kami"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Auth Error Banner */}
            {authError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-700 dark:text-red-300">{authError}</p>
                  {authError.includes("Google") && (
                    <p className="text-xs text-red-500 mt-1">
                      Pastikan Google OAuth sudah dikonfigurasi di Vercel environment variables.
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setAuthError(null)}
                  className="text-red-400 hover:text-red-600 ml-auto shrink-0"
                >
                  ×
                </button>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@contoh.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gold hover:bg-gold-hover text-navy font-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      "Masuk"
                    )}
                  </Button>

                  <div className="relative">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                      atau
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Masuk dengan Google
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleRegister}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Nama Lengkap</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reg-name"
                        placeholder="Nama lengkap"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="email@contoh.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="pl-10"
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="reg-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Min. 6 karakter"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="pl-10"
                          required
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-phone">WhatsApp</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="reg-phone"
                          placeholder="08xx-xxxx-xxxx"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-business">Nama Bisnis</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="reg-business"
                          placeholder="Nama bisnis Anda"
                          value={regBusiness}
                          onChange={(e) => setRegBusiness(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                  </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gold hover:bg-gold-hover text-navy font-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      "Daftar Sekarang"
                    )}
                  </Button>

                  <div className="relative">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                      atau
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Daftar dengan Google
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
              </span>{" "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setShowPassword(false);
                  setAuthError(null);
                }}
                className="text-gold font-medium hover:underline"
              >
                {isLogin ? "Daftar sekarang" : "Masuk"}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
