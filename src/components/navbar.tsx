"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { useStore } from "@/store/use-store";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

const navLinks = [
  { id: "home", label: "Home" },
  { id: "portofolio", label: "Portofolio" },
  { id: "layanan", label: "Layanan" },
  { id: "kontak", label: "Kontak" },
];

export function Navbar() {
  const { currentPage, setCurrentPage } = useStore();
  const { theme, setTheme } = useTheme();
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
          <div className="flex items-center gap-2">
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
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
