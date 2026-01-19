"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Car, MapPin, Wrench } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  return (
    <section className="bg-background relative overflow-hidden py-20 md:py-32 lg:py-40">
      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={itemVariants}
            className="bg-primary/10 text-primary border-primary/20 mb-8 inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium"
          >
            <Car className="mr-2 h-4 w-4" />
            La communauté véhicule de l&apos;UL
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mb-6 text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-6xl md:text-7xl"
          >
            Roulez serein avec <span className="text-primary">Miyi Ðekae</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-muted-foreground mb-10 text-lg leading-relaxed font-medium md:text-xl"
          >
            Pas de panne, pas de stress. La première plateforme d&apos;entraide
            véhicule pensée par et pour les étudiants de l&apos;Université de
            Lomé.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mb-20 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/about" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="h-14 w-full px-8 text-base"
              >
                Comment ça marche ?
              </Button>
            </Link>
          </motion.div>

          {/* Quick features badges */}
          <motion.div
            variants={itemVariants}
            className="border-border/60 mt-12 grid grid-cols-1 gap-6 border-t pt-10 sm:grid-cols-3"
          >
            <div className="bg-muted/50 hover:bg-muted flex items-center justify-center gap-3 rounded-xl p-4 transition-colors">
              <div className="bg-accent/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <MapPin className="text-accent h-5 w-5" />
              </div>
              <span className="text-sm font-semibold">Trajets localisés</span>
            </div>
            <div className="bg-muted/50 hover:bg-muted flex items-center justify-center gap-3 rounded-xl p-4 transition-colors">
              <div className="bg-accent/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <Wrench className="text-accent h-5 w-5" />
              </div>
              <span className="text-sm font-semibold">Dépannage rapide</span>
            </div>
            <div className="bg-muted/50 hover:bg-muted flex items-center justify-center gap-3 rounded-xl p-4 transition-colors">
              <div className="bg-accent/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <Car className="text-accent h-5 w-5" />
              </div>
              <span className="text-sm font-semibold">Gratuit & sécurisé</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Background decorations - subtle */}
      <div className="bg-primary/5 absolute top-1/2 left-1/2 -z-10 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-3xl"></div>
      <div className="bg-secondary/5 absolute top-0 right-0 -z-10 h-100 w-100 rounded-full opacity-30 blur-3xl"></div>
    </section>
  );
}
