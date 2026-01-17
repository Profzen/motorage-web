"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  FileWarning, 
  Send, 
  AlertTriangle, 
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";
import { toast } from "sonner";

export default function ReportIssuePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Votre signalement a été transmis à l'équipe de modération.");
      router.push("/dashboard/my-reports");
    } catch {
      toast.error("Une erreur est survenue lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Signaler un problème</h1>
        <p className="text-muted-foreground">
          Nous prenons votre sécurité au sérieux. Notre équipe examinera votre signalement sous 24h.
        </p>
      </div>

      <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>En cas d&apos;urgence</AlertTitle>
        <AlertDescription>
          Si vous êtes en danger immédiat, veuillez contacter les services de secours de l&apos;université ou la police locale avant de signaler ici.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileWarning className="h-5 w-5 text-primary" />
              Nouveau Signalement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Nature du problème</Label>
              <Select required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unsafe_driving">Conduite imprudente / dangereuse</SelectItem>
                  <SelectItem value="harassment">Harcèlement ou propos inappropriés</SelectItem>
                  <SelectItem value="payment_issue">Problème lors du paiement</SelectItem>
                  <SelectItem value="vehicle_condition">Mauvais état du véhicule</SelectItem>
                  <SelectItem value="other">Autre problème</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trip">Trajet concerné (optionnel)</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un trajet récent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trip-1">Hier, 18:30 - Campus vers Centre</SelectItem>
                  <SelectItem value="trip-2">26 Octobre, 08:15 - Gare vers Faculté</SelectItem>
                  <SelectItem value="none">Aucun trajet en particulier</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" /> Lier un trajet nous aide à identifier la personne concernée plus rapidement.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Détails de l&apos;incident</Label>
              <Textarea 
                id="description"
                placeholder="Veuillez décrire précisément ce qui s&apos;est passé..."
                className="h-32"
                required
              />
            </div>

            <div className="rounded-lg bg-slate-50 p-4 space-y-3">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Preuves (Optionnel)</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button type="button" variant="outline" className="border-dashed h-20 flex flex-col gap-1 border-2">
                  <span className="text-xs">Ajouter une photo</span>
                </Button>
                <Button type="button" variant="outline" className="border-dashed h-20 flex flex-col gap-1 border-2">
                  <span className="text-xs">Capturer photo</span>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6 mt-4">
            <Button variant="ghost" type="button" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button type="submit" className="gap-2" disabled={loading}>
              {loading ? "Envoi en cours..." : (
                <>
                  Envoyer le signalement
                  <Send className="h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
