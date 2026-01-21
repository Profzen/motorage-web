"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
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

type AdminStats = {
  users: { role: string; count: number }[];
  onboarding: { pending: number };
  trajetsToday: { statut: string; count: number }[];
  trajetsTotal: { statut: string; count: number }[];
  trajetsLast7Days?: { date: string; count: number }[];
  reservations: { total: number; byStatus: { statut: string; count: number }[] };
  reports: { pending: number };
};

type AuditLog = {
  id: string;
  action: string;
  targetId: string | null;
  details: string | null;
  userId: string | null;
  userEmail: string | null;
  userNom: string | null;
  userPrenom: string | null;
  createdAt: string | null;
};

export function AdminDashboard() {
  const [statsData, setStatsData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logsError, setLogsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      try {
        const res = await fetch("/api/admin/stats", { credentials: "include" });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json();
        const data = (json?.data ?? json) as AdminStats;
        if (!cancelled) {
          setStatsData(data);
        }
      } catch {
        if (!cancelled) {
          setError("Impossible de charger les statistiques");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadStats();
    const loadLogs = async () => {
      try {
        const res = await fetch("/api/admin/audit-logs?limit=5&page=1", {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const data = (json?.data ?? json) as AuditLog[];
        if (!cancelled) setLogs(data.slice(0, 5));
      } catch {
        if (!cancelled) setLogsError("Impossible de charger le flux d'activité");
      }
    };

    loadLogs();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatNumber = (value?: number | null) => {
    if (value === null || value === undefined || Number.isNaN(value)) return "—";
    return value.toLocaleString("fr-FR");
  };

  const trajetsTrend = useMemo(() => {
    return (statsData?.trajetsLast7Days || []).map((item) => {
      const label = item.date
        ? new Date(item.date).toLocaleDateString("fr-FR", {
            weekday: "short",
            day: "2-digit",
          })
        : "";
      return { ...item, label };
    });
  }, [statsData]);

  const computedCards = useMemo(() => {
    const totalUsers = statsData?.users.reduce((sum, u) => sum + Number(u.count || 0), 0) ?? null;
    const trajetsToday = statsData?.trajetsToday.reduce((sum, t) => sum + Number(t.count || 0), 0) ?? null;
    const trajetsTotal = statsData?.trajetsTotal.reduce((sum, t) => sum + Number(t.count || 0), 0) ?? null;
    const pendingValidations = statsData?.onboarding.pending ?? null;
    const reservationsTotal = statsData?.reservations.total ?? null;
    const reservationsByStatus = statsData?.reservations.byStatus ?? [];

    return [
      {
        title: "Total Utilisateurs",
        value: formatNumber(totalUsers),
        icon: Users,
        color: "text-blue-600",
        bg: "bg-blue-100",
        trend: "Synthèse",
      },
      {
        title: "Trajets Aujourd'hui",
        value: formatNumber(trajetsToday),
        icon: ArrowRightLeft,
        color: "text-green-600",
        bg: "bg-green-100",
        trend: "Suivi journalier",
      },
      {
        title: "Trajets (total)",
        value: formatNumber(trajetsTotal),
        icon: ArrowRightLeft,
        color: "text-emerald-600",
        bg: "bg-emerald-100",
        trend: "Cumul",
      },
      {
        title: "Validations en attente",
        value: formatNumber(pendingValidations),
        icon: ClipboardCheck,
        color: "text-amber-600",
        bg: "bg-amber-100",
        trend: "Prioritaire",
      },
      {
        title: "Réservations",
        value: formatNumber(reservationsTotal),
        icon: ShieldAlert,
        color: "text-indigo-600",
        bg: "bg-indigo-100",
        trend: reservationsByStatus
          .map((r) => `${r.statut}: ${formatNumber(Number(r.count || 0))}`)
          .join(" · ") || "",
      },
    ];
  }, [statsData]);

  return (
    <div className="animate-in fade-in space-y-8 duration-700">
      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        {computedCards.map((stat, index) => (
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
                  <h3 className="text-3xl font-black">
                    {loading ? (
                      <span className="bg-muted inline-block h-7 w-20 rounded" />
                    ) : (
                      stat.value
                    )}
                  </h3>
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
        {/* Trajets - tendance 7 jours */}
        <Card className="bg-card/50 border-0 shadow-sm backdrop-blur-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Trajets (7 derniers jours)</CardTitle>
            <CardDescription>Évolution quotidienne des trajets publiés</CardDescription>
          </CardHeader>
          <CardContent>
            {trajetsTrend.length === 0 ? (
              <p className="text-muted-foreground text-sm">Pas encore de données.</p>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trajetsTrend} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} width={30} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))" }}
                      contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

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
            {logsError ? (
              <p className="text-destructive text-sm">{logsError}</p>
            ) : logs.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucune activité récente.</p>
            ) : (
              <div className="space-y-6">
                {logs.map((log) => {
                  const who = log.userEmail || "Utilisateur";
                  const date = log.createdAt
                    ? new Date(log.createdAt).toLocaleString("fr-FR")
                    : "";
                  return (
                    <div
                      key={log.id}
                      className="hover:bg-muted/50 hover:border-border flex items-start gap-4 rounded-xl border border-transparent p-3 transition-colors"
                    >
                      <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                        <UserCheck className="h-5 w-5" />
                      </div>
                      <div className="grow">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold capitalize">{log.action}</p>
                          <span className="text-muted-foreground text-xs">{date}</span>
                        </div>
                        <p className="text-muted-foreground mt-1 text-xs truncate">
                          {who} — {log.details || log.targetId || ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary"
                  onClick={() => window.open("/api/admin/audit-logs?format=csv", "_blank")}
                >
                  Exporter en CSV
                </Button>
              </div>
            )}
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
              <div className="bg-muted/30 flex items-center gap-3 rounded-xl p-3">
                <div className="bg-background flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold">
                  VD
                </div>
                <div className="min-w-0 grow">
                  <p className="truncate text-xs font-bold">Validations en attente</p>
                  <p className="text-muted-foreground text-[10px]">
                    Dossiers à contrôler dans Uploadthing
                  </p>
                </div>
                <Badge variant="secondary" className="text-[10px] font-bold">
                  {loading ? "..." : formatNumber(statsData?.onboarding.pending)}
                </Badge>
              </div>
              <Link href="/dashboard/vehicules" className="block">
                <Button variant="outline" size="sm" className="w-full font-semibold">
                  Accéder à la validation des véhicules
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reservations by status */}
      <Card className="bg-card/50 border-0 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Réservations par statut
          </CardTitle>
          <CardDescription>
            Répartition actuelle des réservations (toutes périodes)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {(statsData?.reservations.byStatus || []).map((item) => (
              <div
                key={item.statut}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2"
              >
                <span className="text-sm font-semibold capitalize">
                  {item.statut}
                </span>
                <Badge variant="secondary" className="text-xs font-bold">
                  {formatNumber(Number(item.count || 0))}
                </Badge>
              </div>
            ))}
            {(statsData?.reservations.byStatus?.length || 0) === 0 && (
              <p className="text-muted-foreground text-sm">Aucune donnée.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
