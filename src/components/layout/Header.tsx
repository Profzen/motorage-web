import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bike } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Bike className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">MOTORAGE</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
            À propos
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
            Contact
          </Link>
          {/* Dashboard visible pour la démo du boilerplate, sera protégé au Sprint 2 */}
          <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
            Tableau de bord
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="outline" size="sm">
              Connexion
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Inscription</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
