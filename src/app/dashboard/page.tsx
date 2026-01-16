'use client';

import { useState, useEffect } from 'react';
import { useAuthStore, useTrajetsStore, useMotosStore, useReservationsStore, useNotificationsStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  UserIcon,
  Bike,
  History as HistoryIcon,
  LogOut,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Settings,
  MapPin,
  Bell,
  Plus,
  Edit
} from 'lucide-react';
import { HistoriquePassager } from '@/components/dashboard/HistoriquePassager';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


export default function DashboardPage() {
  const { user, logout, updateUser, deleteAccount } = useAuthStore();
  const { getTrajetsByDriver } = useTrajetsStore();
  const { getMotosByDriver } = useMotosStore();
  const { notifications, markAsRead, markAllAsRead } = useNotificationsStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
  });

  // Pour le conducteur
  const rides = mounted && user?.id ? getTrajetsByDriver(user.id) : [];
  const motos = mounted && user?.id ? getMotosByDriver(user.id) : [];

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(profileData);
    setIsEditingProfile(false);
  };

  const handleDeleteAccount = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      deleteAccount(user.id);
      logout();
      router.push('/');
    }
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      conducteur: 'Conducteur',
      passager: 'Passager',
      administrateur: 'Admin',
    };
    return roles[role] || role;
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-10 max-w-6xl">
      {/* Header Minimaliste */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground font-medium">
            Bonjour <span className="text-foreground font-bold">{user.prenom}</span>, ravi de vous revoir sur Miyi Ðekae.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsEditingProfile(!isEditingProfile)} className="rounded-xl font-bold">
            <Settings className="w-4 h-4 mr-2" /> Profil
          </Button>
          <Button variant="ghost" onClick={logout} className="rounded-xl text-destructive hover:bg-destructive/10 font-bold">
            <LogOut className="w-4 h-4 mr-2" /> Déconnexion
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Colonne de Gauche : Résumé & Activité */}
        <div className="lg:col-span-2 space-y-10">
          {/* Quick Stats Minimalistes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="border shadow-sm rounded-2xl bg-card/30 backdrop-blur-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black">{rides.length}</div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Trajets publiés</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm rounded-2xl bg-card/30 backdrop-blur-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black">4.9</div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Note globale</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {isEditingProfile && (
            <Card className="border-0 shadow-2xl bg-primary/5 backdrop-blur-md ring-1 ring-primary/20 animate-in fade-in zoom-in-95 duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-primary text-2xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Edit className="w-6 h-6" />
                  </div>
                  Modifier mon profil
                </CardTitle>
                <CardDescription className="pl-11">Mettez à jour vos informations personnelles pour rester connecté.</CardDescription>
              </CardHeader>
              <CardContent className="pl-11 pr-6 pb-8">
                <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="prenom" className="text-sm font-semibold">Prénom</Label>
                      <Input
                        id="prenom"
                        className="h-11 bg-background/50"
                        value={profileData.prenom}
                        onChange={e => setProfileData({ ...profileData, prenom: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nom" className="text-sm font-semibold">Nom</Label>
                      <Input
                        id="nom"
                        className="h-11 bg-background/50"
                        value={profileData.nom}
                        onChange={e => setProfileData({ ...profileData, nom: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">Email Universitaire</Label>
                    <Input
                      id="email"
                      type="email"
                      className="h-11 bg-background/50"
                      value={profileData.email}
                      onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                    />
                  </div>
                  <div className="pt-6 flex flex-wrap gap-4 border-t border-primary/10 mt-6">
                    <Button type="submit" className="h-11 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">Enregistrer les modifications</Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditingProfile(false)} className="h-11 px-6 rounded-xl">Annuler</Button>
                    <div className="flex-grow"></div>
                    <Button type="button" variant="ghost" className="text-destructive hover:bg-destructive/10 h-11 px-4 rounded-xl transition-all" onClick={handleDeleteAccount}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer le compte
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-8">
            {/* Liste d'activité récente minimaliste */}
            <Card className="border shadow-sm bg-card/30 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardHeader className="p-6 border-b border-border/50">
                <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                  <HistoryIcon className="w-5 h-5 text-primary" />
                  Dernière activité
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/30">
                  {rides.slice(0, 3).map((r, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-primary/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-muted/40 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-bold tracking-tight">{r.pointDepart} → {r.destination}</p>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{new Date(r.dateHeure).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold border-primary/20 text-primary">CONDUCTEUR</Badge>
                    </div>
                  ))}
                  {rides.length === 0 && (
                    <div className="p-10 text-center">
                      <p className="text-sm text-muted-foreground italic">Aucun trajet récent à afficher.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Colonne de Droite : Profil & Notifications Simplifiées */}
        <div className="space-y-8">
          <Card className="border shadow-sm bg-card/30 backdrop-blur-sm rounded-2xl overflow-hidden text-center p-8">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-black">
                  {mounted ? user.prenom[0] : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-xl font-black tracking-tight">{mounted ? `${user.prenom} ${user.nom}` : 'Profil'}</h2>
                <Badge variant="secondary" className="font-bold text-[10px] tracking-widest uppercase">
                  {mounted ? getRoleLabel(user.role) : '...'}
                </Badge>
              </div>
            </div>
          </Card>
          <Card className="border shadow-sm bg-card/30 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardHeader className="p-6 border-b border-border/50">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <div className="text-center py-10 px-6">
                  <p className="text-xs font-bold text-muted-foreground/50 italic">Aucune notification</p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {notifications.slice(0, 3).map(notif => (
                    <div
                      key={notif.id}
                      className={cn(
                        "p-4 transition-all cursor-pointer hover:bg-primary/5",
                        !notif.lu ? 'bg-primary/5 border-l-2 border-l-primary' : 'bg-transparent'
                      )}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-bold text-xs tracking-tight">{notif.titre}</div>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground leading-relaxed line-clamp-1">
                        {notif.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="p-2 border-t">
              <Button variant="ghost" className="w-full h-8 text-[10px] font-bold uppercase tracking-widest">
                Tout voir
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Section Rôle (Bas du dashboard) */}
      <div className="space-y-8 pt-4">
        {!mounted ? (
          <div className="h-20 flex items-center justify-center">
            <p className="text-muted-foreground animate-pulse font-bold tracking-widest uppercase text-xs">Synchronisation des données...</p>
          </div>
        ) : user.role === 'conducteur' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rides.length === 0 ? (
                <Card className="md:col-span-2 border-dashed border-2 bg-muted/10 rounded-2xl">
                  <CardContent className="py-12 text-center">
                    <h3 className="text-lg font-bold mb-2">Aucun trajet publié</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto text-sm">Commencez à partager vos trajets Moto pour aider d'autres étudiants.</p>
                    <Button variant="default" className="rounded-xl px-8" onClick={() => router.push('/trajets')}>Publier mon premier trajet</Button>
                  </CardContent>
                </Card>
              ) : (
                rides.map(r => (
                  <Card key={r.id} className="overflow-hidden border shadow-sm bg-card/50 hover:border-primary/50 transition-all rounded-2xl group">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-center mb-2">
                        <Badge variant={r.statut === 'ouvert' ? 'default' : 'secondary'} className="rounded-full px-3 py-0.5 font-bold uppercase text-[10px]">
                          {r.statut === 'ouvert' ? 'Actif' : 'Terminé'}
                        </Badge>
                        <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 uppercase">
                          <Calendar className="w-3 h-3" />
                          {new Date(r.dateHeure).toLocaleDateString()}
                        </span>
                      </div>
                      <CardTitle className="text-lg font-black tracking-tight">
                        {r.pointDepart} → {r.destination}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>{r.placesDisponibles} places restantes</span>
                      </div>
                    </CardContent>
                    <CardFooter className="py-4 flex gap-2 border-t mt-4">
                      <Button variant="ghost" size="sm" className="flex-1 h-9 rounded-lg font-bold text-xs uppercase">Gérer</Button>
                      <Button variant="ghost" size="sm" className="h-9 w-9 rounded-lg text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>

            <div className="pt-10">
              <h2 className="text-xl font-black tracking-tight flex items-center gap-3 mb-6 uppercase">
                <Bike className="w-5 h-5 text-primary" />
                Mon Garage
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {motos.map(m => (
                  <Card key={m.id} className="border shadow-sm bg-card/50 rounded-2xl group hover:border-primary/50 transition-all">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Bike className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-bold text-sm">{m.marque} {m.modele}</div>
                        <div className="text-[10px] font-black text-muted-foreground uppercase">{m.immatriculation}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Card className="border-2 border-dashed border-border/50 bg-primary/5 hover:bg-primary/10 hover:border-primary transition-all cursor-pointer flex items-center justify-center p-6 rounded-2xl group" onClick={() => router.push('/garage')}>
                  <div className="flex flex-col items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Ajouter</span>
                  </div>
                </Card>
              </div>
            </div>
          </>
        ) : user.role === 'passager' ? (
          <div className="space-y-6">
            <h2 className="text-xl font-black tracking-tight flex items-center gap-3 uppercase">
              <HistoryIcon className="w-5 h-5 text-primary" />
              Mes Réservations
            </h2>
            <div className="bg-card/30 backdrop-blur-xl rounded-2xl border shadow-sm p-4">
              <HistoriquePassager />
            </div>
          </div>
        ) : (
          <div className="bg-card/20 backdrop-blur-xl rounded-3xl p-16 text-center border shadow-sm">
            <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-primary/40" />
            </div>
            <h2 className="text-2xl font-black mb-2 tracking-tight">Compte en attente</h2>
            <p className="text-muted-foreground max-w-md mx-auto text-sm font-medium">
              L'audit de votre profil <span className="text-primary font-bold">{(user.role)}</span> est en cours.
            </p>
            <Button variant="outline" className="mt-8 rounded-xl px-10 h-11 font-bold" onClick={logout}>
              Déconnexion
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
