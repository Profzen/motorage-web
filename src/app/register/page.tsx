import { PlaceholderPage } from "@/components/layout/PlaceholderPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  return (
    <PlaceholderPage title="Inscription">
      <form className="space-y-4 text-left">
        <div className="space-y-2">
          <Label htmlFor="name">Nom complet</Label>
          <Input id="name" placeholder="John Doe" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email étudiant</Label>
          <Input id="email" type="email" placeholder="votre@univ-lome.tg" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" type="password" />
        </div>
        <Button className="w-full">Créer mon compte</Button>
      </form>
    </PlaceholderPage>
  );
}
