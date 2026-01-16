"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Bike, Users, Plus, LogOut, Calendar, Clock, MapPinIcon, Star, Pencil, Trash2, Save, X, MapPin } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useRoutesStore } from "@/lib/store";
import { useMotosStore } from "@/lib/store";
import { useRideRequestsStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const routes = useRoutesStore((state) => state.routes);
  const updateRouteStore = useRoutesStore((state) => state.updateRoute);
  const deleteRouteStore = useRoutesStore((state) => state.deleteRoute);
  const motos = useMotosStore((state) => state.motos);
  const addMoto = useMotosStore((state) => state.addMoto);
  const removeMoto = useMotosStore((state) => state.removeMoto);
  const updateMoto = useMotosStore((state) => state.updateMoto);
  const requests = useRideRequestsStore((state) => state.requests);
  const updateRequestStatus = useRideRequestsStore((state) => state.updateRequestStatus);
  const [mounted, setMounted] = useState(false);
  const [requestFilter, setRequestFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all");
  const [flash, setFlash] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [showMotoForm, setShowMotoForm] = useState(false);
  const [editingMotoId, setEditingMotoId] = useState<string | null>(null);
  const [motoForm, setMotoForm] = useState({
    brand: "",
    model: "",
    year: "2024",
    licensePlate: "",
    capacity: "2",
  });
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [routeForm, setRouteForm] = useState({
    departure: "",
    arrival: "",
    time: "",
    availableSeats: "1",
  });

  useEffect(() => {
    setMounted(true);
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!mounted || !user) {
    return null;
  }

  const userRoutes = routes.filter(r => r.driverId === user.id);
  const userMotos = motos.filter(m => m.driverId === user.id);
  const userRouteIds = new Set(userRoutes.map((r) => r.id));
  const driverRequests = requests
    .filter((r) => userRouteIds.has(r.routeId))
    .map((req) => ({
      req,
      route: routes.find((r) => r.id === req.routeId),
    }));
  const pendingCount = driverRequests.filter(({ req }) => req.status === "pending").length;
  const filteredDriverRequests = driverRequests.filter(({ req }) =>
    requestFilter === "all" ? true : req.status === requestFilter
  );

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200",
      accepted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200",
      rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200",
    };
    return map[status] ?? "bg-muted text-foreground";
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const showFlash = (text: string, type: "success" | "error") => {
    setFlash({ text, type });
    setTimeout(() => setFlash(null), 2500);
  };

  const resetMotoForm = () => {
    setMotoForm({ brand: "", model: "", year: "2024", licensePlate: "", capacity: "2" });
    setEditingMotoId(null);
  };

  const handleMotoSubmit = () => {
    if (!motoForm.brand || !motoForm.model || !motoForm.licensePlate) {
      showFlash("Merci de renseigner marque, modèle et immatriculation", "error");
      return;
    }

    const payload = {
      brand: motoForm.brand,
      model: motoForm.model,
      year: parseInt(motoForm.year || "2024", 10),
      licensePlate: motoForm.licensePlate,
      capacity: parseInt(motoForm.capacity || "1", 10),
      driverId: user.id,
    };

    if (editingMotoId) {
      updateMoto(editingMotoId, payload);
      showFlash("Moto mise à jour", "success");
    } else {
      addMoto({
        id: `moto-${Date.now()}`,
        ...payload,
      });
      showFlash("Moto ajoutée", "success");
    }

    resetMotoForm();
    setShowMotoForm(false);
  };

  const handleMotoEdit = (motoId: string) => {
    const moto = userMotos.find((m) => m.id === motoId);
    if (!moto) return;
    setMotoForm({
      brand: moto.brand,
      model: moto.model,
      year: moto.year.toString(),
      licensePlate: moto.licensePlate,
      capacity: moto.capacity.toString(),
    });
    setEditingMotoId(moto.id);
    setShowMotoForm(true);
  };

  const handleMotoDelete = (motoId: string) => {
    if (window.confirm("Supprimer cette moto ?")) {
      removeMoto(motoId);
      showFlash("Moto supprimée", "success");
    }
  };

  const handleRouteEdit = (routeId: string) => {
    const route = userRoutes.find((r) => r.id === routeId);
    if (!route) return;
    setRouteForm({
      departure: route.departure.name,
      arrival: route.arrival.name,
      time: route.departureTime,
      availableSeats: route.availableSeats.toString(),
    });
    setEditingRouteId(routeId);
  };

  const handleRouteSave = () => {
    if (!editingRouteId) return;
    const route = routes.find((r) => r.id === editingRouteId);
    if (!route) return;
    updateRouteStore(editingRouteId, {
      departure: { ...route.departure, name: routeForm.departure },
      arrival: { ...route.arrival, name: routeForm.arrival },
      departureTime: routeForm.time,
      arrivalTime: routeForm.time,
      availableSeats: parseInt(routeForm.availableSeats || "1", 10),
    });
    setEditingRouteId(null);
    showFlash("Trajet mis à jour", "success");
  };

  const handleRouteDelete = (routeId: string) => {
    if (window.confirm("Supprimer ce trajet ?")) {
      deleteRouteStore(routeId);
      showFlash("Trajet supprimé", "success");
    }
  };
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow py-20 md:py-32 bg-surface/50">
        <div className="container mx-auto px-4">
          {flash && (
            <div className={`mb-4 p-3 rounded-lg border text-sm ${flash.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-100" : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100"}`}>
              {flash.text}
            </div>
          )}
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Bienvenue, {user.name}</h1>
                <p className="text-muted-foreground">
                  Gérez vos trajets, demandes et profil en un seul endroit
                </p>
              </div>
              <Link href="/search">
                <Button size="lg" className="gap-2">
                  <MapPinIcon className="h-4 w-4" />
                  Demander une moto
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Mes trajets</p>
                    <p className="text-2xl font-bold">{userRoutes.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Mes motos</p>
                    <p className="text-2xl font-bold">{userMotos.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Demandes en attente</p>
                    <p className="text-2xl font-bold">{pendingCount}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Trajets réussis</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column - Actions */}
              <div className="md:col-span-2 space-y-6">
                {/* Demandes reçues */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                      <CardTitle>Demandes reçues</CardTitle>
                      <CardDescription>
                        {driverRequests.length > 0 ? `${driverRequests.length} en attente` : "Aucune demande"}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <Button
                        size="sm"
                        variant={requestFilter === "all" ? "default" : "outline"}
                        onClick={() => setRequestFilter("all")}
                      >
                        Toutes
                      </Button>
                      <Button
                        size="sm"
                        variant={requestFilter === "pending" ? "default" : "outline"}
                        onClick={() => setRequestFilter("pending")}
                      >
                        En attente
                      </Button>
                      <Button
                        size="sm"
                        variant={requestFilter === "accepted" ? "default" : "outline"}
                        onClick={() => setRequestFilter("accepted")}
                      >
                        Acceptées
                      </Button>
                      <Button
                        size="sm"
                        variant={requestFilter === "rejected" ? "default" : "outline"}
                        onClick={() => setRequestFilter("rejected")}
                      >
                        Refusées
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {filteredDriverRequests.length === 0 ? (
                      <div className="text-center py-10 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Aucune demande pour vos trajets</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredDriverRequests.map(({ req, route }) => (
                          <div key={req.id} className="p-4 border rounded-lg bg-muted/30">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <p className="font-medium">{route?.departure.name} → {route?.arrival.name}</p>
                                <p className="text-xs text-muted-foreground">Places demandées : {req.requestedSeats}</p>
                                <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-[11px] font-medium ${statusBadge(req.status)}`}>
                                  <span className="h-2 w-2 rounded-full bg-current" />
                                  {req.status === "pending" ? "En attente" : req.status === "accepted" ? "Acceptée" : "Refusée"}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => { updateRequestStatus(req.id, "accepted"); showFlash("Demande acceptée", "success"); }}
                                  disabled={req.status !== "pending"}
                                >
                                  Accepter
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => { updateRequestStatus(req.id, "rejected"); showFlash("Demande refusée", "error"); }}
                                  disabled={req.status !== "pending"}
                                >
                                  Refuser
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Trajets Section */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                      <CardTitle>Mes trajets</CardTitle>
                      <CardDescription>
                        {userRoutes.length > 0 ? `${userRoutes.length} trajet(s) proposé(s)` : "Vous n'avez pas de trajets"}
                      </CardDescription>
                    </div>
                    <Link href="/create-route">
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Nouveau trajet
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {userRoutes.length === 0 ? (
                      <div className="text-center py-12 rounded-lg bg-muted/50">
                        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-muted-foreground mb-4">Aucun trajet pour le moment</p>
                        <Link href="/create-route">
                          <Button variant="outline" size="sm">
                            Créer votre premier trajet
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userRoutes.map((route) => (
                          <div key={route.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium">{route.departure.name} → {route.arrival.name}</p>
                                <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(route.createdAt).toLocaleDateString('fr-FR')}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {route.departureTime}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-3"
                                  onClick={() => handleRouteEdit(route.id)}
                                >
                                  <Pencil className="h-3 w-3 mr-1" />
                                  Modifier
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 px-3 text-destructive"
                                  onClick={() => handleRouteDelete(route.id)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Supprimer
                                </Button>
                              </div>
                            </div>
                            {editingRouteId === route.id ? (
                              <div className="mt-3 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div className="space-y-1">
                                    <Label className="text-xs">Départ</Label>
                                    <Input
                                      value={routeForm.departure}
                                      onChange={(e) => setRouteForm({ ...routeForm, departure: e.target.value })}
                                      placeholder="Départ"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Arrivée</Label>
                                    <Input
                                      value={routeForm.arrival}
                                      onChange={(e) => setRouteForm({ ...routeForm, arrival: e.target.value })}
                                      placeholder="Arrivée"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Heure</Label>
                                    <Input
                                      value={routeForm.time}
                                      onChange={(e) => setRouteForm({ ...routeForm, time: e.target.value })}
                                      type="time"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div className="space-y-1">
                                    <Label className="text-xs">Places</Label>
                                    <Input
                                      value={routeForm.availableSeats}
                                      onChange={(e) => setRouteForm({ ...routeForm, availableSeats: e.target.value })}
                                      type="number"
                                      min={1}
                                      max={3}
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" className="gap-2" onClick={handleRouteSave}>
                                    <Save className="h-4 w-4" />
                                    Enregistrer
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-2"
                                    onClick={() => setEditingRouteId(null)}
                                  >
                                    <X className="h-4 w-4" />
                                    Annuler
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">Trajet régulier</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Mes Motos Section */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                      <CardTitle>Mes motos</CardTitle>
                      <CardDescription>
                        {userMotos.length > 0 ? `${userMotos.length} moto(s) enregistrée(s)` : "Aucune moto"}
                      </CardDescription>
                    </div>
                    <Button
                      size="sm"
                      className="gap-2"
                      variant={showMotoForm ? "secondary" : "default"}
                      onClick={() => setShowMotoForm((v) => !v)}
                    >
                      <Plus className="h-4 w-4" />
                      {showMotoForm ? "Fermer" : "Ajouter une moto"}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {showMotoForm && (
                      <div className="mb-6 p-4 border rounded-lg bg-muted/40 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Marque</Label>
                            <Input
                              value={motoForm.brand}
                              onChange={(e) => setMotoForm({ ...motoForm, brand: e.target.value })}
                              placeholder="Honda, Yamaha..."
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Modèle</Label>
                            <Input
                              value={motoForm.model}
                              onChange={(e) => setMotoForm({ ...motoForm, model: e.target.value })}
                              placeholder="CB150, YZF-R3..."
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Année</Label>
                            <Input
                              type="number"
                              value={motoForm.year}
                              onChange={(e) => setMotoForm({ ...motoForm, year: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Immatriculation</Label>
                            <Input
                              value={motoForm.licensePlate}
                              onChange={(e) => setMotoForm({ ...motoForm, licensePlate: e.target.value })}
                              placeholder="TG-2024-001"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Places</Label>
                            <Input
                              type="number"
                              min={1}
                              max={3}
                              value={motoForm.capacity}
                              onChange={(e) => setMotoForm({ ...motoForm, capacity: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="gap-2" onClick={handleMotoSubmit}>
                            <Save className="h-4 w-4" />
                            {editingMotoId ? "Mettre à jour" : "Ajouter"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => { resetMotoForm(); setShowMotoForm(false); }}
                          >
                            <X className="h-4 w-4" />
                            Annuler
                          </Button>
                        </div>
                      </div>
                    )}
                    {userMotos.length === 0 ? (
                      <div className="text-center py-12 rounded-lg bg-muted/50">
                        <Bike className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-muted-foreground mb-4">Aucune moto enregistrée</p>
                        <Button variant="outline" size="sm" onClick={() => setShowMotoForm(true)}>
                          Enregistrer votre moto
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userMotos.map((moto) => (
                          <div key={moto.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">{moto.brand} {moto.model}</p>
                                <p className="text-sm text-muted-foreground">{moto.licensePlate}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="h-8 px-3" onClick={() => handleMotoEdit(moto.id)}>
                                  <Pencil className="h-3 w-3 mr-1" />
                                  Modifier
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 px-3 text-destructive"
                                  onClick={() => handleMotoDelete(moto.id)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Supprimer
                                </Button>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">Capacité: {moto.capacity} place(s) • {moto.year}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Profile Card */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Mon profil</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">5.0</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      Éditer le profil
                    </Button>
                  </CardContent>
                </Card>

                {/* Demandes reçues (rappel) */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Demandes reçues</CardTitle>
                    <CardDescription>
                      {driverRequests.length > 0 ? `${driverRequests.length} en attente` : "Aucune demande"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {driverRequests.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aucune demande pour vos trajets</p>
                    ) : (
                      driverRequests.map(({ req, route }) => (
                        <div key={req.id} className="p-3 rounded-lg border bg-muted/40">
                          <p className="text-sm font-medium">{route?.departure.name} → {route?.arrival.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">Places demandées: {req.requestedSeats}</p>
                          <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-[11px] font-medium ${statusBadge(req.status)}`}>
                            <span className="h-2 w-2 rounded-full bg-current" />
                            {req.status === "pending" ? "En attente" : req.status === "accepted" ? "Acceptée" : "Refusée"}
                          </span>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-base">Raccourcis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link href="/create-route" className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors text-sm">
                      <Plus className="h-4 w-4" />
                      <span>Créer un trajet</span>
                    </Link>
                    <Link href="/search" className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors text-sm">
                      <MapPinIcon className="h-4 w-4" />
                      <span>Chercher un trajet</span>
                    </Link>
                    <Link href="/about" className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors text-sm">
                      <span>À propos</span>
                    </Link>
                    <Link href="/contact" className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors text-sm">
                      <span>Contacter le support</span>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors text-sm text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Se déconnecter</span>
                    </button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
