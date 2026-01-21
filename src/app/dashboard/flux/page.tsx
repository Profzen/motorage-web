"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ArrowRightLeft,
  Search,
  Filter,
  Users,
  Clock,
  MapPin,
  Car,
  BadgeCheck,
  MoreVertical,
  Loader2,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  User,
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

  const fetchTrajets = useCallback(async (isSilent = false) => {
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
    } catch (error) {
      toast.error("Erreur lors de la récupération du flux");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, statusFilter]);

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
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-0">Ouvert</Badge>;
      case "plein":
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-0">Plein</Badge>;
      case "terminé":
        return <Badge className="bg-gray-500/10 text-gray-600 hover:bg-gray-500/20 border-0">Terminé</Badge>;
      case "annulé":
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-0">Annulé</Badge>;
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
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Zap className="h-6 w-6 text-primary animate-pulse" />
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
            className="font-bold border-2"
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", refreshing && "animate-spin")} />
            Actualiser
          </Button>
          <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-dashed">
            <div className={cn("h-2 w-2 rounded-full", autoRefresh ? "bg-green-500 animate-pulse" : "bg-muted-foreground")} />
            <span className="text-[10px] font-black uppercase tracking-widest">
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
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un départ, une destination..."
                className="pl-10 bg-background/50 border-0 focus-visible:ring-primary/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-background/50 border-0">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="font-bold text-muted-foreground animate-pulse">Chargement du flux opérationnel...</p>
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
                <Card className="group border-0 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden bg-card/60 backdrop-blur-md border-l-4 border-l-primary/20 hover:border-l-primary">
                  <CardContent className="p-0">
                    <div className="p-5 space-y-4">
                      {/* Top Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                            <AvatarImage src={trajet.conducteur.avatar || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {trajet.conducteur.prenom[0]}{trajet.conducteur.nom[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-sm leading-none flex items-center gap-1">
                              {trajet.conducteur.prenom} {trajet.conducteur.nom}
                              <BadgeCheck className="h-3 w-3 text-blue-500" />
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                              <Car className="h-2 w-2" /> 
                              {trajet.vehicule?.marque} {trajet.vehicule?.modele} • {trajet.vehicule?.immatriculation}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(trajet.statut)}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(trajet.id, "terminé")}
                                disabled={trajet.statut === "terminé" || trajet.statut === "annulé"}
                              >
                                Marquer comme terminé
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(trajet.id, "annulé")}
                                className="text-destructive focus:text-destructive"
                                disabled={trajet.statut === "terminé" || trajet.statut === "annulé"}
                              >
                                Annuler le trajet
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Route Info */}
                      <div className="relative pl-6 space-y-4 before:absolute before:left-[11px] before:top-[12px] before:bottom-[12px] before:w-[2px] before:bg-linear-to-b before:from-primary before:to-primary/10">
                        <div className="relative">
                          <div className="absolute -left-[19px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Point de Départ</p>
                            <p className="text-sm font-bold flex items-center gap-2">
                              {trajet.pointDepart}
                              {trajet.departZone && (
                                <Badge variant="outline" className="text-[8px] h-4 py-0 font-bold bg-primary/5">
                                  {trajet.departZone.nom}
                                </Badge>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute -left-[19px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-muted border-2 border-primary flex items-center justify-center">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Destination</p>
                            <p className="text-sm font-bold flex items-center gap-2">
                              {trajet.destination}
                              {trajet.arriveeZone && (
                                <Badge variant="outline" className="text-[8px] h-4 py-0 font-bold bg-primary/5">
                                  {trajet.arriveeZone.nom}
                                </Badge>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Footer Info */}
                      <div className="pt-4 border-t border-dashed flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-semibold">
                              {format(new Date(trajet.dateHeure), "HH:mm", { locale: fr })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-semibold">
                              {trajet.reservations.length} / {trajet.reservations.length + trajet.placesDisponibles} passagers
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex -space-x-2">
                          {trajet.reservations.slice(0, 3).map((res) => (
                            <TooltipContainer key={res.id} text={`${res.etudiant.prenom} ${res.etudiant.nom}`}>
                              <Avatar className="h-6 w-6 border-2 border-background ring-1 ring-primary/10">
                                <AvatarFallback className="text-[8px] bg-muted font-black">
                                  {res.etudiant.prenom[0]}
                                </AvatarFallback>
                              </Avatar>
                            </TooltipContainer>
                          ))}
                          {trajet.reservations.length > 3 && (
                            <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[8px] font-black">
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
          <div className="col-span-full h-64 flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-3xl bg-muted/20">
            <AlertCircle className="h-12 w-12 text-muted-foreground/30" />
            <div className="text-center">
              <p className="font-bold text-muted-foreground">Aucun trajet actif sur le flux</p>
              <p className="text-xs text-muted-foreground/60">Ajustez vos filtres ou attendez une nouvelle publication.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Composant Helper pour le Tooltip simplifié
function TooltipContainer({ children, text }: { children: React.ReactNode, text: string }) {
  return (
    <div className="group relative">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-foreground text-background text-[10px] px-2 py-1 rounded font-bold whitespace-nowrap z-50">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
      </div>
    </div>
  );
}
