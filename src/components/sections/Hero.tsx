import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-32">
      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            L&apos;entraide moto à l&apos;Université de Lomé
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl mb-6">
            Roulez serein avec <span className="text-primary">MOTORAGE</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
            La première plateforme communautaire dédiée aux étudiants motocyclistes de l&apos;UL. 
            Trouvez de l&apos;aide, partagez des outils et rejoignez la communauté.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="h-12 px-8 w-full">
                Rejoindre la communauté
              </Button>
            </Link>
            <Link href="/about" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="h-12 px-8 w-full">
                En savoir plus
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl"></div>
    </section>
  );
}
