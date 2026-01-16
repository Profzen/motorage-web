'use client';

import { useState, useEffect } from 'react';
import { useAuthStore, useReservationsStore, useTrajetsStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, User, XCircle, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ReservationsPage() {
    const { user } = useAuthStore();
    const { reservations, updateReservationStatus } = useReservationsStore();
    const { trajets } = useTrajetsStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && (!user || user.role !== 'passager')) {
            router.push('/dashboard');
        }
    }, [user, mounted, router]);

    if (!mounted || !user || user.role !== 'passager') return null;

    const userReservations = reservations
        .filter(r => r.etudiantId === user.id)
        .map(r => {
            const trajet = trajets.find(t => t.id === r.trajetId);
            return { ...r, trajet };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const activeReservations = userReservations.filter(r => ['en_attente', 'confirmé'].includes(r.statut));
    const pastReservations = userReservations.filter(r => !['en_attente', 'confirmé'].includes(r.statut));

    const handleCancel = (id: string) => {
        if (confirm('Voulez-vous vraiment annuler cette réservation ?')) {
            updateReservationStatus(id, 'annulé');
        }
    };

    const getStatusBadge = (statut: string) => {
        switch (statut) {
            case 'confirmé':
                return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Confirmé</Badge>;
            case 'en_attente':
                return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">En attente</Badge>;
            case 'refusé':
                return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Refusé</Badge>;
            case 'annulé':
                return <Badge variant="secondary">Annulé</Badge>;
            case 'terminé':
                return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Terminé</Badge>;
            default:
                return <Badge variant="outline">{statut}</Badge>;
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight">Mes Réservations</h1>
                    <p className="text-muted-foreground">
                        Suivez l'état de vos demandes de réservation.
                    </p>
                </div>
                <Button onClick={() => router.push('/trajets')} className="rounded-xl font-bold shadow-lg shadow-primary/20">
                    <MapPin className="w-4 h-4 mr-2" /> Trouver un trajet
                </Button>
            </div>

            {userReservations.length === 0 ? (
                <Card className="border-dashed border-2">
                    <CardContent className="py-16 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Aucune réservation</h3>
                        <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                            Vous n'avez pas encore réservé de trajet. Explorez les trajets disponibles !
                        </p>
                        <Button onClick={() => router.push('/trajets')} className="rounded-xl">
                            <MapPin className="w-4 h-4 mr-2" /> Explorer les trajets
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-8">
                    {/* Réservations actives */}
                    {activeReservations.length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold mb-4">
                                Réservations actives ({activeReservations.length})
                            </h2>
                            <div className="space-y-4">
                                {activeReservations.map(res => (
                                    <Card key={res.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                {getStatusBadge(res.statut)}
                                                <span className="text-xs text-muted-foreground">
                                                    Réservé le {new Date(res.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-5 h-5 text-primary" />
                                                <span className="font-bold">{res.trajet?.pointDepart} → {res.trajet?.destination}</span>
                                            </div>

                                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {res.trajet ? new Date(res.trajet.dateHeure).toLocaleDateString() : 'N/A'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {res.trajet ? new Date(res.trajet.dateHeure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    {res.trajet?.conducteur?.prenom} {res.trajet?.conducteur?.nom}
                                                </span>
                                            </div>

                                            {res.statut === 'en_attente' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-destructive hover:bg-destructive/10 rounded-lg"
                                                    onClick={() => handleCancel(res.id)}
                                                >
                                                    <XCircle className="w-4 h-4 mr-1" /> Annuler
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Réservations passées */}
                    {pastReservations.length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold mb-4 text-muted-foreground">
                                Historique ({pastReservations.length})
                            </h2>
                            <div className="space-y-3">
                                {pastReservations.map(res => (
                                    <Card key={res.id} className="overflow-hidden opacity-60">
                                        <CardContent className="py-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm">{res.trajet?.pointDepart} → {res.trajet?.destination}</span>
                                            </div>
                                            {getStatusBadge(res.statut)}
                                        </CardContent>
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
