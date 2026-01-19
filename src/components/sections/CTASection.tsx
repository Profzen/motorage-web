import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="bg-primary text-primary-foreground rounded-3xl px-6 py-16 text-center shadow-xl md:px-12 md:py-20">
          <h2 className="mx-auto mb-6 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Prêt à ne plus jamais pousser votre véhicule sur le campus ?
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-lg opacity-90">
            Inscrivez-vous dès aujourd&apos;hui et faites partie de la plus
            grande communauté de motards de l&apos;UL.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="secondary"
                className="h-12 w-full px-8 font-semibold"
              >
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
