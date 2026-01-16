"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bike, MapPin, Wrench, ChevronRight } from "lucide-react";
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
      transition: { duration: 0.5, ease: "easeOut" as any },
    },
  };

  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-32 lg:py-40">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-8 border border-primary/20"
          >
            <Bike className="h-4 w-4 mr-2" />
            La communauté moto de l&apos;UL
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl mb-6 leading-[1.1]"
          >
            Roulez serein avec <span className="text-primary">Miyi Ðekae</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground mb-4 leading-relaxed font-medium"
          >
            Pas de panne, pas de stress. Trouvez de l&apos;aide immédiatement ou proposez vos trajets.
          </motion.p>
          <motion.p
            variants={itemVariants}
            className="text-base text-muted-foreground/80 mb-10 leading-relaxed max-w-2xl mx-auto"
          >
            La première plateforme d&apos;entraide moto pensée par et pour les étudiants de l&apos;Université de Lomé.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="h-14 px-8 w-full text-base font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                Rejoindre Miyi Ðekae
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/search" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="h-14 px-8 w-full text-base font-semibold">
                Demander une aide
              </Button>
            </Link>
            <Link href="/about" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="h-14 px-8 w-full text-base">
                Comment ça marche ?
              </Button>
            </Link>
          </motion.div>

          {/* Quick features badges */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 pt-10 border-t border-border/60"
          >
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-muted/50 transition-colors hover:bg-muted">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-accent" />
              </div>
              <span className="text-sm font-semibold">Trajets localisés</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-muted/50 transition-colors hover:bg-muted">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Wrench className="h-5 w-5 text-accent" />
              </div>
              <span className="text-sm font-semibold">Dépannage rapide</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-muted/50 transition-colors hover:bg-muted">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Bike className="h-5 w-5 text-accent" />
              </div>
              <span className="text-sm font-semibold">Gratuit & sécurisé</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Background decorations - subtle */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl opacity-50"></div>
      <div className="absolute top-0 right-0 -z-10 h-[400px] w-[400px] rounded-full bg-secondary/5 blur-3xl opacity-30"></div>
    </section>
  );
}
