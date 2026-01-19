import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Heart, Zap } from "lucide-react";

export const metadata = {
  title: "À propos | Miyi Ðekae",
  description:
    "En savoir plus sur Miyi Ðekae, la plateforme d'entraide de véhicules pour les étudiants",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="from-primary/5 bg-gradient-to-b to-transparent py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <h1 className="text-4xl font-bold md:text-5xl">
              À propos de Miyi Ðekae
            </h1>
            <p className="text-muted-foreground text-lg">
              Une plateforme créée par des étudiants, pour les étudiants de
              l&apos;Université de Lomé
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl space-y-8">
            <div>
              <h2 className="mb-6 text-3xl font-bold">Notre Histoire</h2>
              <div className="text-muted-foreground space-y-4 leading-relaxed">
                <p>
                  Miyi Ðekae est né d&apos;un constat simple : beaucoup
                  d&apos;étudiants à l&apos;Université de Lomé utilisent un
                  véhicule comme moyen de transport quotidien. Malheureusement,
                  une panne ou un souci mécanique peut rapidement devenir un
                  problème majeur.
                </p>
                <p>
                  En 2025, nous avons décidé de créer une solution adaptée au
                  contexte local : une plateforme numérique simple, accessible
                  et gratuite qui permet aux étudiants de s&apos;entraider
                  rapidement et efficacement.
                </p>
                <p>
                  Aujourd&apos;hui, Miyi Ðekae connecte des centaines
                  d&apos;étudiants et facilite chaque jour l&apos;échange de
                  trajets, de conseils mécaniques et d&apos;outils.
                </p>
              </div>
            </div>

            {/* Mission & Vision */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="border-l-primary border-l-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Notre Mission
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Réduire les difficultés de mobilité des étudiants en
                  favorisant le covoiturage sécurisé, local et gratuit au sein
                  du campus et des zones avoisinantes.
                </CardContent>
              </Card>

              <Card className="border-l-secondary border-l-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Nos Valeurs
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Solidarité, accessibilité, confiance et responsabilité. Chaque
                  étudiant est bienvenu et contribue à bâtir une communauté
                  bienveillante.
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-surface py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Comment Miyi Ðekae fonctionne
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="text-primary h-5 w-5" />
                    Pour les Conducteurs
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground space-y-2 text-sm">
                  <p>Publiez vos trajets habituels et proposez vos places</p>
                  <p>Aidez la communauté et gagnez en réputation</p>
                  <p>Gérez facilement vos trajets et demandes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="text-secondary h-5 w-5" />
                    Pour les Passagers
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground space-y-2 text-sm">
                  <p>Trouvez rapidement des trajets disponibles</p>
                  <p>Demandez de l&apos;aide en cas de panne mécanique</p>
                  <p>Connectez-vous à d&apos;autres étudiants passionnés</p>
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
            <h2 className="mb-6 text-3xl font-bold">Qui sommes-nous ?</h2>
            <p className="text-muted-foreground mb-8">
              Une petite équipe d&apos;étudiants passionnés par la technologie
              et l&apos;entraide. Nous utilisons nos compétences pour créer des
              solutions qui font la différence dans la vie des étudiants.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="bg-surface rounded-lg p-4">
                <div className="text-primary mb-2 text-2xl font-bold">500+</div>
                <p className="text-muted-foreground text-sm">
                  Utilisateurs actifs
                </p>
              </div>
              <div className="bg-surface rounded-lg p-4">
                <div className="text-secondary mb-2 text-2xl font-bold">
                  1200+
                </div>
                <p className="text-muted-foreground text-sm">
                  Trajets partagés
                </p>
              </div>
              <div className="bg-surface rounded-lg p-4">
                <div className="text-accent mb-2 text-2xl font-bold">2500+</div>
                <p className="text-muted-foreground text-sm">
                  Dépannages réussis
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
