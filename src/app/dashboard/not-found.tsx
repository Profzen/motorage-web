'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6 max-w-md"
      >
        <div className="w-24 h-24 bg-destructive/10 rounded-3xl flex items-center justify-center mx-auto text-destructive">
          <AlertCircle className="w-12 h-12" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight">Page non trouvée</h1>
          <p className="text-muted-foreground font-medium">
            La ressource que vous recherchez dans la console d&apos;administration n&apos;existe pas ou a été déplacée.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button variant="outline" asChild className="rounded-xl font-bold h-12 px-8">
            <Link href="/dashboard">
              <Home className="w-4 h-4 mr-2" /> Retour au Dashboard
            </Link>
          </Button>
          <Button 
            onClick={() => window.history.back()} 
            className="rounded-xl font-bold h-12 px-8 bg-primary shadow-lg shadow-primary/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Revenir en arrière
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
