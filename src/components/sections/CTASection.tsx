import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground md:px-12 md:py-20 shadow-xl">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Prêt à ne plus jamais pousser votre moto sur le campus ?
          </h2>
          <p className="mx-auto max-w-xl text-lg opacity-90 mb-10">
            Inscrivez-vous dès aujourd&apos;hui et faites partie de la plus grande communauté de motards de l&apos;UL.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="h-12 px-8 w-full font-semibold">
                Créer mon compte
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="h-12 px-8 w-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white transition-colors">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
