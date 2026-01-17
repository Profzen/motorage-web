'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Mail, Lock, AlertCircle, ShieldCheck, Smartphone, HelpCircle } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validation";
import { z } from "zod";
import { motion } from "framer-motion";

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

    const [fieldError, setFieldError] = useState<{ field?: string; message: string } | null>(null);

    const onSubmit = async (data: LoginFormValues) => {
        setError("");
        setFieldError(null);
        setLoading(true);

        try {
            await login(data.email, data.password);
            router.push("/dashboard");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Erreur lors de la connexion";

            if (message.includes('email') || message.includes('compte')) {
                setFieldError({ field: 'email', message });
            } else if (message.includes('passe') || message.includes('password')) {
                setFieldError({ field: 'password', message });
            } else {
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto px-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                {/* Header */}
                <div className="space-y-3 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Accès Sécurisé - Administration
                    </div>
                    <h1 className="text-4xl font-black tracking-tight italic">Miyi Ðekae.</h1>
                    <p className="text-muted-foreground font-medium text-balance">
                        Console de gestion de la flotte motocycliste de l&apos;Université de Lomé.
                    </p>
                </div>

                {/* Login Card */}
                <Card className="border-0 shadow-2xl bg-card rounded-[2.5rem] overflow-hidden ring-1 ring-border/50">
                    <CardHeader className="space-y-1 text-center pt-8">
                        <CardTitle className="text-2xl font-bold">Authentification</CardTitle>
                        <CardDescription className="font-medium">
                            Seuls les administrateurs habilités peuvent accéder à cet espace.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-10">
                        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                            {error && (
                                <div className="flex gap-3 p-4 bg-destructive/10 rounded-2xl border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                                    <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                                    <p className="text-sm font-semibold text-destructive">{error}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-tight ml-1">
                                    Identifiant Professionnel
                                </Label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="votre.nom@univ-lome.tg"
                                        className={`pl-12 h-14 rounded-2xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary transition-all font-medium ${errors.email || fieldError?.field === 'email' ? 'ring-2 ring-destructive' : ''}`}
                                        {...register("email")}
                                    />
                                </div>
                                {errors.email && <p className="text-xs font-bold text-destructive ml-1">{errors.email.message}</p>}
                                {fieldError?.field === 'email' && <p className="text-xs font-bold text-destructive ml-1">{fieldError.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-tight">
                                        Clé d&apos;accès
                                    </Label>
                                    <Link href="#" className="text-xs font-bold text-primary hover:underline">Oublié ?</Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className={`pl-12 h-14 rounded-2xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary transition-all font-medium ${errors.password || fieldError?.field === 'password' ? 'ring-2 ring-destructive' : ''}`}
                                        {...register("password")}
                                    />
                                </div>
                                {errors.password && <p className="text-xs font-bold text-destructive ml-1">{errors.password.message}</p>}
                                {fieldError?.field === 'password' && <p className="text-xs font-bold text-destructive ml-1">{fieldError.message}</p>}
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4" 
                                disabled={loading}
                            >
                                {loading ? "Vérification..." : "Entrer dans la console"}
                            </Button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-border/50 flex flex-col items-center gap-3">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <HelpCircle className="w-3.5 h-3.5" />
                                Un problème d&apos;accès ? 
                            </div>
                            <Button variant="outline" size="sm" className="rounded-xl font-bold h-9">
                                Contacter le support IT
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Section - Information Mobile */}
                <div className="text-center space-y-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Utilisateurs standards</p>
                    <div className="bg-primary/5 rounded-[2rem] p-6 border border-primary/10 flex items-center gap-4 text-left">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Smartphone className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold leading-tight">Miyi Ðekae Mobile</p>
                            <p className="text-[11px] text-muted-foreground font-medium">Réservez un trajet ou proposez vos services directement depuis votre smartphone.</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <Button variant="ghost" className="h-7 px-3 text-[10px] font-black bg-background border border-border rounded-lg">App Store</Button>
                            <Button variant="ghost" className="h-7 px-3 text-[10px] font-black bg-background border border-border rounded-lg">Play Store</Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

