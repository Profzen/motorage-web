"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bike, LayoutDashboard, Search, PlusCircle, LogOut, Menu, X } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const { user, isLoggedIn, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const navLinks = [
    { href: "/about", label: "À propos" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Bike className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">Miyi Ðekae</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {link.icon && <link.icon className="h-4 w-4" />}
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-4">
            {mounted && isLoggedIn ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="rounded-xl border-primary/20 hover:bg-primary/10 hover:text-primary transition-all font-bold gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Mon Tableau de bord
                  </Button>
                </Link>
                <NotificationBell />
                <div className="flex items-center gap-2 border-l pl-4 ml-2">
                  <div className="hidden lg:flex flex-col items-end">
                    <span className="text-sm font-black tracking-tight">
                      {user?.prenom} {user?.nom}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{user?.role}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    title="Déconnexion"
                    aria-label="Se déconnecter"
                    className="rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </>
            ) : mounted ? (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Inscription</Button>
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
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
            className="md:hidden border-b bg-background overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-base font-medium p-2 rounded-md hover:bg-muted transition-colors"
                >
                  {link.icon && <link.icon className="h-5 w-5 text-primary" />}
                  {link.label}
                </Link>
              ))}
              <div className="border-t pt-4 mt-2">
                {isLoggedIn ? (
                  <div className="flex items-center justify-between p-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {user?.prenom} {user?.nom}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase">{user?.role}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={logout} className="gap-2">
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Connexion
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full">Inscription</Button>
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
