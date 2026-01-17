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
  const [flash, setFlash] = useState<{ text: string; type: "success" | "error" } | null>(null);

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
    <div className="container mx-auto px-4 py-20 md:py-32 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-foreground">Publier un trajet</h1>
        <p className="text-muted-foreground">
          Proposez une place sur votre moto pour un trajet régulier
        </p>
      </div>

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

      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Point de départ */}
              <div className="space-y-2">
                <Label htmlFor="pointDepart">Point de départ</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="pointDepart"
                    placeholder="Ex: Campus Principal"
                    className="pl-10 h-11"
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
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="destination"
                    placeholder="Ex: Centre Ville"
                    className="pl-10 h-11"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date de départ</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    className="pl-10 h-11"
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
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="time"
                    type="time"
                    className="pl-10 h-11"
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
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="places"
                  type="number"
                  min="1"
                  max="2"
                  className="pl-10 h-11"
                  required
                  value={placesDisponibles}
                  onChange={(e) => setPlacesDisponibles(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full h-11 gap-2 text-base" disabled={loading}>
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

