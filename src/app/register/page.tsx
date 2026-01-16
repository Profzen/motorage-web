'use client';

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { User, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const register = useAuthStore((state) => state.register);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!name || !email || !password || !confirmPassword) {
        setError("Veuillez remplir tous les champs");
        return;
      }

      if (password !== confirmPassword) {
        setError("Les mots de passe ne correspondent pas");
        return;
      }

      if (password.length < 8) {
        setError("Le mot de passe doit contenir au moins 8 caractères");
        return;
      }

      if (!termsAccepted) {
        setError("Vous devez accepter les conditions d'utilisation");
        return;
      }

      await register(name, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-20 md:py-32 bg-surface/50">
        <div className="container mx-auto px-4 w-full max-w-sm">
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">Créer un compte</h1>
              <p className="text-muted-foreground">
                Rejoignez la communauté MOTORAGE
              </p>
            </div>

            {/* Register Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle>Inscription</CardTitle>
                <CardDescription>
                  Remplissez le formulaire pour créer votre compte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* Error Message */}
                  {error && (
                    <div className="flex gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700 dark:text-red-300">
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Full Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Nom complet
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="Jean Dupont"
                        className="pl-10"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email étudiant
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="etudiant@univ-lome.tg"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Mot de passe
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Minimum 8 caractères"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirmer le mot de passe
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirmez votre mot de passe"
                        className="pl-10"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="flex gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-green-700 dark:text-green-300">
                      Utilisez votre email étudiant officiel pour une vérification rapide
                    </p>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-start gap-2">
                    <input
                      id="terms"
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-border"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      required
                    />
                    <label htmlFor="terms" className="text-xs text-muted-foreground leading-tight">
                      J'accepte les conditions d'utilisation et la politique de confidentialité
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full h-10 font-medium"
                    disabled={loading}
                  >
                    {loading ? "Création en cours..." : "Créer mon compte"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Footer Links */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Vous avez déjà un compte ?
                <Link href="/login" className="ml-1 text-primary font-medium hover:underline">
                  Se connecter
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
