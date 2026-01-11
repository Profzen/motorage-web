import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bike, MapPin, Wrench } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-40">
      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-8">
            <Bike className="h-4 w-4 mr-2" />
            La communauté moto de l&apos;UL
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6 leading-tight">
            Roulez serein avec <span className="text-primary">MOTORAGE</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-4 leading-relaxed">
            Pas de panne, pas de stress. Trouvez de l&apos;aide immédiatement ou proposez vos trajets.
          </p>
          <p className="text-base text-muted-foreground/80 mb-10 leading-relaxed max-w-2xl mx-auto">
            La première plateforme d&apos;entraide moto pensée par et pour les étudiants de l&apos;Université de Lomé.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="h-13 px-8 w-full text-base font-semibold">
                Rejoindre MOTORAGE
              </Button>
            </Link>
            <Link href="/about" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="h-13 px-8 w-full text-base">
                Découvrir comment ça marche
              </Button>
            </Link>
          </div>

          {/* Quick features badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 pt-8 border-t border-border/40">
            <div className="flex items-center justify-center gap-2">
              <MapPin className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Trajets localisés</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Wrench className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Dépannage rapide</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Bike className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Gratuit & sécurisé</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decorations - subtle */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl"></div>
    </section>
  );
}
