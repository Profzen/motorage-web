'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Users, 
  ArrowRightLeft, 
  ClipboardCheck, 
  ShieldAlert, 
  Activity,
  UserCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function AdminDashboard() {
  const stats = [
    { title: "Total Utilisateurs", value: "1,284", icon: Users, color: "text-blue-600", bg: "bg-blue-100", trend: "+12%" },
    { title: "Trajets Aujourd'hui", value: "156", icon: ArrowRightLeft, color: "text-green-600", bg: "bg-green-100", trend: "+5%" },
    { title: "Validations en attente", value: "12", icon: ClipboardCheck, color: "text-amber-600", bg: "bg-amber-100", trend: "Prioritaire" },
    { title: "Signalements actifs", value: "2", icon: ShieldAlert, color: "text-red-600", bg: "bg-red-100", trend: "-50%" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="font-bold text-xs">
                    {stat.trend}
                  </Badge>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-black">{stat.value}</h3>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Real-time Activity */}
        <Card className="lg:col-span-2 border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Flux d&apos;activité en direct
            </CardTitle>
            <CardDescription>Surveillance des derniers événements sur la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="grow">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold">Nouvelle réservation confirmée</p>
                      <span className="text-xs text-muted-foreground">Il y a 5 min</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Jean D. (Conducteur) a accepté la demande de Marie K. pour le trajet &quot;Entrée Nord → Amphi 1000&quot;.
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-6 font-bold text-primary text-xs uppercase tracking-widest">
              Voir tout le flux
            </Button>
          </CardContent>
        </Card>

        {/* Validation Queue */}
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-amber-500" />
              À valider
            </CardTitle>
            <CardDescription>Documents motards en attente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                  <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center font-bold text-xs">
                    MK
                  </div>
                  <div className="grow min-w-0">
                    <p className="text-xs font-bold truncate">Marc Koffi</p>
                    <p className="text-[10px] text-muted-foreground">Permis A + Assurance</p>
                  </div>
                  <Button size="sm" className="h-7 text-[10px] px-2 rounded-lg">Vérifier</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
