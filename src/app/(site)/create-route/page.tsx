"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Calendar, Clock, Users, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useTrajetsStore, useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function CreateRoutePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const createTrajet = useTrajetsStore((state) => state.createTrajet);

  const [pointDepart, setPointDepart] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [placesDisponibles, setPlacesDisponibles] = useState("1");
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setFlash({ text: "Vous devez être connecté", type: "error" });
      return;
    }

    setLoading(true);
    try {
      // Combine date and time into ISO string
      const dateHeure = new Date(`${date}T${time}`).toISOString();

      createTrajet({
        pointDepart,
        destination,
        dateHeure,
        placesDisponibles: parseInt(placesDisponibles, 10),
        conducteurId: user.id,
      });

      setFlash({ text: "Trajet publié avec succès !", type: "success" });
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      setFlash({ text: "Erreur lors de la publication", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-20 md:py-32">
      <div className="mb-8">
        <h1 className="text-foreground mb-2 text-4xl font-bold">
          Publier un trajet
        </h1>
        <p className="text-muted-foreground">
          Proposez une place sur votre moto pour un trajet régulier
        </p>
      </div>

      {flash && (
        <div
          className={`mb-4 rounded-lg border p-3 text-sm ${
            flash.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-100"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-100"
          }`}
        >
          {flash.text}
        </div>
      )}

      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Point de départ */}
              <div className="space-y-2">
                <Label htmlFor="pointDepart">Point de départ</Label>
                <div className="relative">
                  <MapPin className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="pointDepart"
                    placeholder="Ex: Campus Principal"
                    className="h-11 pl-10"
                    required
                    value={pointDepart}
                    onChange={(e) => setPointDepart(e.target.value)}
                  />
                </div>
              </div>

              {/* Destination */}
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <div className="relative">
                  <MapPin className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="destination"
                    placeholder="Ex: Centre Ville"
                    className="h-11 pl-10"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date de départ</Label>
                <div className="relative">
                  <Calendar className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="date"
                    type="date"
                    className="h-11 pl-10"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Heure */}
              <div className="space-y-2">
                <Label htmlFor="time">Heure de départ</Label>
                <div className="relative">
                  <Clock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="time"
                    type="time"
                    className="h-11 pl-10"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="places">Places disponibles (1 ou 2)</Label>
              <div className="relative">
                <Users className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="places"
                  type="number"
                  min="1"
                  max="2"
                  className="h-11 pl-10"
                  required
                  value={placesDisponibles}
                  onChange={(e) => setPlacesDisponibles(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="h-11 w-full gap-2 text-base"
                disabled={loading}
              >
                {loading ? "Publication..." : "Publier le trajet"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
