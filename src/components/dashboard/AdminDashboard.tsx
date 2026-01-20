"use client";

import React, { useEffect, useState } from "react";
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
  Loader2,
  TrendingUp,
  History,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardStats {
  users: {
    total: number;
    byRole: {
      conducteur: number;
      passager: number;
    };
  };
  trajets: {
    total: number;
    today: number;
    chartData: Array<{ date: string; count: number }>;
  };
  onboarding: {
    pending: number;
  };
  reports: {
    pending: number;
  };
}

interface Activity {
  id: string;
  type: string;
  action: string;
  details?: string;
  description: string;
  createdAt: string;
  user: {
    nom: string;
    prenom: string;
    role: string;
  };
}

export function AdminDashboard() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/activity"),
        ]);

        const stats = await statsRes.json();
        const activity = await activityRes.json();

        if (stats.success) setData(stats.data);
        if (activity.success) setActivities(activity.data);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  const stats = [
    {
      title: "Total Utilisateurs",
      value: data?.users?.total?.toLocaleString() || "0",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
      trend: data?.users?.byRole?.conducteur
        ? `${data.users.byRole.conducteur} conducteurs`
        : "Nouveau",
    },
    {
      title: "Trajets Aujourd'hui",
      value: data?.trajets?.today?.toString() || "0",
      icon: ArrowRightLeft,
      color: "text-green-600",
      bg: "bg-green-100",
      trend: data?.trajets?.total ? `Total: ${data.trajets.total}` : "Actif",
    },
    {
      title: "Validations en attente",
      value: data?.onboarding?.pending?.toString() || "0",
      icon: ClipboardCheck,
      color: "text-amber-600",
      bg: "bg-amber-100",
      trend: (data?.onboarding?.pending ?? 0) > 0 ? "Prioritaire" : "A jour",
    },
    {
      title: "Signalements actifs",
      value: data?.reports?.pending?.toString() || "0",
      icon: ShieldAlert,
      color: "text-red-600",
      bg: "bg-red-100",
      trend: (data?.reports?.pending ?? 0) > 0 ? "A traiter" : "R.A.S",
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

      {/* Evolution Chart */}
      <Card className="bg-card/50 border-0 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <TrendingUp className="text-primary h-5 w-5" />
            Évolution de l&apos;activité
          </CardTitle>
          <CardDescription>
            Nombre de trajets réservés sur les 7 derniers jours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data?.trajets?.chartData || []}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--muted-foreground))"
                  opacity={0.1}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(str) =>
                    new Date(str).toLocaleDateString("fr-FR", {
                      weekday: "short",
                    })
                  }
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorCount)"
                  name="Trajets"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

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
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="hover:bg-muted/50 hover:border-border flex items-start gap-4 rounded-xl border border-transparent p-3 transition-colors"
                  >
                    <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                      {activity.action.includes("TRAJET") ? (
                        <ArrowRightLeft className="h-5 w-5" />
                      ) : activity.action.includes("USER") ||
                        activity.action.includes("LOGIN") ? (
                        <UserCheck className="h-5 w-5" />
                      ) : (
                        <Activity className="h-5 w-5" />
                      )}
                    </div>
                    <div className="grow">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold">
                          {activity.details || activity.action}
                        </p>
                        <span className="text-muted-foreground text-xs">
                          {new Date(activity.createdAt).toLocaleTimeString(
                            "fr-FR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Par {activity.user?.nom || "Système"} (
                        {activity.user?.role || "Inconnu"})
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground flex h-32 flex-col items-center justify-center gap-2 text-sm italic">
                  <History className="h-8 w-8 opacity-20" />
                  Aucune activité récente
                </div>
              )}
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
            <CardDescription>Documents conducteurs en attente</CardDescription>
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
