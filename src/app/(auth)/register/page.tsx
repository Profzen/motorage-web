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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerFormSchema } from "@/lib/validation";
import { z } from "zod";

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const registerUser = useAuthStore((state) => state.register);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerFormSchema),
        mode: "onBlur",
        defaultValues: {
            nom: "",
            prenom: "",
            email: "",
            password: "",
            confirmPassword: "",
        } as RegisterFormValues,
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setError("");
        setLoading(true);

        try {
            await registerUser(data.nom, data.prenom, data.email, data.password);
            router.push("/dashboard");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
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
                        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                            {/* Global Error Message */}
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
                                            className={`pl-10 h-10 bg-background/50 focus:bg-background transition-all ${errors.nom ? 'border-red-500' : ''}`}
                                            {...register("nom")}
                                        />
                                    </div>
                                    {errors.nom && <p className="text-[10px] text-red-500">{errors.nom.message}</p>}
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
                                            className={`pl-10 h-10 bg-background/50 focus:bg-background transition-all ${errors.prenom ? 'border-red-500' : ''}`}
                                            {...register("prenom")}
                                        />
                                    </div>
                                    {errors.prenom && <p className="text-[10px] text-red-500">{errors.prenom.message}</p>}
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
                                        className={`pl-10 h-11 bg-background/50 focus:bg-background transition-all ${errors.email ? 'border-red-500' : ''}`}
                                        {...register("email")}
                                    />
                                </div>
                                {errors.email && <p className="text-[10px] text-red-500">{errors.email.message}</p>}
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
                                        className={`pl-10 h-11 bg-background/50 focus:bg-background transition-all ${errors.password ? 'border-red-500' : ''}`}
                                        {...register("password")}
                                    />
                                </div>
                                {errors.password && <p className="text-[10px] text-red-500">{errors.password.message}</p>}
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
                                        className={`pl-10 h-11 bg-background/50 focus:bg-background transition-all ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                        {...register("confirmPassword")}
                                    />
                                </div>
                                {errors.confirmPassword && <p className="text-[10px] text-red-500">{errors.confirmPassword.message}</p>}
                            </div>

                            {/* Info Box */}
                            <div className="flex gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-red-900 border-dashed">
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
