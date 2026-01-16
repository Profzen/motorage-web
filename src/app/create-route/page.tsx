"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  Bike,
} from "lucide-react";
import { useRoutesStore } from "@/lib/store";
import { useAuthStore } from "@/lib/store";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateRoutePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const createRoute = useRoutesStore((state) => state.createRoute);

  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [availableSeats, setAvailableSeats] = useState("1");
  const [price, setPrice] = useState("500");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!departure || !arrival || !date || !time || !availableSeats || !price) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (parseInt(availableSeats) < 1) {
      setError("Le nombre de places doit être au moins 1");
      return;
    }

    if (parseInt(price) < 100) {
      setError("Le prix doit être au minimum 100 XOF");
      return;
    }

    setLoading(true);
    try {
      createRoute({
        departure,
        arrival,
        day: date,
        time,
        availableSeats: parseInt(availableSeats),
        price: parseInt(price),
        description,
        driverId: user?.id || "user1",
      });

      // Reset form
      setDeparture("");
      setArrival("");
      setDate("");
      setTime("");
      setAvailableSeats("1");
      setPrice("500");
      setDescription("");

      alert("Trajet créé avec succès!");
      router.push("/dashboard");
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow py-20 md:py-32 bg-surface/50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl space-y-8">
            {/* Page Header */}
            <div>
              <h1 className="text-4xl font-bold mb-2">Créer un nouveau trajet</h1>
              <p className="text-muted-foreground">
                Proposez vos trajets habituels et aidez d'autres étudiants
              </p>
            </div>

            {/* Form Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Détails du trajet</CardTitle>
                <CardDescription>
                  Complétez les informations de votre trajet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Message */}
                  {error && (
                    <div className="flex gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700 dark:text-red-300">
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Departure & Arrival */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="departure">Point de départ</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="departure"
                          placeholder="Ex: Campus UL"
                          className="pl-10"
                          value={departure}
                          onChange={(e) => setDeparture(e.target.value)}
                          required
                        />
                      </div>
                    </div>
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
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Heure de départ</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="time"
                          type="time"
                          className="pl-10"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Available Seats & Price */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="seats">Places disponibles</Label>
                      <div className="relative">
                        <Bike className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="seats"
                          type="number"
                          min="1"
                          max="3"
                          className="pl-10"
                          value={availableSeats}
                          onChange={(e) => setAvailableSeats(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Prix par passager (XOF)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="100"
                        step="100"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optionnel)</Label>
                    <textarea
                      id="description"
                      placeholder="Ex: Trajet habituel, point de rendez-vous précis, conditions particulières..."
                      className="w-full h-24 px-3 py-2 text-sm rounded-md border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  {/* Info Box */}
                  <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                    <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Une fois publié, votre trajet sera visible pour tous les étudiants
                      cherchant un covoiturage. Vous recevrez les demandes d'autres
                      utilisateurs.
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={loading}
                    >
                      {loading ? "Création en cours..." : "Publier le trajet"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.back()}
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Tips Section */}
            <Card className="border-0 shadow-sm bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base">Conseils pour un bon trajet</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>Soyez précis sur votre point de départ et d'arrivée</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>Fixez un prix juste et compétitif</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>Donnez une description claire des conditions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>Répondez rapidement aux demandes des passagers</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
