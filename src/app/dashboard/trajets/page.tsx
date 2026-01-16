'use client';

import { useState, useEffect } from 'react';
import { useAuthStore, useTrajetsStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, Users, Plus, Edit, Trash2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MesTrajetsPage() {
    const { user } = useAuthStore();
    const { trajets, deleteTrajet } = useTrajetsStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && (!user || user.role !== 'conducteur')) {
            router.push('/dashboard');
        }
    }, [user, mounted, router]);

    if (!mounted || !user || user.role !== 'conducteur') return null;

    const myTrajets = trajets.filter(t => t.conducteurId === user.id);
    const activeTrajets = myTrajets.filter(t => t.statut === 'ouvert');
    const pastTrajets = myTrajets.filter(t => t.statut !== 'ouvert');

    const handleDelete = (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce trajet ?')) {
            deleteTrajet(id);
        }
    };

    const getStatusBadge = (statut: string) => {
        switch (statut) {
            case 'ouvert':
                return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Actif</Badge>;
            case 'plein':
                return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Complet</Badge>;
            case 'terminé':
                return <Badge variant="secondary">Terminé</Badge>;
            case 'annulé':
                return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Annulé</Badge>;
            default:
                return <Badge variant="outline">{statut}</Badge>;
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight">Mes Trajets</h1>
                    <p className="text-muted-foreground">
                        Gérez vos trajets publiés et suivez les réservations.
                    </p>
                </div>
                <Button onClick={() => router.push('/trajets/nouveau')} className="rounded-xl font-bold shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4 mr-2" /> Nouveau trajet
                </Button>
            </div>

            {myTrajets.length === 0 ? (
                <Card className="border-dashed border-2">
                    <CardContent className="py-16 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Aucun trajet publié</h3>
                        <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                            Publiez votre premier trajet pour commencer à transporter des passagers.
                        </p>
                        <Button onClick={() => router.push('/trajets/nouveau')} className="rounded-xl">
                            <Plus className="w-4 h-4 mr-2" /> Publier un trajet
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-8">
                    {/* Trajets actifs */}
                    {activeTrajets.length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                Trajets actifs ({activeTrajets.length})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activeTrajets.map(trajet => (
                                    <Card key={trajet.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                {getStatusBadge(trajet.statut)}
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(trajet.dateHeure).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <CardTitle className="text-lg font-bold mt-2">
                                                {trajet.pointDepart} → {trajet.destination}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pb-3">
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {new Date(trajet.dateHeure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    {trajet.placesDisponibles} place(s)
                                                </span>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="pt-3 border-t flex gap-2">
                                            <Button variant="ghost" size="sm" className="flex-1 rounded-lg">
                                                <Edit className="w-4 h-4 mr-1" /> Modifier
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:bg-destructive/10 rounded-lg"
                                                onClick={() => handleDelete(trajet.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Trajets passés */}
                    {pastTrajets.length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold mb-4 text-muted-foreground">
                                Trajets passés ({pastTrajets.length})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pastTrajets.map(trajet => (
                                    <Card key={trajet.id} className="overflow-hidden opacity-60">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                {getStatusBadge(trajet.statut)}
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(trajet.dateHeure).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <CardTitle className="text-base font-medium mt-2">
                                                {trajet.pointDepart} → {trajet.destination}
                                            </CardTitle>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
