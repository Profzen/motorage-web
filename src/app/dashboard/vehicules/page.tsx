"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Car,
  Search,
  Eye,
  Loader2,
  Filter,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Vehicule {
  id: string;
  type: string;
  marque: string;
  modele: string;
  immatriculation: string;
  statut: "en_attente" | "approuvé" | "rejeté";
  commentaireAdmin: string | null;
  createdAt: string;
  proprietaire: {
    nom: string;
    prenom: string;
    email: string;
  };
}

export default function VehiculesValidationPage() {
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("en_attente");
  const [search, setSearch] = useState("");
  const [selectedVehicule, setSelectedVehicule] = useState<Vehicule | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [comment, setComment] = useState("");

  const fetchVehicules = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL("/api/admin/vehicules", window.location.origin);
      if (filterStatus && filterStatus !== "all") {
        url.searchParams.append("statut", filterStatus);
      }
      const res = await fetch(url.toString());
      const result = await res.json();
      if (result.success) {
        setVehicules(result.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch vehicules", error);
      toast.error("Erreur lors du chargement des véhicules");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    setMounted(true);
    fetchVehicules();
  }, [fetchVehicules]);

  const handleAction = async (id: string, statut: "approuvé" | "rejeté") => {
    try {
      setIsProcessing(true);
      const res = await fetch(`/api/admin/vehicules/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut, commentaireAdmin: comment }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(
          `Véhicule ${statut === "approuvé" ? "approuvé" : "rejeté"} avec succès`
        );
        setSelectedVehicule(null);
        setComment("");
        fetchVehicules();
      } else {
        toast.error(result.message || "Une erreur est survenue");
      }
    } catch {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredVehicules = vehicules.filter((v) => {
    const searchStr = search.toLowerCase();
    return (
      v.immatriculation.toLowerCase().includes(searchStr) ||
      v.marque.toLowerCase().includes(searchStr) ||
      v.modele.toLowerCase().includes(searchStr) ||
      v.proprietaire?.nom.toLowerCase().includes(searchStr) ||
      v.proprietaire?.prenom.toLowerCase().includes(searchStr)
    );
  });

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Gestion des Véhicules
          </h1>
          <p className="text-muted-foreground mt-1">
            Validez les nouveaux véhicules ajoutés par les conducteurs
          </p>
        </div>
      </div>

      <Card className="bg-card/50 border-0 shadow-sm backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
              <Input
                placeholder="Rechercher par immatriculation, marque, propriétaire..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="approuvé">Approuvés</SelectItem>
                  <SelectItem value="rejeté">Rejetés</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchVehicules()}
              >
                <Loader2
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex h-64 flex-col items-center justify-center gap-2">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <p className="text-muted-foreground animate-pulse text-sm font-medium">
              Chargement des véhicules...
            </p>
          </div>
        ) : filteredVehicules.length > 0 ? (
          filteredVehicules.map((v) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="group relative overflow-hidden border-0 shadow-sm transition-all hover:shadow-md">
                <div
                  className={`absolute top-0 left-0 h-full w-1 ${
                    v.statut === "en_attente"
                      ? "bg-amber-500"
                      : v.statut === "approuvé"
                        ? "bg-green-500"
                        : "bg-red-500"
                  }`}
                />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Car className="text-primary h-4 w-4" />
                        <h3 className="font-black tracking-tight uppercase">
                          {v.immatriculation}
                        </h3>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {v.marque} {v.modele} • {v.type}
                      </p>
                    </div>
                    <Badge
                      variant={
                        v.statut === "en_attente"
                          ? "outline"
                          : v.statut === "approuvé"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-[10px] font-bold uppercase"
                    >
                      {v.statut}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-muted/30 flex items-center gap-3 rounded-xl p-3">
                      <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
                        {v.proprietaire?.prenom?.[0]}
                        {v.proprietaire?.nom?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold">
                          {v.proprietaire?.prenom} {v.proprietaire?.nom}
                        </p>
                        <p className="text-muted-foreground text-[10px]">
                          Propriétaire
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => setSelectedVehicule(v)}
                      >
                        <Eye className="mr-2 h-3 w-3" />
                        Détails
                      </Button>
                      {v.statut === "en_attente" && (
                        <>
                          <Button
                            variant="default"
                            className="h-9 w-9 bg-green-600 p-0 hover:bg-green-700"
                            onClick={() => {
                              setSelectedVehicule(v);
                              setComment("");
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            className="h-9 w-9 p-0"
                            onClick={() => {
                              setSelectedVehicule(v);
                              setComment("");
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed">
            <AlertCircle className="text-muted-foreground/20 h-10 w-10" />
            <div className="text-center">
              <p className="text-muted-foreground font-bold">Aucun véhicule</p>
              <p className="text-muted-foreground text-xs">
                Aucun véhicule ne correspond à vos critères.
              </p>
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={!!selectedVehicule}
        onOpenChange={(open) => !open && setSelectedVehicule(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          {selectedVehicule && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl font-black">
                  {selectedVehicule.immatriculation}
                </DialogTitle>
                <DialogDescription>
                  Détails du véhicule et validation
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-[10px] font-bold uppercase">
                    Marque / Modèle
                  </p>
                  <p className="font-bold">
                    {selectedVehicule.marque} {selectedVehicule.modele}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-[10px] font-bold uppercase">
                    Type
                  </p>
                  <Badge variant="outline">{selectedVehicule.type}</Badge>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-muted-foreground text-[10px] font-bold uppercase">
                    Propriétaire
                  </p>
                  <p className="font-bold">
                    {selectedVehicule.proprietaire?.prenom}{" "}
                    {selectedVehicule.proprietaire?.nom}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {selectedVehicule.proprietaire?.email}
                  </p>
                </div>
                {selectedVehicule.statut === "en_attente" && (
                  <div className="col-span-2 mt-4 space-y-2">
                    <label className="text-xs font-bold">
                      Commentaire (optionnel pour approuver, nécessaire pour
                      rejeter)
                    </label>
                    <Input
                      placeholder="Indiquez le motif en cas de rejet..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                {selectedVehicule.statut === "en_attente" ? (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() =>
                        handleAction(selectedVehicule.id, "rejeté")
                      }
                      disabled={isProcessing || !comment}
                      className="flex-1"
                    >
                      {isProcessing ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Rejeter"
                      )}
                    </Button>
                    <Button
                      variant="default"
                      onClick={() =>
                        handleAction(selectedVehicule.id, "approuvé")
                      }
                      disabled={isProcessing}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Approuver"
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setSelectedVehicule(null)}
                    className="w-full"
                  >
                    Fermer
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
