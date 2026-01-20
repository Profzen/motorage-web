"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ClipboardCheck,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  User,
  FileText,
  Loader2,
  Car,
  Filter,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
import Image from "next/image";

interface OnboardingRequest {
  id: string;
  userId: string;
  permisNumero: string;
  permisImage: string | null;
  vehiculeMarque: string;
  vehiculeModele: string;
  vehiculeImmatriculation: string;
  statut: "en_attente" | "approuvé" | "rejeté";
  commentaireAdmin: string | null;
  createdAt: string;
  user?: {
    nom: string;
    prenom: string;
    email: string;
  };
}

export default function DriversValidationPage() {
  const [requests, setRequests] = useState<OnboardingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("en_attente");
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] =
    useState<OnboardingRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [comment, setComment] = useState("");

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL(
        "/api/admin/driver-applications",
        window.location.origin
      );
      if (filterStatus && filterStatus !== "all") {
        url.searchParams.append("statut", filterStatus);
      }
      const res = await fetch(url.toString());
      const result = await res.json();
      if (result.success) {
        setRequests(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch requests", error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filteredRequests = requests.filter(
    (req) =>
      req.user?.nom.toLowerCase().includes(search.toLowerCase()) ||
      req.user?.prenom.toLowerCase().includes(search.toLowerCase()) ||
      req.vehiculeImmatriculation.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = async (id: string, statut: "approuvé" | "rejeté") => {
    try {
      setIsProcessing(true);
      const res = await fetch(`/api/admin/driver-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut, commentaireAdmin: comment }),
      });
      const result = await res.json();

      if (result.success) {
        toast.success(`Demande ${statut}`, {
          description: `Le dossier a été traité avec succès.`,
        });
        setSelectedRequest(null);
        setComment("");
        fetchRequests();
      } else {
        toast.error("Erreur", {
          description: result.error?.message || "Une erreur est survenue",
        });
      }
    } catch {
      toast.error("Erreur", {
        description: "Impossible de contacter le serveur",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "en_attente":
        return (
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 text-amber-700"
          >
            En attente
          </Badge>
        );
      case "approuvé":
        return (
          <Badge
            variant="outline"
            className="border-green-200 bg-green-50 text-green-700"
          >
            Approuvé
          </Badge>
        );
      case "rejeté":
        return (
          <Badge
            variant="outline"
            className="border-red-200 bg-red-50 text-red-700"
          >
            Rejeté
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-700">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight">
            <ClipboardCheck className="text-primary h-8 w-8" />
            Validation Conducteurs
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez les demandes d&apos;onboarding et vérifiez les documents.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Rechercher..."
              className="bg-card/50 w-48 pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-card/50 w-40">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Statut" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="en_attente">En attente</SelectItem>
              <SelectItem value="approuvé">Approuvé</SelectItem>
              <SelectItem value="rejeté">Rejeté</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchRequests} variant="outline" size="icon">
            <Loader2 className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <Card className="bg-card/50 border-0 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            Files d&apos;attente des dossiers
          </CardTitle>
          <CardDescription>
            {requests.length} demande(s) trouvée(s) au total.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-4 py-20">
              <Loader2 className="text-primary h-10 w-10 animate-spin" />
              <p className="font-medium">Chargement des dossiers...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed py-20">
              <CheckCircle className="h-12 w-12 opacity-20" />
              <p className="text-lg font-medium">Aucun dossier trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-border/50 border-b">
                  <tr className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    <th className="px-4 py-4">Utilisateur</th>
                    <th className="px-4 py-4">Véhicule</th>
                    <th className="px-4 py-4">Date</th>
                    <th className="px-4 py-4">Statut</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-border/50 divide-y">
                  <AnimatePresence>
                    {filteredRequests.map((req, idx) => (
                      <motion.tr
                        key={req.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold">
                              {req.user?.prenom[0]}
                              {req.user?.nom[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold">
                                {req.user?.prenom} {req.user?.nom}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {req.user?.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium">
                            {req.vehiculeMarque} {req.vehiculeModele}
                          </p>
                          <p className="text-muted-foreground text-xs uppercase">
                            {req.vehiculeImmatriculation}
                          </p>
                        </td>
                        <td className="text-muted-foreground px-4 py-4 text-sm">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={req.statut} />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 text-xs font-bold"
                            onClick={() => setSelectedRequest(req)}
                          >
                            <Eye className="h-4 w-4" />
                            Examiner
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal d'examen du dossier */}
      <Dialog
        open={!!selectedRequest}
        onOpenChange={(open: boolean) => !open && setSelectedRequest(null)}
      >
        <DialogContent className="overflow-hidden border-0 p-0 shadow-2xl sm:max-w-150">
          <DialogHeader className="bg-primary text-primary-foreground p-6">
            <DialogTitle className="text-2xl font-black">
              Examen du dossier
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80 font-medium">
              Vérifiez l&apos;identité et les documents avant validation.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[70vh] space-y-6 overflow-y-auto p-6">
            <section className="space-y-3">
              <h4 className="text-muted-foreground flex items-center gap-2 text-xs font-black tracking-widest uppercase">
                <User className="h-4 w-4" /> Information Utilisateur
              </h4>
              <div className="bg-muted/50 border-border flex items-center gap-4 rounded-xl border p-4">
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full font-bold">
                  {selectedRequest?.user?.prenom[0]}
                  {selectedRequest?.user?.nom[0]}
                </div>
                <div>
                  <p className="text-lg font-black">
                    {selectedRequest?.user?.prenom} {selectedRequest?.user?.nom}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {selectedRequest?.user?.email}
                  </p>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-6">
              <section className="space-y-3">
                <h4 className="text-muted-foreground flex items-center gap-2 text-xs font-black tracking-widest uppercase">
                  <FileText className="h-4 w-4" /> Permis de conduire
                </h4>
                <div className="bg-muted/50 border-border rounded-xl border p-4">
                  <p className="text-muted-foreground text-xs font-bold uppercase">
                    Numéro
                  </p>
                  <p className="mt-1 text-lg font-bold tabular-nums">
                    {selectedRequest?.permisNumero}
                  </p>

                  {selectedRequest?.permisImage ? (
                    <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-lg shadow-inner">
                      <Image
                        src={selectedRequest.permisImage}
                        alt="Permis de conduire"
                        fill
                        className="object-cover transition-transform hover:scale-110"
                      />
                    </div>
                  ) : (
                    <div className="bg-muted mt-4 flex aspect-video w-full items-center justify-center rounded-lg border-2 border-dashed">
                      <ImageIcon className="text-muted-foreground h-8 w-8 opacity-20" />
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-muted-foreground flex items-center gap-2 text-xs font-black tracking-widest uppercase">
                  <Car className="h-4 w-4" /> Véhicule
                </h4>
                <div className="bg-muted/50 border-border rounded-xl border p-4">
                  <p className="text-muted-foreground text-xs font-bold uppercase">
                    Modèle & Plaque
                  </p>
                  <p className="mt-1 text-lg font-bold">
                    {selectedRequest?.vehiculeMarque}{" "}
                    {selectedRequest?.vehiculeModele}
                  </p>
                  <Badge variant="secondary" className="mt-1 font-black">
                    {selectedRequest?.vehiculeImmatriculation}
                  </Badge>
                </div>
              </section>
            </div>

            <section className="space-y-3">
              <h4 className="text-muted-foreground text-xs font-black tracking-widest uppercase">
                Commentaires Admin (Optionnel)
              </h4>
              <textarea
                className="bg-background focus:ring-primary h-24 w-full rounded-xl border p-3 text-sm focus:ring-2"
                placeholder="Indiquez la raison du rejet ou un message d'encouragement..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </section>
          </div>

          <DialogFooter className="bg-muted/30 flex flex-row items-center justify-between border-t p-6 sm:justify-between">
            <Button
              variant="destructive"
              className="gap-2 px-6 font-bold"
              onClick={() => {
                if (!comment.trim()) {
                  toast.error("Motif requis", {
                    description:
                      "Veuillez indiquer la raison du rejet pour informer le conducteur.",
                  });
                  return;
                }
                handleAction(selectedRequest!.id, "rejeté");
              }}
              disabled={isProcessing}
            >
              <XCircle className="h-4 w-4" />
              Rejeter
            </Button>
            <Button
              className="gap-2 bg-green-600 px-6 font-bold hover:bg-green-700"
              onClick={() => handleAction(selectedRequest!.id, "approuvé")}
              disabled={isProcessing}
            >
              <CheckCircle className="h-4 w-4" />
              Approuver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
