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
import { useTrajetsStore, useReservationsStore, useAuthStore, useLocationStore, useNotificationsStore } from "@/lib/store";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const MapView = dynamic(() => import("@/components/sections/MapView").then(m => m.MapView), { ssr: false });
import { RequestModal } from "@/components/ui/request-modal";

export default function SearchPage() {
  const trajets = useTrajetsStore((state) => state.trajets);
  const user = useAuthStore((state) => state.user);
  const userLocation = useLocationStore((s) => s.location);
  const locationStatus = useLocationStore((s) => s.status);
  const requestLocation = useLocationStore((s) => s.requestLocation);

  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [radiusKm, setRadiusKm] = useState("10");
  const [filteredTrajets, setFilteredTrajets] = useState(trajets);
  const [selectedTrajet, setSelectedTrajet] = useState<(typeof trajets)[0] | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [flash, setFlash] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const addReservation = useReservationsStore((state) => state.addReservation);
  const addNotification = useNotificationsStore((state) => state.addNotification);

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
    let filtered = trajets;

    if (departure) {
      filtered = filtered.filter((t) =>
        t.pointDepart.toLowerCase().includes(departure.toLowerCase())
      );
    }

    if (arrival) {
      filtered = filtered.filter((t) =>
        t.destination.toLowerCase().includes(arrival.toLowerCase())
      );
    }

    if (selectedDate) {
      filtered = filtered.filter((t) => t.dateHeure.split('T')[0] === selectedDate);
    }

    const radiusValue = parseInt(radiusKm || "0", 10);
    if (userLocation && radiusValue > 0) {
      filtered = filtered.filter((t) => {
        if (!t.departureLat || !t.departureLng) return true;
        return distanceKm({ lat: t.departureLat, lng: t.departureLng }, userLocation) <= radiusValue;
      });
    }

    setFilteredTrajets(filtered);
  }, [departure, arrival, selectedDate, trajets, userLocation, radiusKm]);

  const handleViewDetails = (trajet: (typeof trajets)[0]) => {
    setSelectedTrajet(trajet);
    setShowDetails(true);
  };

  const handleRequestRide = (trajet: (typeof trajets)[0]) => {
    setSelectedTrajet(trajet);
    setModalOpen(true);
  };

  const handleConfirmRequest = (requestedSeats: number) => {
    if (!selectedTrajet) return;

    addReservation({
      id: `req-${Date.now()}`,
      etudiantId: user?.id || "user1",
      trajetId: selectedTrajet.id,
      status: "en_attente",
      createdAt: new Date().toISOString(),
    });

    // Notifier le conducteur
    addNotification({
      userId: selectedTrajet.conducteurId,
      titre: "Nouvelle réservation",
      message: `${user?.prenom || 'Un étudiant'} souhaite rejoindre votre trajet ${selectedTrajet.pointDepart} → ${selectedTrajet.destination}`,
      type: "info"
    });

    setModalOpen(false);
    setShowDetails(false);
    setFlash({ text: "Demande envoyée", type: "success" });
    setTimeout(() => setFlash(null), 2500);
  };

  const nearestTrajetsWithDistance = userLocation
    ? trajets
      .map((t) => ({
        trajet: t,
        distance: t.departureLat ? distanceKm({ lat: t.departureLat, lng: t.departureLng! }, userLocation) : 9999,
      }))
      .sort((a, b) => a.distance - b.distance)
    : [];

  const closestTrajets = nearestTrajetsWithDistance.slice(0, 3).map((item) => item.trajet);
  const displayTrajetsMap = userLocation
    ? Array.from(new Map([...filteredTrajets, ...closestTrajets].map((t) => [t.id, t]))).map(([, t]) => t)
    : filteredTrajets;

  return (
    <div className="container mx-auto px-4 py-20 md:py-32">
      {flash && (
        <div
          className={`mb-4 p-3 rounded-lg border text-sm ${flash.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-100"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100"
            }`}
        >
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
                <div className="text-red-600">
                  Accès à la localisation refusé : certains trajets peuvent ne pas
                  apparaître.
                </div>
              )}
              {locationStatus === "error" && (
                <div className="text-red-600">
                  Impossible d'obtenir votre position. Réessayez.
                </div>
              )}
              {locationStatus === "granted" && userLocation && (
                <div className="text-muted-foreground">
                  Filtré autour de votre position (~{radiusKm} km).
                </div>
              )}
              <div className="flex gap-2 items-center">
                <Button variant="outline" size="sm" onClick={requestLocation}>
                  {locationStatus === "prompting"
                    ? "Localisation en cours..."
                    : "Mettre à jour ma position"}
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
            <MapView
              trajets={displayTrajetsMap.map((t) => ({
                id: t.id,
                departure: {
                  name: t.pointDepart,
                  lat: t.departureLat || 0,
                  lng: t.departureLng || 0,
                },
                arrival: {
                  name: t.destination,
                  lat: t.arrivalLat || 0,
                  lng: t.arrivalLng || 0,
                },
                driver: { name: `${t.conducteur.prenom} ${t.conducteur.nom}` },
                departureTime: t.dateHeure,
              }))}
              userLocation={userLocation}
              center={userLocation || undefined}
            />
          </CardContent>
        </Card>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Results List */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                Trajets disponibles ({filteredTrajets.length})
              </h2>
            </div>

            {filteredTrajets.length === 0 ? (
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
              filteredTrajets.map((trajet) => (
                <Card
                  key={trajet.id}
                  className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => handleViewDetails(trajet)}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Trajet Info */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-xl font-bold">{trajet.pointDepart}</p>
                            <span className="text-muted-foreground">→</span>
                            <p className="text-xl font-bold">{trajet.destination}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">Trajet régulier</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">500 XOF</p>
                          <p className="text-xs text-muted-foreground">par passager</p>
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
                              <p className="font-medium">
                                {trajet.conducteur.prenom} {trajet.conducteur.nom}
                              </p>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-medium">5.0</span>
                                <span className="text-xs text-muted-foreground">
                                  (12 avis)
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{trajet.dateHeure}</span>
                          </div>
                        </div>
                      </div>

                      {/* Seats Info */}
                      <div className="flex items-center gap-2 text-sm">
                        <Bike className="h-4 w-4 text-muted-foreground" />
                        <span>{trajet.placesDisponibles} places disponible(s)</span>
                      </div>

                      {/* Action Button */}
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRequestRide(trajet);
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

            {userLocation && nearestTrajetsWithDistance.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Les plus proches de vous</CardTitle>
                  <CardDescription>
                    Top 3 des départs autour de votre position
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {nearestTrajetsWithDistance
                    .slice(0, 3)
                    .map(({ trajet, distance }) => (
                      <div
                        key={trajet.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div>
                          <p className="font-medium">
                            {trajet.pointDepart} → {trajet.destination}
                          </p>
                          <p className="text-muted-foreground">
                            {distance.toFixed(1)} km
                          </p>
                        </div>
                        <Button size="sm" onClick={() => handleRequestRide(trajet)}>
                          Choisir
                        </Button>
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Trajet Details */}
          <div className="space-y-4">
            {showDetails && selectedTrajet ? (
              <>
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Détails du trajet</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">DÉPART</p>
                        <p className="font-medium">{selectedTrajet.pointDepart}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">DESTINATION</p>
                        <p className="font-medium">{selectedTrajet.destination}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">HEURE</p>
                          <p className="font-medium">{selectedTrajet.dateHeure}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">FRÉQUENCE</p>
                        <p className="text-sm">Du lundi au vendredi</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-2xl font-bold text-primary mb-2">500 XOF</p>
                      <p className="text-xs text-muted-foreground">par passager</p>
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
                          {selectedTrajet.conducteur.prenom}{" "}
                          {selectedTrajet.conducteur.nom}
                        </p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">5.0</span>
                          <span className="text-sm text-muted-foreground">(12 avis)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 gap-2" size="sm">
                        <MessageCircle className="h-4 w-4" />
                        Message
                      </Button>
                      <Button variant="outline" className="flex-1 gap-2" size="sm">
                        <Phone className="h-4 w-4" />
                        Appeler
                      </Button>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => handleRequestRide(selectedTrajet)}
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
      <RequestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmRequest}
        trajetTitle={
          selectedTrajet
            ? `${selectedTrajet.pointDepart} → ${selectedTrajet.destination}`
            : undefined
        }
      />
    </div>
  );
}
