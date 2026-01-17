"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md space-y-6"
      >
        <div className="bg-destructive/10 text-destructive mx-auto flex h-24 w-24 items-center justify-center rounded-3xl">
          <AlertCircle className="h-12 w-12" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight">
            Page non trouvée
          </h1>
          <p className="text-muted-foreground font-medium">
            La ressource que vous recherchez dans la console
            d&apos;administration n&apos;existe pas ou a été déplacée.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
          <Button
            variant="outline"
            asChild
            className="h-12 rounded-xl px-8 font-bold"
          >
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" /> Retour au Dashboard
            </Link>
          </Button>
          <Button
            onClick={() => window.history.back()}
            className="bg-primary shadow-primary/20 h-12 rounded-xl px-8 font-bold shadow-lg"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Revenir en arrière
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
