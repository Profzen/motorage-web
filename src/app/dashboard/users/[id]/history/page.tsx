"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  action: string;
  targetId: string | null;
  details: string | null;
  createdAt: string | null;
  ip: string | null;
  userAgent: string | null;
}

export default function UserHistoryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params.id;
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/audit-logs?userId=${userId}&limit=50&page=1`, {
          credentials: "include",
        });
        const json = await res.json();
        if (json.success) {
          setLogs(json.data || []);
        } else {
          toast.error(json.error?.message || "Impossible de charger l'historique");
        }
      } catch {
        toast.error("Erreur réseau lors du chargement");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [userId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historique utilisateur</h1>
          <p className="text-muted-foreground">Actions administratives liées à cet utilisateur.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          <Link href="/dashboard/users">
            <Button variant="secondary" size="sm">Liste utilisateurs</Button>
          </Link>
        </div>
      </div>

      <Card className="bg-card/50 border-0 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Journal d&apos;audit</CardTitle>
          <CardDescription>{logs.length} événement(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Chargement...
            </div>
          ) : logs.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucune activité enregistrée.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Détails</TableHead>
                  <TableHead>Ressource</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="capitalize font-semibold">{log.action}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {log.details ? (
                          <code className="bg-muted text-xs rounded px-2 py-1">
                            {log.details}
                          </code>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                        {log.ip && (
                          <Badge variant="secondary" className="w-fit text-[10px]">IP {log.ip}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.targetId || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString("fr-FR") : ""}
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
