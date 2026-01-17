"use client";

import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  Eye,
  MessageSquare,
  User,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Report {
  id: string;
  type: string;
  description: string;
  statut: "en_attente" | "en_cours" | "resolu" | "rejete";
  createdAt: string;
  trajetId?: string;
  reporter: {
    id: string;
    nom: string;
    email: string;
    role: string;
  };
  reported: {
    id: string;
    nom: string;
    email: string;
    role: string;
  };
  commentaireAdmin?: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reports");
      const data = await res.json();
      if (data.success) {
        setReports(data.data);
      }
    } catch {
      toast.error("Erreur lors du chargement des signalements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "en_attente":
        return (
          <Badge
            variant="outline"
            className="border-yellow-200 bg-yellow-100 text-yellow-800"
          >
            En attente
          </Badge>
        );
      case "en_cours":
        return (
          <Badge
            variant="outline"
            className="border-blue-200 bg-blue-100 text-blue-800"
          >
            En cours
          </Badge>
        );
      case "resolu":
        return (
          <Badge
            variant="outline"
            className="border-green-200 bg-green-100 text-green-800"
          >
            Résolu
          </Badge>
        );
      case "rejete":
        return (
          <Badge
            variant="outline"
            className="border-slate-200 bg-slate-100 text-slate-800"
          >
            Classé
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "comportement":
        return <Badge variant="destructive">Comportement</Badge>;
      case "securite":
        return <Badge className="bg-orange-500">Sécurité</Badge>;
      case "retard":
        return <Badge className="bg-blue-500">Retard</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const handleAction = async (status: "resolu" | "rejete" | "en_cours") => {
    if (!selectedReport) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/reports/${selectedReport.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statut: status,
          commentaireAdmin: adminNote,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Signalement mis à jour : ${status}`);
        fetchReports();
        setSelectedReport(null);
        setAdminNote("");
      } else {
        toast.error(data.message || "Erreur lors de la mise à jour");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Signalements & Litiges
          </h1>
          <p className="text-muted-foreground">
            Gérez les plaintes et assurez la sécurité de la plateforme.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative w-72">
                <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                <Input placeholder="Rechercher..." className="pl-9" />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" /> Filtres
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Signaleur</TableHead>
                <TableHead>Accusé</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6} className="h-12 text-center">
                        Chargement...
                      </TableCell>
                    </TableRow>
                  ))
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-muted-foreground h-24 text-center"
                  >
                    Aucun signalement trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getTypeBadge(report.type)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {report.reporter.nom}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {report.reporter.role}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {report.reported?.nom || "N/A"}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {report.reported?.role || ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(report.statut)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedReport(report)}
                      >
                        <Eye className="mr-2 h-4 w-4" /> Détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedReport}
        onOpenChange={(open: boolean) => !open && setSelectedReport(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              Détails du Signalement
            </DialogTitle>
            <DialogDescription>
              Examen des faits rapportés le{" "}
              {selectedReport &&
                new Date(selectedReport.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg border p-4">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <User className="h-4 w-4" /> Signaleur
                </h4>
                <p className="text-sm font-medium">
                  {selectedReport?.reporter.nom}
                </p>
                <p className="text-muted-foreground text-xs">
                  {selectedReport?.reporter.email}
                </p>
              </div>

              <div className="rounded-lg border border-red-100 bg-red-50/30 p-4">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-900">
                  <User className="h-4 w-4" /> Accusé
                </h4>
                <p className="text-sm font-medium">
                  {selectedReport?.reported?.nom || "N/A"}
                </p>
                <p className="text-muted-foreground text-xs">
                  {selectedReport?.reported?.email || ""}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <MessageSquare className="h-4 w-4" /> Description
                </h4>
                <p className="text-muted-foreground text-sm">
                  {selectedReport?.description}
                </p>
              </div>

              {selectedReport?.trajetId && (
                <div className="rounded-lg border border-blue-100 bg-blue-50/30 p-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900">
                    <MapPin className="h-4 w-4" /> Trajet associé
                  </h4>
                  <p className="text-sm font-medium">
                    ID: {selectedReport.trajetId}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Commentaire de l&apos;administrateur
            </label>
            <Textarea
              placeholder="Notes sur la résolution..."
              value={adminNote}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setAdminNote(e.target.value)
              }
              className="h-24"
            />
          </div>

          <DialogFooter className="flex gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              Fermer
            </Button>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => handleAction("rejete")}
                disabled={isSubmitting}
              >
                Rejeter
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleAction("resolu")}
                disabled={isSubmitting}
              >
                Résoudre
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
