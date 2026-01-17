"use client";

import Link from "next/link";
import { Bike } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface/30 flex min-h-screen flex-col">
      <header className="p-6">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 transition-all duration-300"
        >
          <div className="bg-primary shadow-primary/20 flex h-10 w-10 items-center justify-center rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
            <Bike className="text-primary-foreground h-6 w-6" />
          </div>
          <span className="from-foreground to-foreground/70 bg-linear-to-r bg-clip-text text-xl font-bold tracking-tight text-transparent">
            Miyi Ðekae
          </span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        {children}
      </main>
      <footer className="text-muted-foreground p-6 text-center text-sm">
        © {new Date().getFullYear()} Miyi Ðekae. Tous droits réservés.
      </footer>
    </div>
  );
}
