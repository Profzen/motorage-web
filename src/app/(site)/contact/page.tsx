import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";

export const metadata = {
  title: "Contact | Miyi Ðekae",
  description: "Contactez l'équipe Miyi Ðekae",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-20 md:py-32">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl font-bold">Contactez-nous</h1>
          <p className="text-lg text-muted-foreground">
            Une question ? Une suggestion ? Nous serions heureux de vous entendre
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Contact Info Cards */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5 text-primary" />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <a href="mailto:contact@miyi-dekae.tg" className="hover:text-primary transition-colors">
                contact@miyi-dekae.tg
              </a>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Phone className="h-5 w-5 text-secondary" />
                Téléphone
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <a href="tel:+22890123456" className="hover:text-primary transition-colors">
                +228 90 12 34 56
              </a>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-accent" />
                Localisation
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>Université de Lomé</p>
              <p>Togo</p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Envoyez-nous un message</CardTitle>
            <CardDescription>
              Nous répondrons à votre message dans les 24 heures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Votre nom
                  </Label>
                  <Input id="name" placeholder="Jean Dupont" required />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Votre email
                  </Label>
                  <Input id="email" type="email" placeholder="jean@univ-lome.tg" required />
                </div>
              </div>

              {/* Subject Field */}
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium">
                  Sujet
                </Label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="subject"
                    placeholder="Sujet de votre message"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Message Field */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium">
                  Message
                </Label>
                <textarea
                  id="message"
                  placeholder="Décrivez votre message..."
                  className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                ></textarea>
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Catégorie
                </Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Sélectionnez une catégorie</option>
                  <option value="bug">Signaler un bug</option>
                  <option value="feature">Suggestion de fonctionnalité</option>
                  <option value="support">Besoin d&apos;assistance</option>
                  <option value="partnership">Partenariat</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full h-10 font-medium">
                Envoyer le message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
