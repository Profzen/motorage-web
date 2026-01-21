"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Activity,
  ArrowRightLeft,
  UserCheck,
  Search,
  Filter,
  Loader2,
  Calendar,
  Clock,
  ShieldCheck,
  History,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AuditLog {
  id: string;
  action: string;
  details?: string;
  createdAt: string;
  user: {
    nom: string;
    prenom: string;
    role: string;
    email: string;
  };
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchLogs = async () => {
      try {
        const response = await fetch("/api/admin/activity");
        const data = await response.json();
        if (data.success) {
          setLogs(data.data);
        }
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const searchMatch =
      log.details?.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.user?.nom.toLowerCase().includes(search.toLowerCase()) ||
      log.user?.prenom.toLowerCase().includes(search.toLowerCase());

    const actionMatch =
      filterAction === "all" ||
      (filterAction === "trajet" && log.action.includes("TRAJET")) ||
      (filterAction === "user" &&
        (log.action.includes("USER") || log.action.includes("LOGIN"))) ||
      (filterAction === "admin" && log.action.includes("ADMIN"));

    return searchMatch && actionMatch;
  });

  const getActionStyles = (action: string) => {
    if (action.includes("TRAJET"))
      return {
        icon: ArrowRightLeft,
        color: "text-blue-600",
        bg: "bg-blue-50",
        label: "Trajet",
      };
    if (action.includes("USER") || action.includes("LOGIN"))
      return {
        icon: UserCheck,
        color: "text-green-600",
        bg: "bg-green-50",
        label: "Utilisateur",
      };
    if (action.includes("ADMIN"))
      return {
        icon: ShieldCheck,
        color: "text-purple-600",
        bg: "bg-purple-50",
        label: "Admin",
      };
    return {
      icon: Activity,
      color: "text-gray-600",
      bg: "bg-gray-50",
      label: "Système",
    };
  };

  if (!mounted) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Flux d&apos;activité
          </h1>
          <p className="text-muted-foreground mt-1">
            Historique complet des actions et événements de la plateforme
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-8 px-3">
            {logs.length} événements
          </Badge>
        </div>
      </div>

      <Card className="bg-card/50 border-0 shadow-sm backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
              <Input
                placeholder="Rechercher une action, un utilisateur..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex w-full gap-2 md:w-auto">
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les actions</SelectItem>
                  <SelectItem value="trajet">Trajets</SelectItem>
                  <SelectItem value="user">Utilisateurs</SelectItem>
                  <SelectItem value="admin">Administration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <span className="ml-3 text-sm font-medium">
              Chargement des logs...
            </span>
          </div>
        ) : filteredLogs.length > 0 ? (
          <div className="grid gap-4">
            {filteredLogs.map((log) => {
              const style = getActionStyles(log.action);
              return (
                <Card
                  key={log.id}
                  className="hover:bg-muted/30 border-0 shadow-none transition-colors"
                >
                  <CardContent className="flex items-start gap-4 p-4">
                    <div
                      className={`rounded-full p-2.5 ${style.bg} ${style.color}`}
                    >
                      <style.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                        <p className="truncate text-sm font-bold">
                          {log.details || log.action}
                        </p>
                        <div className="text-muted-foreground flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(log.createdAt), "dd MMM yyyy", {
                              locale: fr,
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {format(new Date(log.createdAt), "HH:mm")}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                        <div className="flex items-center gap-1.5">
                          <div className="bg-primary/10 text-primary flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold">
                            {log.user?.prenom?.[0] || "?"}
                          </div>
                          <p className="text-muted-foreground text-xs font-medium">
                            {log.user?.prenom} {log.user?.nom}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-bold tracking-tight uppercase"
                        >
                          {log.user?.role}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px]"
                        >
                          {log.action}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed">
            <History className="text-muted-foreground/20 h-10 w-10" />
            <p className="text-muted-foreground text-sm font-medium">
              Aucun événement trouvé
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
