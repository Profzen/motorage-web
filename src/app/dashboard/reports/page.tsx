"use client";

import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Search,
  Eye,
  MessageSquare,
  User,
  MapPin,
  RefreshCw,
  Loader2,
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
  titre: string;
  description: string;
  statut: "en_attente" | "en_cours" | "resolu" | "rejete";
  createdAt: string;
  trajetId?: string | null;
  reporter: {
    id: string;
    nom: string;
    email: string;
    role: string;
  };
  reported: {
    id: string | null;
    nom: string | null;
    email: string | null;
    role: string | null;
  } | null;
  commentaireAdmin?: string | null;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statutFilter, setStatutFilter] = useState("");
  const [search, setSearch] = useState("");

  const statutOptions = [
    { value: "", label: "Tous les statuts" },
    { value: "en_attente", label: "En attente" },
    { value: "en_cours", label: "En cours" },
    { value: "resolu", label: "Résolu" },
    { value: "rejete", label: "Rejeté" },
  ];

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statutFilter) params.set("statut", statutFilter);
      const res = await fetch(`/api/admin/reports?${params.toString()}`, {
        credentials: "include",
      });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statutFilter]);

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

  const filteredReports = reports.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.titre.toLowerCase().includes(q) ||
      r.reporter.nom.toLowerCase().includes(q) ||
      r.reporter.email.toLowerCase().includes(q)
    );
  });

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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Signalements & Litiges
          </h1>
          <p className="text-muted-foreground">
            Gérez les plaintes et assurez la sécurité de la plateforme.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchReports}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Rafraîchir
        </Button>
      </div>

      <Card className="bg-card/50 border-0 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-72">
                <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                <Input
                  placeholder="Rechercher (titre, signaleur)"
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                value={statutFilter}
                onChange={(e) => setStatutFilter(e.target.value)}
                className="bg-background/80 h-10 rounded-md border px-3 text-sm"
              >
                {statutOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-muted-foreground">
              {reports.length} résultat(s)
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Signaleur</TableHead>
                <TableHead>Accusé</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Chargement...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-muted-foreground h-24 text-center"
                  >
                    Aucun signalement trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold">{report.titre}</span>
                        <span className="text-muted-foreground text-xs">
                          {new Date(report.createdAt).toLocaleDateString()} — {report.type}
                        </span>
                      </div>
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
                variant="ghost"
                onClick={() => handleAction("en_cours")}
                disabled={isSubmitting}
              >
                Mettre en cours
              </Button>
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
