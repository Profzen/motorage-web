import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bike, Users, Navigation2 } from "lucide-react";

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
      "Consultez les trajets disponibles",
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
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Une plateforme pour tous les profils
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Que vous soyez conducteur, passager ou en quête d&apos;entraide, trouvez votre place dans notre communauté.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <Card
                key={index}
                className={`border-l-4 hover:shadow-lg transition-shadow ${
                  role.color === "primary"
                    ? "border-l-primary"
                    : role.color === "secondary"
                      ? "border-l-secondary"
                      : "border-l-accent"
                }`}
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-3">
                    <Icon
                      className={`h-6 w-6 ${
                        role.color === "primary"
                          ? "text-primary"
                          : role.color === "secondary"
                            ? "text-secondary"
                            : "text-accent"
                      }`}
                    />
                  </div>
                  <CardTitle className="text-lg">{role.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-5">{role.description}</p>
                  <ul className="space-y-2">
                    {role.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span
                          className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${
                            role.color === "primary"
                              ? "bg-primary"
                              : role.color === "secondary"
                                ? "bg-secondary"
                                : "bg-accent"
                          }`}
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

