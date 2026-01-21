"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { toast } from "sonner";
import { Loader2, Shield, UserMinus, RefreshCw } from "lucide-react";

interface AdminUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: "passager" | "conducteur" | "administrateur";
  statut: "actif" | "suspendu" | string;
  createdAt?: string | null;
}

const roleOptions = [
  { value: "", label: "Tous les rôles" },
  { value: "passager", label: "Passager" },
  { value: "conducteur", label: "Conducteur" },
  { value: "administrateur", label: "Administrateur" },
];

const statutOptions = [
  { value: "", label: "Tous statuts" },
  { value: "actif", label: "Actif" },
  { value: "suspendu", label: "Suspendu" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter) params.set("role", roleFilter);
      if (statutFilter) params.set("statut", statutFilter);
      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
      } else {
        toast.error(json.error?.message || "Impossible de charger les utilisateurs");
      }
    } catch {
      toast.error("Erreur réseau lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, statutFilter]);

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      u.prenom.toLowerCase().includes(q) ||
      u.nom.toLowerCase().includes(q)
    );
  });

  const handleSuspend = async (id: string, targetStatut: "suspendu" | "actif") => {
    try {
      setProcessingId(id);
      const res = await fetch(`/api/admin/users/${id}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: targetStatut }),
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Utilisateur ${targetStatut === "suspendu" ? "suspendu" : "réactivé"}`);
        fetchUsers();
      } else {
        toast.error(json.error?.message || "Action impossible");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setProcessingId(null);
    }
  };

  const statutBadge = (statut: string) => {
    switch (statut) {
      case "actif":
        return (
          <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
            Actif
          </Badge>
        );
      case "suspendu":
        return (
          <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
            Suspendu
          </Badge>
        );
      default:
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground">Filtrez, suspendez ou réactivez les comptes.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Rafraîchir
          </Button>
        </div>
      </div>

      <Card className="bg-card/50 border-0 shadow-sm backdrop-blur-sm">
        <CardHeader className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Input
              placeholder="Rechercher (nom, email)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="md:col-span-2"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-background/80 h-10 rounded-md border px-3 text-sm"
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
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
          <CardTitle className="text-lg font-bold">Utilisateurs</CardTitle>
          <CardDescription>{filteredUsers.length} résultat(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Chargement...
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucun utilisateur trouvé.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-semibold">
                      {u.prenom} {u.nom}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell className="capitalize">{u.role}</TableCell>
                    <TableCell>{statutBadge(u.statut)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {u.statut === "suspendu" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={processingId === u.id}
                          onClick={() => handleSuspend(u.id, "actif")}
                        >
                          <Shield className="mr-1 h-4 w-4" /> Réactiver
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={processingId === u.id}
                          onClick={() => handleSuspend(u.id, "suspendu")}
                        >
                          <UserMinus className="mr-1 h-4 w-4" /> Suspendre
                        </Button>
                      )}
                      <Link href={`/dashboard/users/${u.id}/history`} className="inline-block">
                        <Button size="sm" variant="secondary">
                          Historique
                        </Button>
                      </Link>
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
