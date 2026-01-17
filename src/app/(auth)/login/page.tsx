"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import {
  Mail,
  Lock,
  AlertCircle,
  ShieldCheck,
  Smartphone,
  HelpCircle,
} from "lucide-react";
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
    },
  });

  const [fieldError, setFieldError] = useState<{
    field?: string;
    message: string;
  } | null>(null);

  const onSubmit = async (data: LoginFormValues) => {
    setError("");
    setFieldError(null);
    setLoading(true);

    try {
      await login(data.email, data.password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de la connexion";

      if (message.includes("email") || message.includes("compte")) {
        setFieldError({ field: "email", message });
      } else if (message.includes("passe") || message.includes("password")) {
        setFieldError({ field: "password", message });
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="space-y-3 text-center">
          <div className="bg-primary/10 text-primary mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase">
            <ShieldCheck className="h-3.5 w-3.5" />
            Accès Sécurisé - Administration
          </div>
          <h1 className="text-4xl font-black tracking-tight italic">
            Miyi Ðekae.
          </h1>
          <p className="text-muted-foreground font-medium text-balance">
            Console de gestion de la flotte motocycliste de l&apos;Université de
            Lomé.
          </p>
        </div>

        {/* Login Card */}
        <Card className="bg-card ring-border/50 overflow-hidden rounded-[2.5rem] border-0 shadow-2xl ring-1">
          <CardHeader className="space-y-1 pt-8 text-center">
            <CardTitle className="text-2xl font-bold">
              Authentification
            </CardTitle>
            <CardDescription className="font-medium">
              Seuls les administrateurs habilités peuvent accéder à cet espace.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="bg-destructive/10 border-destructive/20 animate-in fade-in slide-in-from-top-1 flex gap-3 rounded-2xl border p-4">
                  <AlertCircle className="text-destructive mt-0.5 h-5 w-5 shrink-0" />
                  <p className="text-destructive text-sm font-semibold">
                    {error}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="ml-1 text-xs font-bold tracking-tight uppercase"
                >
                  Identifiant Professionnel
                </Label>
                <div className="group relative">
                  <Mail className="text-muted-foreground group-focus-within:text-primary absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre.nom@univ-lome.tg"
                    className={`bg-muted/50 focus-visible:ring-primary h-14 rounded-2xl border-0 pl-12 font-medium transition-all focus-visible:ring-2 ${errors.email || fieldError?.field === "email" ? "ring-destructive ring-2" : ""}`}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-destructive ml-1 text-xs font-bold">
                    {errors.email.message}
                  </p>
                )}
                {fieldError?.field === "email" && (
                  <p className="text-destructive ml-1 text-xs font-bold">
                    {fieldError.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="ml-1 flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-xs font-bold tracking-tight uppercase"
                  >
                    Clé d&apos;accès
                  </Label>
                  <Link
                    href="#"
                    className="text-primary text-xs font-bold hover:underline"
                  >
                    Oublié ?
                  </Link>
                </div>
                <div className="group relative">
                  <Lock className="text-muted-foreground group-focus-within:text-primary absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className={`bg-muted/50 focus-visible:ring-primary h-14 rounded-2xl border-0 pl-12 font-medium transition-all focus-visible:ring-2 ${errors.password || fieldError?.field === "password" ? "ring-destructive ring-2" : ""}`}
                    {...register("password")}
                  />
                </div>
                {errors.password && (
                  <p className="text-destructive ml-1 text-xs font-bold">
                    {errors.password.message}
                  </p>
                )}
                {fieldError?.field === "password" && (
                  <p className="text-destructive ml-1 text-xs font-bold">
                    {fieldError.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="shadow-primary/20 mt-4 h-14 w-full rounded-2xl text-lg font-black shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? "Vérification..." : "Entrer dans la console"}
              </Button>
            </form>

            <div className="border-border/50 mt-8 flex flex-col items-center gap-3 border-t pt-6">
              <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
                <HelpCircle className="h-3.5 w-3.5" />
                Un problème d&apos;accès ?
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl font-bold"
              >
                Contacter le support IT
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer Section - Information Mobile */}
        <div className="space-y-4 text-center">
          <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
            Utilisateurs standards
          </p>
          <div className="bg-primary/5 border-primary/10 flex items-center gap-4 rounded-[2rem] border p-6 text-left">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
              <Smartphone className="text-primary h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm leading-tight font-bold">
                Miyi Ðekae Mobile
              </p>
              <p className="text-muted-foreground text-[11px] font-medium">
                Réservez un trajet ou proposez vos services directement depuis
                votre smartphone.
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                className="bg-background border-border h-7 rounded-lg border px-3 text-[10px] font-black"
              >
                App Store
              </Button>
              <Button
                variant="ghost"
                className="bg-background border-border h-7 rounded-lg border px-3 text-[10px] font-black"
              >
                Play Store
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
