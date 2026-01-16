"use client";

import Link from "next/link";
import { Bike } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-surface/30 flex flex-col">
            <header className="p-6">
                <Link href="/" className="inline-flex items-center gap-2 group transition-all duration-300">
                    <div className="bg-primary h-10 w-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <Bike className="text-primary-foreground h-6 w-6" />
                    </div>
                    <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Miyi Ðekae
                    </span>
                </Link>
            </header>
            <main className="flex-1 flex items-center justify-center p-4">
                {children}
            </main>
            <footer className="p-6 text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} Miyi Ðekae. Tous droits réservés.
            </footer>
        </div>
    );
}
