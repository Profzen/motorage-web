'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validation";
import { z } from "zod";

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    });

    const onSubmit = async (data: LoginFormValues) => {
        setError("");
        setLoading(true);

        try {
            await login(data.email, data.password);
            router.push("/dashboard");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Erreur lors de la connexion");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm">
            <div className="space-y-6">
                {/* Header */}
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold">Connexion</h1>
                    <p className="text-muted-foreground">Accédez à votre compte Miyi Ðekae</p>
                </div>

                {/* Login Card */}
                <Card className="border-0 shadow-xl bg-background/50 backdrop-blur-sm border border-border/50">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl">Se connecter</CardTitle>
                        <CardDescription>
                            Entrez vos identifiants pour accéder à la plateforme
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

                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">
                                    Adresse email
                                </Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="etudiant@univ-lome.tg"
                                        className={`pl-10 h-11 bg-background/50 focus:bg-background transition-all ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                        {...register("email")}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                                )}
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
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className={`pl-10 h-11 bg-background/50 focus:bg-background transition-all ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                        {...register("password")}
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Info Box */}
                            <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900 border-dashed">
                                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    Utilisez votre email étudiant (@univ-lome.tg) pour vous connecter
                                </p>
                            </div>

                            {/* Submit Button */}
                            <Button type="submit" className="w-full h-11 font-semibold text-base shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" disabled={loading}>
                                {loading ? "Connexion en cours..." : "Se connecter"}
                            </Button>

                            {/* Divider */}
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background/50 px-2 text-muted-foreground backdrop-blur-sm">Ou</span>
                                </div>
                            </div>

                            {/* Social Login */}
                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" type="button" className="h-10 hover:bg-background hover:border-primary/50 transition-all">
                                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.544 2.914 1.186.092-.923.35-1.543.636-1.898-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.578 9.578 0 0110 4.817c.85.004 1.705.114 2.504.336 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.578.688.48C17.137 18.192 20 14.444 20 10.017 20 4.484 15.522 0 10 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    GitHub
                                </Button>
                                <Button variant="outline" type="button" className="h-10 hover:bg-background hover:border-primary/50 transition-all">
                                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /><path d="M1 1L23 23" stroke="white" strokeWidth="2" />
                                    </svg>
                                    Google
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer Links */}
                <div className="text-center p-4 bg-background/30 backdrop-blur-sm rounded-xl border border-border/50">
                    <p className="text-sm text-muted-foreground">
                        Vous n&apos;avez pas de compte ?
                        <Link href="/register" className="ml-1 text-primary font-bold hover:underline">
                            Créer un compte
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
