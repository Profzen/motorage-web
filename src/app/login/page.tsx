import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Mail, Lock, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Connexion | MOTORAGE",
  description: "Connectez-vous à votre compte MOTORAGE",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-20 md:py-32 bg-surface/50">
        <div className="container mx-auto px-4 w-full max-w-sm">
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">Connexion</h1>
              <p className="text-muted-foreground">
                Accédez à votre compte MOTORAGE
              </p>
            </div>

            {/* Login Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle>Se connecter</CardTitle>
                <CardDescription>
                  Entrez vos identifiants pour accéder à la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Adresse email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="etudiant@univ-lome.tg"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Mot de passe
                      </Label>
                      <Link href="#" className="text-xs text-primary hover:underline">
                        Mot de passe oublié ?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Utilisez votre email étudiant (@univ-lome.tg) pour vous connecter
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="w-full h-10 font-medium">
                    Se connecter
                  </Button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Ou</span>
                    </div>
                  </div>

                  {/* Social Login */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" type="button" className="h-10">
                      <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.544 2.914 1.186.092-.923.35-1.543.636-1.898-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.578 9.578 0 0110 4.817c.85.004 1.705.114 2.504.336 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.578.688.48C17.137 18.192 20 14.444 20 10.017 20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                      </svg>
                      GitHub
                    </Button>
                    <Button variant="outline" type="button" className="h-10">
                      <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M15.545 6.558a9.42 9.42 0 01.139 1.626c0 2.889-2.868 5.776-5.756 5.776-1.056 0-2.059-.27-2.987-.742A4.493 4.493 0 0010 15.5a4.5 4.5 0 100-9 4.493 4.493 0 00-3.268 1.52" />
                      </svg>
                      Google
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Footer Links */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Vous n'avez pas de compte ?
                <Link href="/register" className="ml-1 text-primary font-medium hover:underline">
                  Créer un compte
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
