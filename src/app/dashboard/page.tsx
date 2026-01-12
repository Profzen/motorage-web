import { PlaceholderPage } from "@/components/layout/PlaceholderPage";
import { Lock } from "lucide-react";

export default function DashboardPage() {
  return (
    <PlaceholderPage title="Tableau de Bord">
      <div className="text-left space-y-4">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-sm mb-4">
          <Lock className="h-4 w-4" />
          <span>Cette zone sera restreinte aux utilisateurs connectés au Sprint 2.</span>
        </div>
        <p>Bienvenue sur votre espace personnel.</p>
        <div className="h-32 rounded-lg bg-muted animate-pulse"></div>
        <p className="text-sm text-muted-foreground italic">La logique d&apos;authentification et les données réelles seront intégrées prochainement avec Firebase.</p>
      </div>
    </PlaceholderPage>
  );
}
