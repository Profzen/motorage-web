import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Lock, MapPin, Bike, Users, Plus, MoreHorizontal } from "lucide-react";

export const metadata = {
  title: "Tableau de Bord | MOTORAGE",
  description: "Votre espace personnel MOTORAGE",
};

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow py-20 md:py-32 bg-surface/50">
        <div className="container mx-auto px-4">
          {/* Auth Alert */}
          <div className="mb-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 flex items-start gap-3">
            <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">Zone protégée</p>
              <p>
                Cette zone sera restreinte aux utilisateurs authentifiés au Sprint 2. Actuellement, ce n'est qu'une démonstration du layout.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Welcome Section */}
            <div>
              <h1 className="text-4xl font-bold mb-2">Bienvenue sur votre tableau de bord</h1>
              <p className="text-muted-foreground">
                Gérez vos trajets, demandes et profil en un seul endroit
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Mes trajets</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Demandes reçues</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Connexions</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Réputation</p>
                    <p className="text-2xl font-bold">★★★★★</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column - Actions */}
              <div className="md:col-span-2 space-y-6">
                {/* Trajets Section */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                      <CardTitle>Mes trajets</CardTitle>
                      <CardDescription>Trajets que vous proposez</CardDescription>
                    </div>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Nouveau trajet
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 rounded-lg bg-muted/50">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground mb-4">Aucun trajet pour le moment</p>
                      <Link href="#">
                        <Button variant="outline" size="sm">
                          Créer votre premier trajet
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Mes Motos Section */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                      <CardTitle>Mes motos</CardTitle>
                      <CardDescription>Véhicules enregistrés</CardDescription>
                    </div>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Ajouter une moto
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 rounded-lg bg-muted/50">
                      <Bike className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground mb-4">Aucune moto enregistrée</p>
                      <Link href="#">
                        <Button variant="outline" size="sm">
                          Enregistrer votre moto
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Profile Card */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Mon profil</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Utilisateur</p>
                      <p className="text-sm text-muted-foreground">utilisateur@univ-lome.tg</p>
                    </div>
                    <Button variant="outline" className="w-full">
                      Éditer le profil
                    </Button>
                  </CardContent>
                </Card>

                {/* Demandes Section */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Demandes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">Aucune demande en attente</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-base">Raccourcis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link href="/about" className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors text-sm">
                      <span>À propos</span>
                    </Link>
                    <Link href="/contact" className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors text-sm">
                      <span>Contacter le support</span>
                    </Link>
                    <button className="w-full flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors text-sm text-destructive">
                      <span>Se déconnecter</span>
                    </button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Info Box */}
            <Card className="border-0 shadow-sm bg-blue-50 dark:bg-blue-950/20">
              <CardContent className="pt-6">
                <p className="text-sm text-foreground">
                  <span className="font-medium">Note :</span> L'authentification et les données réelles seront intégrées au Sprint 2 avec Firebase. Ce tableau de bord est actuellement un placeholder pour montrer l'UX et la structure.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
