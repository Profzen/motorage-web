"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function ZonesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Zones</h1>
        <p className="text-muted-foreground">Gestion des zones géographiques et des trajets.</p>
      </div>

      <Card className="bg-card/50 border-0 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Zones disponibles</CardTitle>
          <CardDescription>Carte interactive des zones de service.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
          <AlertCircle className="h-5 w-5" />
          <p>Page en construction — intégration Leaflet à venir.</p>
        </CardContent>
      </Card>
    </div>
  );
}
