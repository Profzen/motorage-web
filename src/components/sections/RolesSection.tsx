import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bike, Users, Navigation2 } from "lucide-react";
import { cn } from "@/lib/utils";

const roles = [
  {
    title: "Je suis Conducteur",
    description: "Je propose mes places et j'aide la communauté",
    icon: Bike,
    features: [
      "Publiez vos trajets habituels",
      "Proposez des places disponibles",
      "Gagnez en réputation",
      "Accédez à un réseau d'étudiants",
    ],
    color: "primary",
  },
  {
    title: "Je suis Passager",
    description: "Je trouve de l'aide quand j'en ai besoin",
    icon: Users,
    features: [
      "Faites une demande d'assistance",
      "Demandez de l'aide rapidement",
      "Localisez les conducteurs",
      "Rejoignez une communauté bienveillante",
    ],
    color: "secondary",
  },
  {
    title: "Je veux me Dépanner",
    description: "Demandez une assistance mécanique",
    icon: Navigation2,
    features: [
      "Décrivez votre panne",
      "Connectez-vous à un conducteur étudiant",
      "Partagez des outils",
      "Recevez de l'aide gratuitement",
    ],
    color: "accent",
  },
];

export function RolesSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Une plateforme pour tous les profils
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Que vous soyez conducteur, passager ou en quête d&apos;entraide,
            trouvez votre place dans notre communauté.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card
                key={role.title}
                className={cn(
                  "border-l-4 transition-shadow hover:shadow-lg",
                  role.color === "primary" && "border-l-primary",
                  role.color === "secondary" && "border-l-secondary",
                  role.color === "accent" && "border-l-accent"
                )}
              >
                <CardHeader>
                  <div
                    className={cn(
                      "mb-3 flex h-12 w-12 items-center justify-center rounded-xl transition-transform hover:scale-110",
                      role.color === "primary" && "bg-primary/10",
                      role.color === "secondary" && "bg-secondary/10",
                      role.color === "accent" && "bg-accent/10"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-6 w-6",
                        role.color === "primary" && "text-primary",
                        role.color === "secondary" && "text-secondary",
                        role.color === "accent" && "text-accent"
                      )}
                    />
                  </div>
                  <CardTitle className="text-lg">{role.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-5 text-sm">
                    {role.description}
                  </p>
                  <ul className="space-y-2">
                    {role.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span
                          className={cn(
                            "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                            role.color === "primary" && "bg-primary",
                            role.color === "secondary" && "bg-secondary",
                            role.color === "accent" && "bg-accent"
                          )}
                        ></span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
