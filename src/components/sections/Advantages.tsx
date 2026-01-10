import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Shield, Users, Wallet } from "lucide-react";

const advantages = [
  {
    title: "Rapidité",
    description: "Trouvez un dépanneur étudiant directement sur le campus en moins de 10 minutes.",
    icon: Clock,
  },
  {
    title: "Confiance",
    description: "Tous les membres sont des étudiants vérifiés de l&apos;Université de Lomé.",
    icon: Shield,
  },
  {
    title: "Économie",
    description: "Évitez les frais de remorquage et de mécanique coûteux grâce à l&apos;entraide.",
    icon: Wallet,
  },
  {
    title: "Communauté",
    description: "Rejoignez un réseau de passionnés de moto et partagez vos expériences.",
    icon: Users,
  },
];

export function Advantages() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Pourquoi MOTORAGE ?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Une solution pensée par des étudiants, pour les étudiants.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((adv, index) => (
            <Card key={index} className="border-none shadow-md bg-white">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center mb-2">
                  <adv.icon className="h-5 w-5 text-secondary" />
                </div>
                <CardTitle className="text-lg">{adv.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{adv.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
