"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { useStore } from "@/store/use-store";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Sun, Moon, LogIn, LayoutDashboard, LogOut, User, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const emptySubscribe = () => () => {};

function CartBadge() {
  const count = useStore((s) => s.getCartCount());
  if (count === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-navy text-[10px] font-bold rounded-full flex items-center justify-center">
      {count > 9 ? "9+" : count}
    </span>
  );
}

function CartBadgeInline() {
  const count = useStore((s) => s.getCartCount());
  if (count === 0) return null;
  return (
    <span className="ml-auto w-5 h-5 bg-gold text-navy text-[10px] font-bold rounded-full flex items-center justify-center">
      {count > 9 ? "9+" : count}
    </span>
  );
}

const navLinks = [
  { id: "home", label: "Home" },
  { id: "portofolio", label: "Portofolio" },
  { id: "layanan", label: "Layanan" },
  { id: "kontak", label: "Kontak" },
];

export function Navbar() {
  const { currentPage, setCurrentPage } = useStore();
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNav = (page: string) => {
    setCurrentPage(page);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 glass border-b",
        scrolled ? "shadow-lg" : "shadow-none"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => handleNav("home")}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src="/favicon.png"
                alt="ZDL"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-bold text-lg text-foreground">
              Zheng<span className="text-gold">DigitalLab</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium transition-colors rounded-md cursor-pointer",
                  currentPage === link.id
                    ? "text-gold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
                {currentPage === link.id && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gold rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleNav("keranjang")}
              className="relative text-foreground hover:text-gold"
            >
              <ShoppingCart className="size-5" />
              <CartBadge />
              <span className="sr-only">Keranjang</span>
            </Button>

            {/* Dark mode toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-foreground hover:text-gold"
            >
              {mounted && theme === "dark" ? (
                <Sun className="size-5" />
              ) : (
                <Moon className="size-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Login / Dashboard / User Menu */}
            {status === "authenticated" && session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 border-gold/30 hover:bg-gold/10">
                    <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center">
                      <User className="w-3 h-3 text-gold" />
                    </div>
                    <span className="hidden sm:inline max-w-[100px] truncate text-sm">
                      {session.user?.name || "User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => router.push("/dashboard")} className="cursor-pointer">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="sm"
                onClick={() => router.push("/login")}
                className="bg-gold hover:bg-gold-hover text-navy font-semibold gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Masuk</span>
              </Button>
            )}

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-foreground">
                  <Menu className="size-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col gap-2 mt-8">
                  {navLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => handleNav(link.id)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium transition-colors cursor-pointer",
                        currentPage === link.id
                          ? "bg-gold/10 text-gold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {link.label}
                    </button>
                  ))}
                  <div className="border-t pt-3 mt-2">
                    <button
                      onClick={() => handleNav("keranjang")}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium w-full text-left cursor-pointer",
                        currentPage === "keranjang"
                          ? "bg-gold/10 text-gold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <ShoppingCart className="w-4 h-4" /> Keranjang
                      <CartBadgeInline />
                    </button>
                    {status === "authenticated" && session ? (
                      <>
                        <button
                          onClick={() => { setMobileOpen(false); router.push("/dashboard"); }}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium w-full text-left text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </button>
                        <button
                          onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" /> Keluar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => { setMobileOpen(false); router.push("/login"); }}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium w-full text-left text-gold hover:bg-gold/10 cursor-pointer"
                      >
                        <LogIn className="w-4 h-4" /> Masuk
                      </button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
