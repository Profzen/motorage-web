'use client';

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
    const [nom, setNom] = useState("");
    const [prenom, setPrenom] = useState("");
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
            if (!nom || !prenom || !email || !password || !confirmPassword) {
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

            await register(nom, prenom, email, password);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Erreur lors de l'inscription");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="w-full max-w-sm">
            <div className="space-y-6">
                {/* Header */}
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold">Inscription</h1>
                    <p className="text-muted-foreground">Rejoignez la communauté Miyi Ðekae</p>
                </div>

                {/* Register Card */}
                <Card className="border-0 shadow-xl bg-background/50 backdrop-blur-sm border border-border/50">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl">Créer un compte</CardTitle>
                        <CardDescription>
                            Remplissez le formulaire pour rejoindre l&apos;aventure
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {/* Error Message */}
                            {error && (
                                <div className="flex gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900 animate-in fade-in slide-in-from-top-1">
                                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
                                </div>
                            )}

                            {/* Nom and Prenom Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nom" className="text-sm font-medium">
                                        Nom
                                    </Label>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="nom"
                                            placeholder="Dupont"
                                            className="pl-10 h-10 bg-background/50 focus:bg-background transition-all"
                                            value={nom}
                                            onChange={(e) => setNom(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="prenom" className="text-sm font-medium">
                                        Prénom
                                    </Label>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="prenom"
                                            placeholder="Jean"
                                            className="pl-10 h-10 bg-background/50 focus:bg-background transition-all"
                                            value={prenom}
                                            onChange={(e) => setPrenom(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">
                                    Email étudiant
                                </Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="etudiant@univ-lome.tg"
                                        className="pl-10 h-11 bg-background/50 focus:bg-background transition-all"
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
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Minimum 8 caractères"
                                        className="pl-10 h-11 bg-background/50 focus:bg-background transition-all"
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
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Confirmez votre mot de passe"
                                        className="pl-10 h-11 bg-background/50 focus:bg-background transition-all"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="flex gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900 border-dashed">
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-green-700 dark:text-green-300">
                                    Utilisez votre email étudiant officiel pour une vérification rapide
                                </p>
                            </div>

                            {/* Terms Checkbox */}
                            <div className="flex items-start gap-2 p-1">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    required
                                />
                                <label htmlFor="terms" className="text-xs text-muted-foreground leading-tight cursor-pointer hover:text-foreground transition-colors">
                                    J&apos;accepte les <Link href="#" className="text-primary hover:underline">conditions d&apos;utilisation</Link> et la <Link href="#" className="text-primary hover:underline">politique de confidentialité</Link>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <Button type="submit" className="w-full h-11 font-semibold text-base shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" disabled={loading}>
                                {loading ? "Création en cours..." : "Créer mon compte"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer Links */}
                <div className="text-center p-4 bg-background/30 backdrop-blur-sm rounded-xl border border-border/50">
                    <p className="text-sm text-muted-foreground">
                        Vous avez déjà un compte ?
                        <Link href="/login" className="ml-1 text-primary font-bold hover:underline">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
