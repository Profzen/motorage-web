"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Mail,
  Shield,
  Ban,
  MoreVertical,
  CheckCircle2,
  Clock,
  Bike,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id: string;
  name: string;
  email: string;
  role: "passager" | "conducteur" | "administrateur";
  status: "active" | "suspended" | "pending";
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch
    setTimeout(() => {
      setUsers([
        {
          id: "USR-001",
          name: "Alexandre K.",
          email: "alex@univ.dz",
          role: "administrateur",
          status: "active",
          createdAt: "2023-01-15T10:00:00Z",
        },
        {
          id: "USR-002",
          name: "Sonia Rahmani",
          email: "sonia@univ.dz",
          role: "conducteur",
          status: "active",
          createdAt: "2023-05-20T14:30:00Z",
        },
        {
          id: "USR-003",
          name: "Omar Ben",
          email: "omar@univ.dz",
          role: "passager",
          status: "suspended",
          createdAt: "2023-09-10T09:15:00Z",
        },
        {
          id: "USR-004",
          name: "Amira L.",
          email: "amira@univ.dz",
          role: "conducteur",
          status: "pending",
          createdAt: "2023-10-25T11:00:00Z",
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "administrateur":
        return <Badge variant="destructive">Admin</Badge>;
      case "conducteur":
        return (
          <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Bike className="mr-1 h-3 w-3" /> Conducteur
          </Badge>
        );
      case "passager":
        return <Badge variant="secondary">Passager</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="border-green-200 bg-green-100 text-green-800"
          >
            Actif
          </Badge>
        );
      case "suspended":
        return (
          <Badge
            variant="outline"
            className="border-red-200 bg-red-100 text-red-800"
          >
            Suspendu
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="border-yellow-200 bg-yellow-100 text-yellow-800"
          >
            En attente
          </Badge>
        );
      default:
        return null;
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
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" /> Ajouter un utilisateur
        </Button>
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
              <h3 className="text-2xl font-bold">1,284</h3>
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
              <h3 className="text-2xl font-bold">1,150</h3>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-yellow-100 p-2">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium tracking-tight">
                S&apos;inscrivent
              </p>
              <h3 className="text-2xl font-bold">84</h3>
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
                Bannis
              </p>
              <h3 className="text-2xl font-bold">12</h3>
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
                  placeholder="Rechercher par nom, email ou ID..."
                  className="pl-9"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" /> Filtres
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Inscrit le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i} className="animate-pulse">
                        <TableCell
                          colSpan={5}
                          className="bg-muted/20 h-16"
                        ></TableCell>
                      </TableRow>
                    ))
                : users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border">
                            <AvatarImage
                              src={`https://avatar.vercel.sh/${user.email}`}
                            />
                            <AvatarFallback>
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.name}</span>
                            <span className="text-muted-foreground text-xs">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" /> Contacter
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="mr-2 h-4 w-4" /> Modifier
                              permissions
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Ban className="mr-2 h-4 w-4" /> Suspendre le
                              compte
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
