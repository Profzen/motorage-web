"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Shield, Users, Wallet } from "lucide-react";
import { motion } from "framer-motion";

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
    <section className="py-24 bg-surface/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Pourquoi Miyi Ðekae ?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Une solution pensée par des étudiants, pour les étudiants de l&apos;UL.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {advantages.map((adv, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-none shadow-lg bg-card hover:bg-accent/5 transition-colors h-full">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                    <adv.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-bold">{adv.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{adv.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
