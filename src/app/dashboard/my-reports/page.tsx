"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserReport {
  id: string;
  type: string;
  description: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
  adminResponse?: string;
}

export default function MyReportsPage() {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch
    setTimeout(() => {
      setReports([
        {
          id: "REP-992",
          type: "Conduite dangereuse",
          description: "Vitesse excessive lors du trajet d'hier soir.",
          status: "pending",
          createdAt: "2023-10-27T10:30:00Z",
        },
        {
          id: "REP-451",
          type: "Paiement",
          description:
            "Le prix payé était différent du prix affiché dans l'appli.",
          status: "resolved",
          createdAt: "2023-10-20T15:45:00Z",
          adminResponse:
            "Nous avons vérifié le trajet. Un remboursement de la différence a été crédité sur votre compte.",
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "resolved":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "dismissed":
        return <XCircle className="h-4 w-4 text-slate-400" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "En cours d'examen";
      case "resolved":
        return "Résolu";
      case "dismissed":
        return "Classé";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Mes Signalements
          </h1>
          <p className="text-muted-foreground">
            Suivez l&apos;état de vos demandes et plaintes.
          </p>
        </div>
        <Link href="/dashboard/report-issue">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Signaler un problème
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Tout</TabsTrigger>
          <TabsTrigger value="active">En cours</TabsTrigger>
          <TabsTrigger value="resolved">Résolu</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4">
            {loading ? (
              Array(2)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-muted/20 h-32 animate-pulse rounded-xl border"
                  />
                ))
            ) : reports.length === 0 ? (
              <Card className="border-dashed py-12">
                <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="rounded-full bg-slate-100 p-4">
                    <ShieldAlert className="h-8 w-8 text-slate-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold">Aucun signalement</p>
                    <p className="text-muted-foreground text-sm">
                      Vous n&apos;avez envoyé aucun signalement pour le moment.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              reports.map((report) => (
                <Card key={report.id} className="overflow-hidden">
                  <div className="flex items-center gap-4 p-6">
                    <div
                      className={`rounded-full bg-slate-50 p-3 ${
                        report.status === "pending"
                          ? "bg-yellow-50 text-yellow-600"
                          : report.status === "resolved"
                            ? "bg-green-50 text-green-600"
                            : "bg-slate-50 text-slate-600"
                      }`}
                    >
                      {getStatusIcon(report.status)}
                    </div>
                    <div className="grow">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {report.type}
                          </h3>
                          <p className="text-muted-foreground text-xs">
                            Signalé le{" "}
                            {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            report.status === "pending"
                              ? "outline"
                              : "secondary"
                          }
                        >
                          {getStatusLabel(report.status)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-2 line-clamp-1 text-sm italic">
                        &quot;{report.description}&quot;
                      </p>
                    </div>
                    <ChevronRight className="text-muted-foreground h-5 w-5" />
                  </div>
                  {report.adminResponse && (
                    <div className="flex items-start gap-3 border-t bg-slate-50 p-4">
                      <MessageSquare className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                      <div className="space-y-1">
                        <p className="text-primary text-[10px] font-bold tracking-wider uppercase">
                          Réponse de la modération
                        </p>
                        <p className="text-xs text-slate-600">
                          {report.adminResponse}
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
