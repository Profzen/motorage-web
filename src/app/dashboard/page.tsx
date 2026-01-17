'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
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
  KeyRound
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';

interface ProfileData {
  nom: string;
  prenom: string;
  email: string;
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
    nom: '',
    prenom: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        setProfileData({
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user]);

  useEffect(() => {
    if (mounted && !user) {
      router.push('/login');
    }
  }, [user, router, mounted]);

  if (!user || !mounted) return null;

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(profileData);
    setIsEditingProfile(false);
  };

  const handleDeleteAccount = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ?')) {
      deleteAccount(user.id);
      logout();
      router.push('/');
    }
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      conducteur: 'Conducteur',
      passager: 'Passager',
      administrateur: 'Administrateur',
      visiteur: 'Visiteur'
    };
    return roles[role] || role;
  };

  // Si l'utilisateur est un ADMIN
  if (user.role === 'administrateur') {
    return (
      <div className="container mx-auto py-8 px-4 space-y-10 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-primary" />
              Console d&apos;Administration
            </h1>
            <p className="text-muted-foreground font-medium">
              Session sécurisée activée pour <span className="text-foreground font-bold">{user.prenom}</span>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => router.push('/dashboard/drivers')} className="rounded-xl font-bold bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20 text-white border-0 h-11 px-6">
              <ClipboardCheck className="w-4 h-4 mr-2" /> 12 dossiers
            </Button>
            <Button variant="outline" onClick={() => setIsEditingProfile(!isEditingProfile)} className="rounded-xl font-bold h-11 px-6">
              <Settings className="w-4 h-4 mr-2" /> Profil
            </Button>
            <Button variant="ghost" onClick={logout} className="rounded-xl text-destructive hover:bg-destructive/10 font-bold h-11 px-6">
              <LogOut className="w-4 h-4 mr-2" />
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
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 md:p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
              <Smartphone className="w-10 h-10 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight">Utilisez l&apos;App Mobile</h2>
              <p className="text-muted-foreground font-medium">
                Bonjour {user.prenom}, les fonctionnalités de <span className="text-foreground font-bold">{user.role}</span> sont exclusivement disponibles sur notre application mobile.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button className="rounded-xl font-black px-8 h-12 shadow-xl shadow-primary/20">
                Télécharger l&apos;App
              </Button>
              <Button variant="outline" className="rounded-xl font-black px-8 h-12">
                En savoir plus
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <Card className="border-0 shadow-sm bg-card/50 rounded-2xl">
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-bold flex items-center gap-2">
                   <AlertCircle className="w-4 h-4 text-amber-500" />
                   Pourquoi ?
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                   Pour garantir votre sécurité et permettre la géolocalisation en temps réel, Miyi Ðekae nécessite l&apos;usage d&apos;un smartphone.
                 </p>
               </CardContent>
             </Card>
             <Card className="border-0 shadow-sm bg-card/50 rounded-2xl">
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-bold flex items-center gap-2">
                   <ExternalLink className="w-4 h-4 text-blue-500" />
                   Web Admin
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                   Cette interface Web est réservée à la gestion administrative de l&apos;Université de Lomé.
                 </p>
               </CardContent>
             </Card>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="border shadow-lg bg-card rounded-3xl overflow-hidden text-center p-8">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-black">
                  {user.prenom[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-xl font-black tracking-tight">{`${user.prenom} ${user.nom}`}</h2>
                <Badge variant="secondary" className="font-bold text-[10px] tracking-widest uppercase px-3">
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
              <div className="w-full pt-6 space-y-2">
                <Button variant="outline" onClick={() => setIsEditingProfile(!isEditingProfile)} className="w-full rounded-xl font-bold h-11">
                  <Settings className="w-4 h-4 mr-2" /> Mon Profil
                </Button>
                <Button variant="ghost" onClick={logout} className="w-full rounded-xl text-destructive hover:bg-destructive/10 font-bold h-11">
                  <LogOut className="w-4 h-4 mr-2" /> Déconnexion
                </Button>
              </div>
            </div>
          </Card>

          {isEditingProfile && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
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

function ProfileEditor({ profileData, setProfileData, handleUpdateProfile, setIsEditingProfile, handleDeleteAccount }: ProfileEditorProps) {
  const { updatePassword } = useAuthStore();
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'error' | 'success', message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const onUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPasswordStatus(null);
    try {
      await updatePassword(passwordData);
      setPasswordStatus({ type: 'success', message: 'Mot de passe mis à jour !' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setShowPasswordSection(false), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      setPasswordStatus({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 mb-10">
      <Card className="border-0 shadow-2xl bg-primary/5 backdrop-blur-md ring-1 ring-primary/20 rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-primary text-2xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Edit className="w-6 h-6" />
            </div>
            Modifier mon profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="prenom" className="text-sm font-semibold">Prénom</Label>
                <Input
                  id="prenom"
                  className="h-11 bg-background/50 rounded-xl"
                  value={profileData.prenom}
                  onChange={e => setProfileData({ ...profileData, prenom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom" className="text-sm font-semibold">Nom</Label>
                <Input
                  id="nom"
                  className="h-11 bg-background/50 rounded-xl"
                  value={profileData.nom}
                  onChange={e => setProfileData({ ...profileData, nom: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                className="h-11 bg-background/50 rounded-xl"
                value={profileData.email}
                onChange={e => setProfileData({ ...profileData, email: e.target.value })}
              />
            </div>
            <div className="pt-6 flex flex-wrap gap-4 border-t border-primary/10 mt-6">
              <Button type="submit" className="h-11 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all grow md:grow-0">
                Enregistrer les infos
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowPasswordSection(!showPasswordSection)} 
                className="h-11 px-6 rounded-xl font-bold"
              >
                <KeyRound className="w-4 h-4 mr-2" /> 
                {showPasswordSection ? 'Annuler le changement' : 'Changer de mot de passe'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setIsEditingProfile(false)} className="h-11 px-6 rounded-xl ml-auto">Fermer</Button>
            </div>
          </form>

          <AnimatePresence>
            {showPasswordSection && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-8 pt-8 border-t border-primary/10 space-y-6">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <ShieldCheck className="w-5 h-5" />
                    Sécurité du compte
                  </div>
                  
                  {passwordStatus && (
                    <div className={cn(
                      "p-4 rounded-xl text-sm font-medium flex items-center gap-2",
                      passwordStatus.type === 'success' ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                    )}>
                      <AlertCircle className="w-4 h-4" />
                      {passwordStatus.message}
                    </div>
                  )}

                  <form onSubmit={onUpdatePassword} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="current">Mot de passe actuel</Label>
                        <Input
                          id="current"
                          type="password"
                          className="h-10 rounded-xl bg-background/50"
                          value={passwordData.currentPassword}
                          onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new">Nouveau mot de passe</Label>
                        <Input
                          id="new"
                          type="password"
                          className="h-10 rounded-xl bg-background/50"
                          value={passwordData.newPassword}
                          onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm">Confirmer</Label>
                        <Input
                          id="confirm"
                          type="password"
                          className="h-10 rounded-xl bg-background/50"
                          value={passwordData.confirmPassword}
                          onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="w-full md:w-auto px-10 h-11 rounded-xl bg-primary shadow-lg shadow-primary/20 font-bold"
                    >
                      {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                    </Button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-6 border-t border-destructive/10 flex justify-end">
            <Button type="button" variant="ghost" className="text-destructive hover:bg-destructive/10 h-11 px-4 rounded-xl" onClick={handleDeleteAccount}>
              <Trash2 className="w-4 h-4 mr-2" /> Supprimer mon compte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
