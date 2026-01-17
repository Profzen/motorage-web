"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bike, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const { user, isLoggedIn, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const navLinks = [
    { href: "/about", label: "À propos" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <Bike className="text-primary h-6 w-6" />
            <span className="text-xl font-bold tracking-tight">Miyi Ðekae</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group text-muted-foreground hover:text-primary flex items-center gap-1 text-sm font-medium transition-colors"
            >
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden items-center gap-4 md:flex">
            {mounted && isLoggedIn ? (
              <>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/20 hover:bg-primary/10 hover:text-primary gap-2 rounded-xl font-bold transition-all"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Mon Tableau de bord
                  </Button>
                </Link>
                <NotificationBell />
                <div className="ml-2 flex items-center gap-2 border-l pl-4">
                  <div className="hidden flex-col items-end lg:flex">
                    <span className="text-sm font-black tracking-tight">
                      {user?.prenom} {user?.nom}
                    </span>
                    <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                      {user?.role}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    title="Déconnexion"
                    aria-label="Se déconnecter"
                    className="hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </>
            ) : mounted ? (
              <>
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/20 hover:bg-primary/10 hover:text-primary rounded-xl font-bold transition-all"
                  >
                    Connexion
                  </Button>
                </Link>
              </>
            ) : null}
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-background overflow-hidden border-b md:hidden"
          >
            <div className="container mx-auto flex flex-col gap-4 px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:bg-muted flex items-center gap-3 rounded-md p-2 text-base font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 border-t pt-4">
                {isLoggedIn ? (
                  <div className="flex items-center justify-between p-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {user?.prenom} {user?.nom}
                      </span>
                      <span className="text-muted-foreground text-[10px] uppercase">
                        {user?.role}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={logout}
                      className="gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button variant="default" className="w-full">
                        Connexion
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
