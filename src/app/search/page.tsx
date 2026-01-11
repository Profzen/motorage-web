"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Bike,
  Search as SearchIcon,
  Star,
  Phone,
  MessageCircle,
  MapIcon,
} from "lucide-react";
import { useRoutesStore } from "@/lib/store";
import { useRideRequestsStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { useLocationStore } from "@/lib/store";
import dynamic from "next/dynamic";
const MapView = dynamic(() => import("@/components/sections/MapView").then(m => m.MapView), { ssr: false });
import { RequestModal } from "@/components/ui/request-modal";

export default function SearchPage() {
  const routes = useRoutesStore((state) => state.routes);
  const user = useAuthStore((state) => state.user);
  const userLocation = useLocationStore((s) => s.location);
  const locationStatus = useLocationStore((s) => s.status);
  const requestLocation = useLocationStore((s) => s.requestLocation);
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [radiusKm, setRadiusKm] = useState("10");
  const [filteredRoutes, setFilteredRoutes] = useState(routes);
  const [selectedRoute, setSelectedRoute] = useState<(typeof routes)[0] | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [flash, setFlash] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const addRequest = useRideRequestsStore((state) => state.addRequest);

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const distanceKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lng - a.lng);
    const la1 = toRad(a.lat);
    const la2 = toRad(b.lat);
    const aHarv = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(la1) * Math.cos(la2);
    return 2 * R * Math.atan2(Math.sqrt(aHarv), Math.sqrt(1 - aHarv));
  };

  useEffect(() => {
    let filtered = routes;

    if (departure) {
      filtered = filtered.filter((r) =>
        r.departure.name.toLowerCase().includes(departure.toLowerCase())
      );
    }

    if (arrival) {
      filtered = filtered.filter((r) =>
        r.arrival.name.toLowerCase().includes(arrival.toLowerCase())
      );
    }

    if (selectedDate) {
      filtered = filtered.filter((r) => r.createdAt.split('T')[0] === selectedDate);
    }

    const radiusValue = parseInt(radiusKm || "0", 10);
    if (userLocation && radiusValue > 0) {
      filtered = filtered.filter((r) =>
        distanceKm(r.departure, userLocation) <= radiusValue
      );
    }

    setFilteredRoutes(filtered);
  }, [departure, arrival, selectedDate, routes, userLocation, radiusKm]);

  const handleViewDetails = (route: (typeof routes)[0]) => {
    setSelectedRoute(route);
    setShowDetails(true);
  };

  const handleRequestRide = (route: (typeof routes)[0]) => {
    setSelectedRoute(route);
    setModalOpen(true);
  };

  const handleConfirmRequest = (requestedSeats: number) => {
    if (!selectedRoute) return;
    addRequest({
      id: `req-${Date.now()}`,
      passengerId: user?.id || "user1",
      routeId: selectedRoute.id,
      status: "pending",
      requestedSeats,
      createdAt: new Date().toISOString(),
    });
    setModalOpen(false);
    setShowDetails(false);
    setFlash({ text: "Demande envoyée", type: "success" });
    setTimeout(() => setFlash(null), 2500);
  };

  const nearestRoutesWithDistance = userLocation
    ? routes
        .map((r) => ({
          route: r,
          distance: distanceKm({ lat: r.departure.lat, lng: r.departure.lng }, userLocation),
        }))
        .sort((a, b) => a.distance - b.distance)
    : [];

  const closestRoutes = nearestRoutesWithDistance.slice(0, 3).map((item) => item.route);
  const displayRoutesMap = userLocation
    ? Array.from(new Map([...filteredRoutes, ...closestRoutes].map((r) => [r.id, r]))).map(([, r]) => r)
    : filteredRoutes;

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
            {/* Search Section */}
            <div>
              <h1 className="text-4xl font-bold mb-2">Chercher un trajet</h1>
              <p className="text-muted-foreground">
                Trouvez un motocycliste pour vous accompagner
              </p>
            </div>

            {/* Search Form */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Filtres de recherche</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  {/* Departure */}
                  <div className="space-y-2">
                    <Label htmlFor="departure">Départ</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="departure"
                        placeholder="Ex: Campus"
                        className="pl-10"
                        value={departure}
                        onChange={(e) => setDeparture(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Arrival */}
                  <div className="space-y-2">
                    <Label htmlFor="arrival">Destination</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="arrival"
                        placeholder="Ex: Centre-ville"
                        className="pl-10"
                        value={arrival}
                        onChange={(e) => setArrival(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="date"
                        type="date"
                        className="pl-10"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Radius */}
                  <div className="space-y-2">
                    <Label htmlFor="radius">Autour de moi (km)</Label>
                    <Input
                      id="radius"
                      type="number"
                      min="1"
                      max="50"
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(e.target.value)}
                    />
                  </div>

                  {/* Search Button */}
                  <div className="flex items-end">
                    <Button className="w-full gap-2">
                      <SearchIcon className="h-4 w-4" />
                      Chercher
                    </Button>
                  </div>

                  {/* Clear Button */}
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setDeparture("");
                        setArrival("");
                        setSelectedDate("");
                        setRadiusKm("10");
                      }}
                    >
                      Réinitialiser
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-3 text-xs">
                  {locationStatus === "denied" && (
                    <div className="text-red-600">Accès à la localisation refusé : certains trajets peuvent ne pas apparaître.</div>
                  )}
                  {locationStatus === "error" && (
                    <div className="text-red-600">Impossible d'obtenir votre position. Réessayez.</div>
                  )}
                  {locationStatus === "granted" && userLocation && (
                    <div className="text-muted-foreground">Filtré autour de votre position (~{radiusKm} km).</div>
                  )}
                  <div className="flex gap-2 items-center">
                    <Button variant="outline" size="sm" onClick={requestLocation}>
                      {locationStatus === "prompting" ? "Localisation en cours..." : "Mettre à jour ma position"}
                    </Button>
                    <span className="text-muted-foreground">Statut : {locationStatus}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map Section */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Carte des trajets</CardTitle>
                <CardDescription>Visualisez les départs des trajets filtrés</CardDescription>
              </CardHeader>
              <CardContent>
                <MapView routes={displayRoutesMap} userLocation={userLocation} center={userLocation || undefined} />
              </CardContent>
            </Card>

            {/* Results */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Routes List */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">
                    Trajets disponibles ({filteredRoutes.length})
                  </h2>
                </div>

                {filteredRoutes.length === 0 ? (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="pt-8 pb-8 text-center">
                      <MapIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground mb-4">
                        Aucun trajet ne correspond à votre recherche
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDeparture("");
                          setArrival("");
                          setSelectedDate("");
                        }}
                      >
                        Modifier la recherche
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  filteredRoutes.map((route) => (
                    <Card
                      key={route.id}
                      className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                      onClick={() => handleViewDetails(route)}
                    >
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {/* Route Info */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-xl font-bold">
                                </p>
                                <span className="text-muted-foreground">→</span>
                                <p className="text-xl font-bold">
                                  {route.departure.name}
                                </p>
                                <span className="text-muted-foreground">→</span>
                                <p className="text-xl font-bold">
                                  {route.arrival.name}
                                </p>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Trajet régulier
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-primary">
                                500 XOF
                              </p>
                              <p className="text-xs text-muted-foreground">
                                par passager
                              </p>
                            </div>
                          </div>

                          {/* Driver Info */}
                          <div className="border-t pt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Users className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">{route.driver.name}</p>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs font-medium">
                                      5.0
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      (12 avis)
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  {route.departureTime}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Seats Info */}
                          <div className="flex items-center gap-2 text-sm">
                            <Bike className="h-4 w-4 text-muted-foreground" />
                            <span>{route.availableSeats} places disponible(s)</span>
                          </div>

                          {/* Action Button */}
                          <div className="flex gap-2">
                            <Button
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRequestRide(route);
                              }}
                            >
                              Demander un trajet
                            </Button>
                            <Button variant="outline" className="flex-1">
                              Plus de détails
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}

                {userLocation && nearestRoutesWithDistance.length > 0 && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">Les plus proches de vous</CardTitle>
                      <CardDescription>Top 3 des départs autour de votre position</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {nearestRoutesWithDistance.slice(0, 3).map(({ route, distance }) => (
                        <div key={route.id} className="flex items-center justify-between text-sm">
                          <div>
                            <p className="font-medium">{route.departure.name} → {route.arrival.name}</p>
                            <p className="text-muted-foreground">{distance.toFixed(1)} km</p>
                          </div>
                          <Button size="sm" onClick={() => handleRequestRide(route)}>Choisir</Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar - Route Details */}
              <div className="space-y-4">
                {showDetails && selectedRoute ? (
                  <>
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle>Détails du trajet</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Route Details */}
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              DÉPART
                            </p>
                            <p className="font-medium">
                              {selectedRoute.departure.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              DESTINATION
                            </p>
                            <p className="font-medium">
                              {selectedRoute.arrival.name}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                HEURE
                              </p>
                              <p className="font-medium">
                                {selectedRoute.departureTime}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                RETOUR
                              </p>
                              <p className="font-medium">
                                {selectedRoute.arrivalTime}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              FRÉQUENCE
                            </p>
                            <p className="text-sm">
                              Du lundi au vendredi
                            </p>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <p className="text-2xl font-bold text-primary mb-2">
                            500 XOF
                          </p>
                          <p className="text-xs text-muted-foreground">
                            par passager
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle>À propos du conducteur</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {selectedRoute.driver.name}
                            </p>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">
                                5.0
                              </span>
                              <span className="text-sm text-muted-foreground">
                                (12 avis)
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">
                            MOTO
                          </p>
                          <p className="font-medium">
                            {selectedRoute.moto.brand}{" "}
                            {selectedRoute.moto.model}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {selectedRoute.moto.licensePlate}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 gap-2"
                            size="sm"
                          >
                            <MessageCircle className="h-4 w-4" />
                            Message
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 gap-2"
                            size="sm"
                          >
                            <Phone className="h-4 w-4" />
                            Appeler
                          </Button>
                        </div>

                        <Button
                          className="w-full"
                          onClick={() => handleRequestRide(selectedRoute)}
                        >
                          Demander ce trajet
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="pt-8 pb-8 text-center">
                      <MapIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-sm text-muted-foreground">
                        Sélectionnez un trajet pour voir les détails
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <RequestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmRequest}
        routeTitle={selectedRoute ? `${selectedRoute.departure.name} → ${selectedRoute.arrival.name}` : undefined}
      />
    </div>
  );
}
