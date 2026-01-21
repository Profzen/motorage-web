"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Search,
  Users,
  Clock,
  Car,
  BadgeCheck,
  MoreVertical,
  Loader2,
  RefreshCw,
  AlertCircle,
  Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Trajet {
  id: string;
  pointDepart: string;
  destination: string;
  dateHeure: string;
  placesDisponibles: number;
  statut: string;
  conducteur: {
    nom: string;
    prenom: string;
    email: string;
    phone: string;
    avatar: string | null;
  };
  vehicule: {
    marque: string;
    modele: string;
    immatriculation: string;
    type: string;
  } | null;
  departZone: { nom: string } | null;
  arriveeZone: { nom: string } | null;
  reservations: Array<{
    id: string;
    etudiant: { nom: string; prenom: string };
    statut: string;
  }>;
}

export default function FluxTrajetsPage() {
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchTrajets = useCallback(
    async (isSilent = false) => {
      try {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);

        const params = new URLSearchParams({
          page: "1",
          limit: "50",
          status: statusFilter,
          search: search,
        });

        const res = await fetch(`/api/admin/flux?${params.toString()}`);
        const data = await res.json();

        if (data.success) {
          setTrajets(data.data);
        }
      } catch {
        toast.error("Erreur lors de la récupération du flux");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, statusFilter]
  );

  useEffect(() => {
    fetchTrajets();
  }, [fetchTrajets]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchTrajets(true);
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh, fetchTrajets]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ouvert":
        return (
          <Badge className="border-0 bg-green-500/10 text-green-600 hover:bg-green-500/20">
            Ouvert
          </Badge>
        );
      case "plein":
        return (
          <Badge className="border-0 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
            Plein
          </Badge>
        );
      case "terminé":
        return (
          <Badge className="border-0 bg-gray-500/10 text-gray-600 hover:bg-gray-500/20">
            Terminé
          </Badge>
        );
      case "annulé":
        return (
          <Badge className="border-0 bg-red-500/10 text-red-600 hover:bg-red-500/20">
            Annulé
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleUpdateStatus = async (trajetId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/trajets/${trajetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Trajet marqué comme ${newStatus}`);
        fetchTrajets(true);
      } else {
        toast.error(data.error || "Erreur lors de la mise à jour");
      }
    } catch {
      toast.error("Erreur serveur");
    }
  };

  if (!mounted) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in space-y-8 duration-700">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight">
            <div className="bg-primary/10 rounded-xl p-2">
              <Zap className="text-primary h-6 w-6 animate-pulse" />
            </div>
            Flux Live des Trajets
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            Supervision en temps réel de l&apos;activité sur le campus.
            {refreshing && <Loader2 className="h-3 w-3 animate-spin" />}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTrajets()}
            className="border-2 font-bold"
          >
            <RefreshCw
              className={cn("mr-2 h-4 w-4", refreshing && "animate-spin")}
            />
            Actualiser
          </Button>
          <div className="bg-muted/30 flex items-center gap-2 rounded-full border border-dashed px-3 py-1.5">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                autoRefresh
                  ? "animate-pulse bg-green-500"
                  : "bg-muted-foreground"
              )}
            />
            <span className="text-[10px] font-black tracking-widest uppercase">
              Live {autoRefresh ? "On" : "Off"}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 rounded-full"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="bg-card/50 border-0 shadow-sm backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative min-w-[300px] flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Rechercher un départ, une destination..."
                className="bg-background/50 focus-visible:ring-primary/20 border-0 pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-background/50 w-[180px] border-0">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="ouvert">Ouvert</SelectItem>
                <SelectItem value="plein">Plein</SelectItem>
                <SelectItem value="terminé">Terminé</SelectItem>
                <SelectItem value="annulé">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Flux Stream */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {loading ? (
          <div className="col-span-full flex h-64 flex-col items-center justify-center gap-4">
            <Loader2 className="text-primary h-10 w-10 animate-spin" />
            <p className="text-muted-foreground animate-pulse font-bold">
              Chargement du flux opérationnel...
            </p>
          </div>
        ) : trajets.length > 0 ? (
          <AnimatePresence>
            {trajets.map((trajet, index) => (
              <motion.div
                key={trajet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group hover:shadow-primary/5 bg-card/60 border-l-primary/20 hover:border-l-primary overflow-hidden border-0 border-l-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-xl">
                  <CardContent className="p-0">
                    <div className="space-y-4 p-5">
                      {/* Top Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="border-background h-10 w-10 border-2 shadow-sm">
                            <AvatarImage
                              src={trajet.conducteur.avatar || undefined}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {trajet.conducteur.prenom[0]}
                              {trajet.conducteur.nom[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="flex items-center gap-1 text-sm leading-none font-bold">
                              {trajet.conducteur.prenom} {trajet.conducteur.nom}
                              <BadgeCheck className="h-3 w-3 text-blue-500" />
                            </p>
                            <p className="text-muted-foreground mt-1 flex items-center gap-1 text-[10px]">
                              <Car className="h-2 w-2" />
                              {trajet.vehicule?.marque}{" "}
                              {trajet.vehicule?.modele} •{" "}
                              {trajet.vehicule?.immatriculation}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(trajet.statut)}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateStatus(trajet.id, "terminé")
                                }
                                disabled={
                                  trajet.statut === "terminé" ||
                                  trajet.statut === "annulé"
                                }
                              >
                                Marquer comme terminé
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateStatus(trajet.id, "annulé")
                                }
                                className="text-destructive focus:text-destructive"
                                disabled={
                                  trajet.statut === "terminé" ||
                                  trajet.statut === "annulé"
                                }
                              >
                                Annuler le trajet
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Route Info */}
                      <div className="before:from-primary before:to-primary/10 relative space-y-4 pl-6 before:absolute before:top-[12px] before:bottom-[12px] before:left-[11px] before:w-[2px] before:bg-linear-to-b">
                        <div className="relative">
                          <div className="bg-primary absolute top-1/2 -left-[19px] flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full">
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                          </div>
                          <div>
                            <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
                              Point de Départ
                            </p>
                            <p className="flex items-center gap-2 text-sm font-bold">
                              {trajet.pointDepart}
                              {trajet.departZone && (
                                <Badge
                                  variant="outline"
                                  className="bg-primary/5 h-4 py-0 text-[8px] font-bold"
                                >
                                  {trajet.departZone.nom}
                                </Badge>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="bg-muted border-primary absolute top-1/2 -left-[19px] flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full border-2">
                            <div className="bg-primary h-1.5 w-1.5 rounded-full" />
                          </div>
                          <div>
                            <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
                              Destination
                            </p>
                            <p className="flex items-center gap-2 text-sm font-bold">
                              {trajet.destination}
                              {trajet.arriveeZone && (
                                <Badge
                                  variant="outline"
                                  className="bg-primary/5 h-4 py-0 text-[8px] font-bold"
                                >
                                  {trajet.arriveeZone.nom}
                                </Badge>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Footer Info */}
                      <div className="flex items-center justify-between border-t border-dashed pt-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <Clock className="text-muted-foreground h-3 w-3" />
                            <span className="text-xs font-semibold">
                              {format(new Date(trajet.dateHeure), "HH:mm", {
                                locale: fr,
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="text-muted-foreground h-3 w-3" />
                            <span className="text-xs font-semibold">
                              {trajet.reservations.length} /{" "}
                              {trajet.reservations.length +
                                trajet.placesDisponibles}{" "}
                              passagers
                            </span>
                          </div>
                        </div>

                        <div className="flex -space-x-2">
                          {trajet.reservations.slice(0, 3).map((res) => (
                            <TooltipContainer
                              key={res.id}
                              text={`${res.etudiant.prenom} ${res.etudiant.nom}`}
                            >
                              <Avatar className="border-background ring-primary/10 h-6 w-6 border-2 ring-1">
                                <AvatarFallback className="bg-muted text-[8px] font-black">
                                  {res.etudiant.prenom[0]}
                                </AvatarFallback>
                              </Avatar>
                            </TooltipContainer>
                          ))}
                          {trajet.reservations.length > 3 && (
                            <div className="bg-muted border-background flex h-6 w-6 items-center justify-center rounded-full border-2 text-[8px] font-black">
                              +{trajet.reservations.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="bg-muted/20 col-span-full flex h-64 flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed">
            <AlertCircle className="text-muted-foreground/30 h-12 w-12" />
            <div className="text-center">
              <p className="text-muted-foreground font-bold">
                Aucun trajet actif sur le flux
              </p>
              <p className="text-muted-foreground/60 text-xs">
                Ajustez vos filtres ou attendez une nouvelle publication.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Composant Helper pour le Tooltip simplifié
function TooltipContainer({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) {
  return (
    <div className="group relative">
      {children}
      <div className="bg-foreground text-background absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 rounded px-2 py-1 text-[10px] font-bold whitespace-nowrap group-hover:block">
        {text}
        <div className="border-t-foreground absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent" />
      </div>
    </div>
  );
}
