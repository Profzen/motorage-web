import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Heart, Zap } from "lucide-react";

export const metadata = {
  title: "À propos | MOTORAGE",
  description: "En savoir plus sur MOTORAGE, la plateforme d'entraide moto pour les étudiants",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold">À propos de MOTORAGE</h1>
              <p className="text-lg text-muted-foreground">
                Une plateforme créée par des étudiants, pour les étudiants de l'Université de Lomé
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6">Notre Histoire</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    MOTORAGE est né d'un constat simple : beaucoup d'étudiants à l'Université de Lomé utilisent la moto comme moyen de transport quotidien. Malheureusement, une panne ou un souci mécanique peut rapidement devenir un problème majeur.
                  </p>
                  <p>
                    En 2025, nous avons décidé de créer une solution adaptée au contexte local : une plateforme numérique simple, accessible et gratuite qui permet aux étudiants de s'entraider rapidement et efficacement.
                  </p>
                  <p>
                    Aujourd'hui, MOTORAGE connecte des centaines d'étudiants et facilite chaque jour l'échange de trajets, de conseils mécaniques et d'outils.
                  </p>
                </div>
              </div>

              {/* Mission & Vision */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-l-4 border-l-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Notre Mission
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground">
                    Réduire les difficultés de mobilité des étudiants en favorisant le covoiturage moto sécurisé, local et gratuit au sein du campus et des zones avoisinantes.
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-secondary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Nos Valeurs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground">
                    Solidarité, accessibilité, confiance et responsabilité. Chaque étudiant est bienvenu et contribue à bâtir une communauté bienveillante.
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-surface">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold mb-12 text-center">Comment MOTORAGE fonctionne</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5 text-primary" />
                      Pour les Conducteurs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>Publiez vos trajets habituels et proposez vos places</p>
                    <p>Aidez la communauté et gagnez en réputation</p>
                    <p>Gérez facilement vos trajets et demandes</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Zap className="h-5 w-5 text-secondary" />
                      Pour les Passagers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>Trouvez rapidement des trajets disponibles</p>
                    <p>Demandez de l'aide en cas de panne mécanique</p>
                    <p>Connectez-vous à d'autres étudiants passionnés</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold mb-6">Qui sommes-nous ?</h2>
              <p className="text-muted-foreground mb-8">
                Une petite équipe d'étudiants passionnés par la technologie et l'entraide. Nous utilisons nos compétences pour créer des solutions qui font la différence dans la vie des étudiants.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-surface rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-2">500+</div>
                  <p className="text-sm text-muted-foreground">Utilisateurs actifs</p>
                </div>
                <div className="p-4 bg-surface rounded-lg">
                  <div className="text-2xl font-bold text-secondary mb-2">1200+</div>
                  <p className="text-sm text-muted-foreground">Trajets partagés</p>
                </div>
                <div className="p-4 bg-surface rounded-lg">
                  <div className="text-2xl font-bold text-accent mb-2">2500+</div>
                  <p className="text-sm text-muted-foreground">Dépannages réussis</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
