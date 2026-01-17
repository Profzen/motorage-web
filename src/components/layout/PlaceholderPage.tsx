import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ReactNode } from "react";

interface PlaceholderPageProps {
  title: string;
  children?: ReactNode;
}

export function PlaceholderPage({ title, children }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="grow flex items-center justify-center py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">{title}</h1>
          <div className="mx-auto max-w-md p-8 border rounded-2xl bg-surface shadow-sm">
            {children || (
              <p className="text-muted-foreground">
                Cette page est actuellement un placeholder. Le contenu sera ajouté au Sprint 2.
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

