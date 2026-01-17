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
  Plus
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

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
          createdAt: "2023-10-27T10:30:00Z"
        },
        {
          id: "REP-451",
          type: "Paiement",
          description: "Le prix payé était différent du prix affiché dans l'appli.",
          status: "resolved",
          createdAt: "2023-10-20T15:45:00Z",
          adminResponse: "Nous avons vérifié le trajet. Un remboursement de la différence a été crédité sur votre compte."
        }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "resolved": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "dismissed": return <XCircle className="h-4 w-4 text-slate-400" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "En cours d'examen";
      case "resolved": return "Résolu";
      case "dismissed": return "Classé";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes Signalements</h1>
          <p className="text-muted-foreground">Suivez l&apos;état de vos demandes et plaintes.</p>
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
              Array(2).fill(0).map((_, i) => (
                <div key={i} className="h-32 rounded-xl border animate-pulse bg-muted/20" />
              ))
            ) : reports.length === 0 ? (
              <Card className="border-dashed py-12">
                <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="rounded-full bg-slate-100 p-4">
                    <ShieldAlert className="h-8 w-8 text-slate-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold">Aucun signalement</p>
                    <p className="text-sm text-muted-foreground">Vous n&apos;avez envoyé aucun signalement pour le moment.</p>
                  </div>
                </CardContent>
              </Card>
            ) : reports.map((report) => (
              <Card key={report.id} className="overflow-hidden">
                <div className="flex items-center p-6 gap-4">
                  <div className={`p-3 rounded-full bg-slate-50 ${
                    report.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 
                    report.status === 'resolved' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-600'
                  }`}>
                    {getStatusIcon(report.status)}
                  </div>
                  <div className="grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{report.type}</h3>
                        <p className="text-xs text-muted-foreground">Signalé le {new Date(report.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={report.status === 'pending' ? 'outline' : 'secondary'}>
                        {getStatusLabel(report.status)}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-1 italic">
                      &quot;{report.description}&quot;
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                {report.adminResponse && (
                  <div className="bg-slate-50 border-t p-4 flex gap-3 items-start">
                    <MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Réponse de la modération</p>
                      <p className="text-xs text-slate-600">{report.adminResponse}</p>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

