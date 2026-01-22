"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Shield,
  Ban,
  MoreVertical,
  CheckCircle2,
  Clock,
  Car,
  History,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: "passager" | "conducteur" | "administrateur";
  statut: "actif" | "suspendu";
  createdAt: string;
  avatar?: string;
}

interface UserActivity {
  id: string;
  action: string;
  details: string;
  createdAt: string;
  adminName?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statutFilter, setStatutFilter] = useState("all");
  const [historyUserId, setHistoryUserId] = useState<string | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    newlyJoined: 0,
  });

  const fetchSummary = async () => {
    try {
      const res = await fetch("/api/admin/users/summary");
      const result = await res.json();
      if (result.success) {
        setSummary(result.data);
      }
    } catch (err) {
      console.error("Failed to load summary", err);
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (statutFilter !== "all") params.append("statut", statutFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const result = await res.json();
      if (result.success) {
        setUsers(result.data);
      }
    } catch {
      toast.error("Erreur", {
        description: "Impossible de charger les utilisateurs",
      });
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statutFilter]);

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(fetchUsers, 500);
    return () => clearTimeout(debounce);
  }, [fetchUsers]);

  const handleStatusUpdate = async (id: string, newStatut: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: newStatut }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Statut mis à jour");
        fetchUsers();
        fetchSummary();
      }
    } catch {
      toast.error("Erreur de mise à jour");
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer définitivement ${name} ?`))
      return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Utilisateur supprimé");
        fetchUsers();
        fetchSummary();
      }
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "administrateur":
        return (
          <Badge variant="destructive" className="gap-1">
            <Shield className="h-3 w-3" /> Admin
          </Badge>
        );
      case "conducteur":
        return (
          <Badge className="gap-1 border-0 bg-blue-600 text-white hover:bg-blue-700">
            <Car className="h-3 w-3" /> Conducteur
          </Badge>
        );
      case "passager":
        return (
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" /> Passager
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "actif":
        return (
          <Badge
            variant="outline"
            className="border-green-200 bg-green-50 font-medium text-green-700"
          >
            Actif
          </Badge>
        );
      case "suspendu":
        return (
          <Badge
            variant="outline"
            className="border-red-200 bg-red-50 font-medium text-red-700"
          >
            Suspendu
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="font-normal text-slate-400">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestion des Utilisateurs
          </h1>
          <p className="text-muted-foreground">
            Pilotez les comptes et les permissions de la communauté.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              window.location.href = "/api/admin/users/export";
            }}
          >
            <Download className="h-4 w-4" /> Exporter CSV
          </Button>
          <Button variant="outline" className="gap-2" onClick={fetchUsers}>
            Actualiser
          </Button>
          <Button className="gap-2" onClick={() => setIsAddUserOpen(true)}>
            <UserPlus className="h-4 w-4" /> Ajouter un utilisateur
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/5 border-primary/20 p-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 rounded-lg p-2">
              <Users className="text-primary h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium tracking-tight">
                Total Utilisateurs
              </p>
              <h3 className="text-2xl font-bold">
                {summary.total.toLocaleString()}
              </h3>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-green-100 p-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium tracking-tight">
                Actifs
              </p>
              <h3 className="text-2xl font-bold">
                {summary.active.toLocaleString()}
              </h3>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-100 p-2">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium tracking-tight">
                Nouveaux (7j)
              </p>
              <h3 className="text-2xl font-bold">
                {summary.newlyJoined.toLocaleString()}
              </h3>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-red-100 p-2">
              <Ban className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium tracking-tight">
                Suspendus
              </p>
              <h3 className="text-2xl font-bold">
                {summary.suspended.toLocaleString()}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative w-80">
                <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom, email..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select
                value={roleFilter}
                onValueChange={(v) => setRoleFilter(v)}
              >
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="conducteur">Conducteur</SelectItem>
                  <SelectItem value="passager">Passager</SelectItem>
                  <SelectItem value="administrateur">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={statutFilter}
                onValueChange={(v) => setStatutFilter(v)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="suspendu">Suspendu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Inscrit le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
                      </TableCell>
                      <TableCell>
                        <div className="h-6 w-16 animate-pulse rounded bg-slate-100" />
                      </TableCell>
                      <TableCell>
                        <div className="h-6 w-16 animate-pulse rounded bg-slate-100" />
                      </TableCell>
                      <TableCell>
                        <div className="h-6 w-24 animate-pulse rounded bg-slate-100" />
                      </TableCell>
                      <TableCell>
                        <div className="ml-auto h-8 w-8 animate-pulse rounded bg-slate-100" />
                      </TableCell>
                    </TableRow>
                  ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-muted-foreground h-24 text-center"
                  >
                    Aucun utilisateur trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border transition-transform group-hover:scale-105">
                          <AvatarImage
                            src={
                              user.avatar ||
                              `https://avatar.vercel.sh/${user.email}`
                            }
                          />
                          <AvatarFallback className="bg-slate-100 text-slate-600">
                            {(user.prenom || "?").charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="w-fit border-b border-transparent text-sm font-semibold text-slate-900 transition-colors group-hover:border-slate-300">
                            {user.prenom} {user.nom}
                          </span>
                          <span className="text-muted-foreground font-mono text-xs">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.statut)}</TableCell>
                    <TableCell className="text-sm text-slate-600 italic">
                      {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-slate-100"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 p-1">
                          <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                            Administration
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => setHistoryUserId(user.id)}
                            className="cursor-pointer"
                          >
                            <History className="mr-2 h-4 w-4 text-slate-400" />{" "}
                            Profil & Historique
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1" />
                          {user.statut === "actif" ? (
                            <DropdownMenuItem
                              className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                              onClick={() =>
                                handleStatusUpdate(user.id, "suspendu")
                              }
                            >
                              <Ban className="mr-2 h-4 w-4" /> Suspendre
                              l&apos;accès
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="cursor-pointer text-green-600 focus:bg-green-50 focus:text-green-600"
                              onClick={() =>
                                handleStatusUpdate(user.id, "actif")
                              }
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Rétablir
                              l&apos;accès
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="cursor-pointer text-red-600 focus:bg-red-100 focus:text-red-700"
                            onClick={() =>
                              handleDeleteUser(
                                user.id,
                                `${user.prenom} ${user.nom}`
                              )
                            }
                          >
                            <Shield className="mr-2 h-4 w-4" /> Supprimer
                            définitivement
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UserHistoryDialog
        userId={historyUserId}
        onClose={() => setHistoryUserId(null)}
      />

      <AddUserDialog
        open={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
        onSuccess={() => {
          fetchUsers();
          fetchSummary();
        }}
      />
    </div>
  );
}

function AddUserDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    password: "",
    role: "passager",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((formData.password || "").length < 8) {
      toast.error("Mot de passe trop court", {
        description: "Le mot de passe doit contenir au moins 8 caractères",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Utilisateur créé avec succès");
        onOpenChange(false);
        onSuccess();
        setFormData({
          prenom: "",
          nom: "",
          email: "",
          password: "",
          role: "passager",
          phone: "",
        });
      } else {
        const validationMsg =
          result?.errors?.[0]?.message ||
          result?.error ||
          "Erreur lors de la création";
        toast.error(validationMsg);
      }
    } catch {
      toast.error("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un utilisateur</DialogTitle>
          <DialogDescription>
            Créez un nouveau compte manuellement. L&apos;utilisateur pourra se
            connecter immédiatement.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom</Label>
              <Input
                id="prenom"
                required
                value={formData.prenom}
                onChange={(e) =>
                  setFormData({ ...formData, prenom: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                required
                value={formData.nom}
                onChange={(e) =>
                  setFormData({ ...formData, nom: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe provisoire</Label>
            <Input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData({ ...formData, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passager">Passager</SelectItem>
                  <SelectItem value="conducteur">Conducteur</SelectItem>
                  <SelectItem value="administrateur">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer le compte"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UserHistoryDialog({
  userId,
  onClose,
}: {
  userId: string | null;
  onClose: () => void;
}) {
  const [logs, setLogs] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [prevUserId, setPrevUserId] = useState<string | null>(null);

  if (userId !== prevUserId) {
    setPrevUserId(userId);
    if (userId) {
      setLoading(true);
      setLogs([]);
    }
  }

  useEffect(() => {
    if (userId) {
      fetch(`/api/admin/activity?userId=${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setLogs(data.data); // data.data is the array of activities
          }
        })
        .finally(() => setLoading(false));
    }
  }, [userId]);

  return (
    <Dialog open={!!userId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="text-primary h-5 w-5" />
            Historique d&apos;audit de l&apos;utilisateur
          </DialogTitle>
          <DialogDescription>
            Toutes les actions administratives et critiques liées à ce compte.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 max-h-[400px] space-y-3 overflow-y-auto pr-2">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 w-full animate-pulse rounded-lg bg-slate-100"
                />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-muted-foreground py-10 text-center italic">
              Aucune activité enregistrée pour cet utilisateur.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="rounded-lg border p-3 transition-colors hover:bg-slate-50"
              >
                <div className="mb-1 flex items-start justify-between">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold tracking-wider uppercase"
                  >
                    {log.action}
                  </Badge>
                  <span className="text-muted-foreground font-mono text-[10px]">
                    {new Date(log.createdAt).toLocaleString("fr-FR")}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{log.details}</p>
                {log.adminName && (
                  <p className="mt-2 flex items-center gap-1 text-[10px] text-blue-600">
                    <Shield className="h-3 w-3" /> Par {log.adminName}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
