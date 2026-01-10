import { Bike } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-surface">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Bike className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold tracking-tight">MOTORAGE</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              La plateforme d&apos;entraide moto entre étudiants de l&apos;Université de Lomé. Partagez, réparez, roulez.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Plateforme</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm hover:text-primary transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm hover:text-primary transition-colors">
                  Tableau de bord
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Légal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm hover:text-primary transition-colors">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:text-primary transition-colors">
                  Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} MOTORAGE WEB. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
