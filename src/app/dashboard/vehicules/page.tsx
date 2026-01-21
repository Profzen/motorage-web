"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";

interface Vehicule {
  id: string;
  type: string | null;
  marque: string | null;
  modele: string | null;
  immatriculation: string | null;
  statut: "en_attente" | "approuvé" | "rejeté";
  commentaireAdmin: string | null;
  proprietaireId: string;
}

export default function VehiculesPage() {
  const [items, setItems] = useState<Vehicule[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/vehicules?statut=en_attente", {
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
      } else {
        toast.error("Erreur de chargement des véhicules");
      }
    } catch {
      toast.error("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (
    id: string,
    statut: "approuvé" | "rejeté",
    commentaireAdmin?: string
  ) => {
    try {
      setProcessingId(id);
      const res = await fetch(`/api/admin/vehicules/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut, commentaireAdmin }),
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Véhicule ${statut}`);
        fetchData();
      } else {
        toast.error(json.error?.message || "Action impossible");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setProcessingId(null);
    }
  };

  const statusBadge = (statut: Vehicule["statut"]) => {
    switch (statut) {
      case "en_attente":
        return (
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
            En attente
          </Badge>
        );
      case "approuvé":
        return (
          <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
            Approuvé
          </Badge>
        );
      case "rejeté":
        return (
          <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
            Rejeté
          </Badge>
        );
      default:
        return <Badge>{statut}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Validation des véhicules</h1>
          <p className="text-muted-foreground">Approuvez ou rejetez les véhicules soumis.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Rafraîchir
        </Button>
      </div>

      <Card className="bg-card/50 border-0 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Véhicules en attente</CardTitle>
          <CardDescription>{items.length} véhicule(s) en attente.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Chargement...
            </div>
          ) : items.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucun véhicule en attente.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marque / Modèle</TableHead>
                  <TableHead>Immatriculation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-semibold">
                      {v.marque || ""} {v.modele || ""}
                    </TableCell>
                    <TableCell>{v.immatriculation}</TableCell>
                    <TableCell>{statusBadge(v.statut)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={processingId === v.id}
                        onClick={() => handleAction(v.id, "rejeté")}
                      >
                        <XCircle className="mr-1 h-4 w-4" /> Rejeter
                      </Button>
                      <Button
                        size="sm"
                        disabled={processingId === v.id}
                        onClick={() => handleAction(v.id, "approuvé")}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" /> Approuver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
