"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Shield, Users, Wallet } from "lucide-react";
import { motion } from "framer-motion";

const advantages = [
  {
    title: "Rapidité",
    description:
      "Trouvez un dépanneur étudiant directement sur le campus en moins de 10 minutes.",
    icon: Clock,
  },
  {
    title: "Confiance",
    description:
      "Tous les membres sont des étudiants vérifiés de l&apos;Université de Lomé.",
    icon: Shield,
  },
  {
    title: "Économie",
    description:
      "Évitez les frais de remorquage et de mécanique coûteux grâce à l&apos;entraide.",
    icon: Wallet,
  },
  {
    title: "Communauté",
    description:
      "Rejoignez un réseau de passionnés de moto et partagez vos expériences.",
    icon: Users,
  },
];

export function Advantages() {
  return (
    <section className="bg-surface/50 py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Pourquoi Miyi Ðekae ?
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Une solution pensée par des étudiants, pour les étudiants de
            l&apos;UL.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {advantages.map((adv, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-card hover:bg-accent/5 h-full border-none shadow-lg transition-colors">
                <CardHeader>
                  <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
                    <adv.icon className="text-primary h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">
                    {adv.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {adv.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
