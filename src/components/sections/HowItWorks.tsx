import { UserPlus, MessageSquare, Wrench } from "lucide-react";

const steps = [
  {
    title: "Créez votre profil",
    description:
      "Inscrivez-vous avec votre mail étudiant et renseignez les détails de votre moto.",
    icon: UserPlus,
  },
  {
    title: "Demandez de l'assistance",
    description:
      "Panne sèche, crevaison ou souci mécanique ? Publiez votre annonce en quelques secondes pour être dépanné.",
    icon: MessageSquare,
  },
  {
    title: "Entraide communautaire",
    description:
      "Un étudiant à proximité vient vous dépanner ou partage ses outils avec vous.",
    icon: Wrench,
  },
];

export function HowItWorks() {
  return (
    <section className="bg-surface py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Comment ça marche ?
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Trois étapes simples pour ne plus jamais rester bloqué sur le campus
            avec votre moto.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="bg-primary/10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl">
                <step.icon className="text-primary h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
