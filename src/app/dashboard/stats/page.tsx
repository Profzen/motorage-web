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
  BarChart3,
  TrendingUp,
  Users,
  ArrowRightLeft,
  Calendar,
  ShieldAlert,
  Loader2,
  RefreshCcw,
  Zap,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface StatsData {
  users: { role: string; count: number }[];
  onboarding: { pending: number };
  trajetsToday: { statut: string; count: number }[];
  reservations: { total: number };
  reports: { pending: number };
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      const result = await res.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const userRolesData =
    stats?.users.map((u) => ({
      name:
        u.role === "passager"
          ? "Passagers"
          : u.role === "conducteur"
            ? "Conducteurs"
            : "Admins",
      value: u.count,
    })) || [];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  const kpis = [
    {
      title: "Taux de croissance",
      value: "+24%",
      sub: "Inscriptions mensuelles",
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "Zones actives",
      value: "8",
      sub: "Points d'arrêt campus",
      icon: MapPin,
      color: "text-blue-500",
    },
    {
      title: "Alertes sécurité",
      value: stats?.reports.pending.toString() || "0",
      sub: "Litiges non résolus",
      icon: ShieldAlert,
      color:
        stats?.reports.pending && stats.reports.pending > 0
          ? "text-red-500"
          : "text-muted-foreground",
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-40">
        <Loader2 className="text-primary h-12 w-12 animate-spin" />
        <p className="animate-pulse text-lg font-bold">
          Calcul des statistiques stratégiques...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in space-y-8 duration-700">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight">
            <BarChart3 className="text-primary h-8 w-8" />
            Analyses & Performances
          </h1>
          <p className="text-muted-foreground mt-1">
            Vue d&apos;ensemble de l&apos;activité du campus de Lomé.
          </p>
        </div>
        <Button
          variant="outline"
          className="bg-card gap-2 border-2 font-bold"
          onClick={fetchStats}
        >
          <RefreshCcw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-primary text-primary-foreground overflow-hidden border-0 shadow-sm">
              <CardContent className="relative p-6">
                <kpi.icon className="absolute -right-4 -bottom-4 h-24 w-24 rotate-12 opacity-10" />
                <p className="text-xs font-black tracking-widest uppercase opacity-80">
                  {kpi.title}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <h3 className="text-4xl font-black">{kpi.value}</h3>
                  <Badge
                    variant="secondary"
                    className="border-0 bg-white/20 text-white"
                  >
                    {kpi.sub}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Distribution des utilisateurs */}
        <Card className="bg-card/50 border-0 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black">
                  Population Universitaire
                </CardTitle>
                <CardDescription>Répartition par rôle</CardDescription>
              </div>
              <Users className="text-muted-foreground h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="h-75">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userRolesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userRolesData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex justify-center gap-6">
              {userRolesData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs font-bold">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trajets du jour */}
        <Card className="bg-card/50 border-0 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black">
                  Activité Quotidienne
                </CardTitle>
                <CardDescription>
                  Flux de trajets du 17 Janvier 2026
                </CardDescription>
              </div>
              <Zap className="h-5 w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="h-75">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.trajetsToday || []}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(0,0,0,0.05)"
                />
                <XAxis
                  dataKey="statut"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 600 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip cursor={{ fill: "rgba(0,0,0,0.02)" }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recap Bottom Bar */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="bg-card/30 border-dashed">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="bg-primary/10 text-primary rounded-lg p-2">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] font-black uppercase">
                Demandes Conducteurs
              </p>
              <p className="text-lg font-bold">
                {stats?.onboarding.pending} en attente
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-dashed">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-green-500/10 p-2 text-green-600">
              <ArrowRightLeft className="h-4 w-4" />
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] font-black uppercase">
                Réservations Totales
              </p>
              <p className="text-lg font-bold">{stats?.reservations.total}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
