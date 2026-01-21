"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function FluxPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Flux d&apos;activité</h1>
        <p className="text-muted-foreground">Suivi en temps réel des événements sur la plateforme.</p>
      </div>

      <Card className="bg-card/50 border-0 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Flux centralisé</CardTitle>
          <CardDescription>Les événements apparaissent ci-dessous au fur et à mesure.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
          <AlertCircle className="h-5 w-5" />
          <p>Page en construction — consultez le flux d&apos;audit au dashboard.</p>
        </CardContent>
      </Card>
    </div>
  );
}
