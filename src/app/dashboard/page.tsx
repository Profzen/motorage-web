"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Trash2,
  AlertCircle,
  Settings,
  Edit,
  ClipboardCheck,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  KeyRound,
  Car,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { UploadButton } from "@/lib/uploadthing";

interface ProfileData {
  nom: string;
  prenom: string;
  email: string;
  avatar?: string | null;
}

export default function DashboardPage() {
  const { user, logout, updateUser, deleteAccount } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    nom: "",
    prenom: "",
    email: "",
    avatar: null,
  });

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        setProfileData({
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          avatar: user.avatar || null,
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user]);

  useEffect(() => {
    if (mounted && !user) {
      router.push("/login");
    }
  }, [user, router, mounted]);

  const [onboardingCount, setOnboardingCount] = useState<number | null>(null);

  useEffect(() => {
    if (user?.role === "administrateur") {
      fetch("/api/admin/sidebar-counters")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setOnboardingCount(data.data.onboarding);
        })
        .catch(console.error);
    }
  }, [user?.role]);

  if (!user || !mounted) return null;

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(profileData);
    setIsEditingProfile(false);
  };

  const handleDeleteAccount = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer votre compte ?")) {
      deleteAccount(user.id);
      logout();
      router.push("/");
    }
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      conducteur: "Conducteur",
      passager: "Passager",
      administrateur: "Administrateur",
    };
    return roles[role] || role;
  };

  // Si l'utilisateur est un ADMIN
  if (user.role === "administrateur") {
    return (
      <div className="container mx-auto max-w-6xl space-y-10 px-4 py-8">
        <div className="flex flex-col justify-between gap-6 border-b pb-8 md:flex-row md:items-center">
          <div className="space-y-1">
            <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight">
              <ShieldCheck className="text-primary h-8 w-8" />
              Console d&apos;Administration
            </h1>
            <p className="text-muted-foreground font-medium">
              Session sécurisée activée pour{" "}
              <span className="text-foreground font-bold">{user.prenom}</span>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push("/dashboard/drivers")}
              className="h-11 rounded-xl border-0 bg-amber-500 px-6 font-bold text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600"
            >
              <ClipboardCheck className="mr-2 h-4 w-4" />{" "}
              {onboardingCount !== null
                ? onboardingCount > 0
                  ? `${onboardingCount} dossiers`
                  : "Aucun dossier"
                : "..."}
            </Button>
            <Button
              onClick={() => router.push("/dashboard/vehicules")}
              variant="secondary"
              className="h-11 rounded-xl px-6 font-bold"
            >
              <Car className="mr-2 h-4 w-4" /> Véhicules
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="h-11 rounded-xl px-6 font-bold"
            >
              <Settings className="mr-2 h-4 w-4" /> Profil
            </Button>
            <Button
              variant="ghost"
              onClick={logout}
              className="text-destructive hover:bg-destructive/10 h-11 rounded-xl px-6 font-bold"
            >
              <LogOut className="mr-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {isEditingProfile && (
          <ProfileEditor
            profileData={profileData}
            setProfileData={setProfileData}
            handleUpdateProfile={handleUpdateProfile}
            setIsEditingProfile={setIsEditingProfile}
            handleDeleteAccount={handleDeleteAccount}
          />
        )}

        <AdminDashboard />
      </div>
    );
  }

  // Si l'utilisateur est un PASSAGER ou CONDUCTEUR (Vue Web restreinte)
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
        <div className="space-y-8 md:col-span-2">
          <div className="bg-primary/5 border-primary/10 space-y-6 rounded-3xl border p-8 text-center md:p-12">
            <div className="bg-primary/10 text-primary mx-auto flex h-20 w-20 items-center justify-center rounded-2xl">
              <Smartphone className="h-10 w-10 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight">
                Utilisez l&apos;App Mobile
              </h2>
              <p className="text-muted-foreground font-medium">
                Bonjour {user.prenom}, les fonctionnalités de votre compte sont
                exclusivement disponibles sur notre application mobile.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button className="shadow-primary/20 h-12 rounded-xl px-8 font-black shadow-xl">
                Télécharger l&apos;App
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-xl px-8 font-black"
              >
                En savoir plus
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Card className="bg-card/50 rounded-2xl border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  Pourquoi ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-xs leading-relaxed font-medium">
                  Pour garantir votre sécurité et permettre la géolocalisation
                  en temps réel, Miyi Ðekae nécessite l&apos;usage d&apos;un
                  smartphone.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 rounded-2xl border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                  <ExternalLink className="h-4 w-4 text-blue-500" />
                  Web Admin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-xs leading-relaxed font-medium">
                  Cette interface Web est réservée à la gestion administrative
                  de l&apos;Université de Lomé.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="bg-card overflow-hidden rounded-3xl border p-8 text-center shadow-lg">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="border-background h-24 w-24 border-4 shadow-xl">
                <AvatarImage src={user.avatar || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-black">
                  {user.prenom[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-xl font-black tracking-tight">{`${user.prenom} ${user.nom}`}</h2>
                <Badge
                  variant="secondary"
                  className="px-3 text-[10px] font-bold tracking-widest uppercase"
                >
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
              <div className="w-full space-y-2 pt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="h-11 w-full rounded-xl font-bold"
                >
                  <Settings className="mr-2 h-4 w-4" /> Mon Profil
                </Button>
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="text-destructive hover:bg-destructive/10 h-11 w-full rounded-xl font-bold"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                </Button>
              </div>
            </div>
          </Card>

          {isEditingProfile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <ProfileEditor
                profileData={profileData}
                setProfileData={setProfileData}
                handleUpdateProfile={handleUpdateProfile}
                setIsEditingProfile={setIsEditingProfile}
                handleDeleteAccount={handleDeleteAccount}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ProfileEditorProps {
  profileData: ProfileData;
  setProfileData: (data: ProfileData) => void;
  handleUpdateProfile: (e: React.FormEvent) => void;
  setIsEditingProfile: (value: boolean) => void;
  handleDeleteAccount: () => void;
}

function ProfileEditor({
  profileData,
  setProfileData,
  handleUpdateProfile,
  setIsEditingProfile,
  handleDeleteAccount,
}: ProfileEditorProps) {
  const { updatePassword } = useAuthStore();
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStatus, setPasswordStatus] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const onUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPasswordStatus(null);
    try {
      await updatePassword(passwordData);
      setPasswordStatus({
        type: "success",
        message: "Mot de passe mis à jour !",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setShowPasswordSection(false), 2000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setPasswordStatus({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-10 space-y-6">
      <Card className="bg-primary/5 ring-primary/20 rounded-3xl border-0 shadow-2xl ring-1 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-3 text-2xl">
            <div className="bg-primary/10 rounded-lg p-2">
              <Edit className="h-6 w-6" />
            </div>
            Modifier mon profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          <div className="flex flex-col items-center gap-4 py-4 md:flex-row md:gap-8">
            <Avatar className="ring-primary/10 ring-offset-background h-24 w-24 ring-4 ring-offset-4">
              <AvatarImage src={profileData.avatar || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-black uppercase">
                {profileData.prenom[0]}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-3 text-center md:text-left">
              <div className="space-y-1">
                <h4 className="font-bold">Photo de profil</h4>
                <p className="text-muted-foreground text-xs">
                  JPG, PNG ou GIF. Max 2MB.
                </p>
              </div>
              <UploadButton
                endpoint="avatar"
                onClientUploadComplete={(res) => {
                  if (res?.[0]) {
                    setProfileData({ ...profileData, avatar: res[0].url });
                  }
                }}
                onUploadError={(error: Error) => {
                  alert(`Erreur d'upload: ${error.message}`);
                }}
                appearance={{
                  button:
                    "bg-primary text-primary-foreground h-9 px-4 text-sm font-bold rounded-lg",
                  allowedContent: "hidden",
                }}
                content={{
                  button: "Changer la photo",
                }}
              />
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="prenom" className="text-sm font-semibold">
                  Prénom
                </Label>
                <Input
                  id="prenom"
                  className="bg-background/50 h-11 rounded-xl"
                  value={profileData.prenom}
                  onChange={(e) =>
                    setProfileData({ ...profileData, prenom: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom" className="text-sm font-semibold">
                  Nom
                </Label>
                <Input
                  id="nom"
                  className="bg-background/50 h-11 rounded-xl"
                  value={profileData.nom}
                  onChange={(e) =>
                    setProfileData({ ...profileData, nom: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                className="bg-background/50 h-11 rounded-xl"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
              />
            </div>
            <div className="border-primary/10 mt-6 flex flex-wrap gap-4 border-t pt-6">
              <Button
                type="submit"
                className="shadow-primary/20 h-11 grow rounded-xl px-8 font-bold shadow-lg transition-all hover:scale-105 md:grow-0"
              >
                Enregistrer les infos
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="h-11 rounded-xl px-6 font-bold"
              >
                <KeyRound className="mr-2 h-4 w-4" />
                {showPasswordSection
                  ? "Annuler le changement"
                  : "Changer de mot de passe"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditingProfile(false)}
                className="ml-auto h-11 rounded-xl px-6"
              >
                Fermer
              </Button>
            </div>
          </form>

          <AnimatePresence>
            {showPasswordSection && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="border-primary/10 mt-8 space-y-6 border-t pt-8">
                  <div className="text-primary flex items-center gap-2 font-bold">
                    <ShieldCheck className="h-5 w-5" />
                    Sécurité du compte
                  </div>

                  {passwordStatus && (
                    <div
                      className={cn(
                        "flex items-center gap-2 rounded-xl p-4 text-sm font-medium",
                        passwordStatus.type === "success"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-destructive/10 text-destructive"
                      )}
                    >
                      <AlertCircle className="h-4 w-4" />
                      {passwordStatus.message}
                    </div>
                  )}

                  <form onSubmit={onUpdatePassword} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="current">Mot de passe actuel</Label>
                        <Input
                          id="current"
                          type="password"
                          className="bg-background/50 h-10 rounded-xl"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new">Nouveau mot de passe</Label>
                        <Input
                          id="new"
                          type="password"
                          className="bg-background/50 h-10 rounded-xl"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm">Confirmer</Label>
                        <Input
                          id="confirm"
                          type="password"
                          className="bg-background/50 h-10 rounded-xl"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-primary shadow-primary/20 h-11 w-full rounded-xl px-10 font-bold shadow-lg md:w-auto"
                    >
                      {loading
                        ? "Mise à jour..."
                        : "Mettre à jour le mot de passe"}
                    </Button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border-destructive/10 flex justify-end border-t pt-6">
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 h-11 rounded-xl px-4"
              onClick={handleDeleteAccount}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer mon compte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
