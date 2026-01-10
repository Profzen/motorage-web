import { PlaceholderPage } from "@/components/layout/PlaceholderPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  return (
    <PlaceholderPage title="Contact">
      <form className="space-y-4 text-left">
        <div className="space-y-2">
          <Label htmlFor="subject">Sujet</Label>
          <Input id="subject" placeholder="Comment pouvons-nous vous aider ?" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <textarea 
            id="message" 
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Votre message..."
          ></textarea>
        </div>
        <Button className="w-full">Envoyer</Button>
      </form>
    </PlaceholderPage>
  );
}
