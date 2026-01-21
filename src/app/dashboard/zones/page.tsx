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
  MapPin,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  Map,
  MoreVertical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";

interface Zone {
  id: string;
  nom: string;
  description: string | null;
  createdAt: string;
}

export default function ZonesManagementPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
  });

  const fetchZones = async () => {
    try {
      setLoading(true);
      console.log("Fetching zones...");
      const res = await fetch("/api/zones");
      const result = await res.json();
      console.log("Zones API result:", result);
      if (result.success) {
        setZones(Array.isArray(result.data) ? result.data : []);
      }
    } catch (error) {
      console.error("Failed to fetch zones", error);
      toast.error("Erreur lors du chargement des zones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Date inconnue";
    try {
      // Gérer le format SQLite (YYYY-MM-DD HH:mm:ss) vers ISO pour Safari/Firefox
      const isoString = dateString.replace(" ", "T");
      return new Date(isoString).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      return "Format invalide";
    }
  };

  const handleOpenDialog = (zone: Zone | null = null) => {
    if (zone) {
      setSelectedZone(zone);
      setFormData({
        nom: zone.nom,
        description: zone.description || "",
      });
    } else {
      setSelectedZone(null);
      setFormData({
        nom: "",
        description: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom.trim()) {
      toast.error("Le nom de la zone est requis");
      return;
    }

    try {
      setIsSaving(true);
      const url = selectedZone ? `/api/zones/${selectedZone.id}` : "/api/zones";
      const method = selectedZone ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(
          selectedZone ? "Zone modifiée avec succès" : "Zone créée avec succès"
        );
        setIsDialogOpen(false);
        fetchZones();
      } else {
        toast.error(result.error?.message || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Save zone error:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette zone ?")) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/zones/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (result.success) {
        toast.success("Zone supprimée");
        fetchZones();
      } else {
        toast.error(result.error?.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Delete zone error:", error);
      toast.error("Erreur technique");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredZones = zones.filter((zone) =>
    zone.nom.toLowerCase().includes(search.toLowerCase()) ||
    (zone.description && zone.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="animate-in fade-in space-y-8 duration-700">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight">
            <Map className="text-primary h-8 w-8" />
            Gestion des Zones
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Définissez les points de départ et d'arrivée desservis sur le campus.
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="gap-2 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105"
        >
          <Plus className="h-5 w-5" />
          Nouvelle Zone
        </Button>
      </div>

      {/* Barre d'outils */}
      <Card className="bg-card/50 border-0 shadow-sm backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Rechercher une zone (ex: Entrée Nord, Scénario...)"
              className="pl-10 h-11 bg-background/50 border-primary/10 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des Zones */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <Loader2 className="text-primary h-10 w-10 animate-spin" />
          <p className="text-muted-foreground font-medium">Chargement des zones...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredZones.map((zone) => (
              <motion.div
                key={zone.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className="group hover:border-primary/30 h-full border-2 border-transparent transition-all hover:shadow-xl">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleOpenDialog(zone)}>
                            <Edit2 className="mr-2 h-4 w-4" /> Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(zone.id)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-lg font-black tracking-tight">{zone.nom}</h3>
                    <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                      {zone.description || "Aucune description fournie pour cette zone."}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                          Créée le
                        </span>
                        <span className="text-xs font-semibold">
                          {formatDate(zone.createdAt)}
                        </span>
                      </div>
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                        Campus Lomé
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredZones.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center">
              <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <MapPin className="text-muted-foreground h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold">Aucune zone trouvée</h3>
              <p className="text-muted-foreground">
                {search ? "Ajustez votre recherche" : "Commencez par créer une zone."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Dialogue Create/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              {selectedZone ? "Modifier la Zone" : "Nouvelle Zone"}
            </DialogTitle>
            <DialogDescription>
              {selectedZone
                ? "Mettez à jour les informations de ce point de ramassage."
                : "Ajoutez un nouveau point de départ ou d'arrivée sur le campus."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold tracking-tight">Nom de la Zone</label>
              <Input
                placeholder="Ex: Entrée Nord, Bloc P..."
                className="h-11 rounded-xl"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold tracking-tight">Description</label>
              <Textarea
                placeholder="Position exacte, points de repère..."
                className="min-h-24 rounded-xl"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl font-bold"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="gap-2 rounded-xl font-bold px-8 shadow-lg shadow-primary/20"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {selectedZone ? "Sauvegarder les modifications" : "Créer la zone"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
