import { UserPlus, MessageSquare, Wrench } from "lucide-react";

const steps = [
  {
    title: "Créez votre profil",
    description: "Inscrivez-vous avec votre mail étudiant et renseignez les détails de votre moto.",
    icon: UserPlus,
  },
  {
    title: "Demandez de l'assistance",
    description: "Panne sèche, crevaison ou souci mécanique ? Publiez votre annonce en quelques secondes pour être dépanné.",
    icon: MessageSquare,
  },
  {
    title: "Entraide communautaire",
    description: "Un étudiant à proximité vient vous dépanner ou partage ses outils avec vous.",
    icon: Wrench,
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-surface">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Comment ça marche ?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Trois étapes simples pour ne plus jamais rester bloqué sur le campus avec votre moto.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <step.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
