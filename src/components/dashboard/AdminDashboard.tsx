"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Users,
  ArrowRightLeft,
  ClipboardCheck,
  ShieldAlert,
  Activity,
  UserCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AdminDashboard() {
  const stats = [
    {
      title: "Total Utilisateurs",
      value: "1,284",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
      trend: "+12%",
    },
    {
      title: "Trajets Aujourd'hui",
      value: "156",
      icon: ArrowRightLeft,
      color: "text-green-600",
      bg: "bg-green-100",
      trend: "+5%",
    },
    {
      title: "Validations en attente",
      value: "12",
      icon: ClipboardCheck,
      color: "text-amber-600",
      bg: "bg-amber-100",
      trend: "Prioritaire",
    },
    {
      title: "Signalements actifs",
      value: "2",
      icon: ShieldAlert,
      color: "text-red-600",
      bg: "bg-red-100",
      trend: "-50%",
    },
  ];

  return (
    <div className="animate-in fade-in space-y-8 duration-700">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card/50 border-0 shadow-sm backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`rounded-2xl p-3 ${stat.bg} ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="text-xs font-bold">
                    {stat.trend}
                  </Badge>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-black">{stat.value}</h3>
                  <p className="text-muted-foreground text-sm font-medium">
                    {stat.title}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Real-time Activity */}
        <Card className="bg-card/50 border-0 shadow-sm backdrop-blur-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <Activity className="text-primary h-5 w-5" />
              Flux d&apos;activité en direct
            </CardTitle>
            <CardDescription>
              Surveillance des derniers événements sur la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="hover:bg-muted/50 hover:border-border flex items-start gap-4 rounded-xl border border-transparent p-3 transition-colors"
                >
                  <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div className="grow">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold">
                        Nouvelle réservation confirmée
                      </p>
                      <span className="text-muted-foreground text-xs">
                        Il y a 5 min
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Jean D. (Conducteur) a accepté la demande de Marie K. pour
                      le trajet &quot;Entrée Nord → Amphi 1000&quot;.
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              className="text-primary mt-6 w-full text-xs font-bold tracking-widest uppercase"
            >
              Voir tout le flux
            </Button>
          </CardContent>
        </Card>

        {/* Validation Queue */}
        <Card className="bg-card/50 border-0 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <ClipboardCheck className="h-5 w-5 text-amber-500" />À valider
            </CardTitle>
            <CardDescription>Documents motards en attente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-muted/30 flex items-center gap-3 rounded-xl p-3"
                >
                  <div className="bg-background flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold">
                    MK
                  </div>
                  <div className="min-w-0 grow">
                    <p className="truncate text-xs font-bold">Marc Koffi</p>
                    <p className="text-muted-foreground text-[10px]">
                      Permis A + Assurance
                    </p>
                  </div>
                  <Button size="sm" className="h-7 rounded-lg px-2 text-[10px]">
                    Vérifier
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
