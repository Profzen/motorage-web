'use client';

import { useState, useEffect } from 'react';
import { useAuthStore, useReservationsStore, useTrajetsStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Calendar, User, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DemandesPage() {
    const { user } = useAuthStore();
    const { reservations, updateReservationStatus } = useReservationsStore();
    const { trajets, updateTrajet } = useTrajetsStore();
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

    // Get reservations for the driver's trips
    const driverTrajets = trajets.filter(t => t.conducteurId === user.id);
    const driverTrajetIds = driverTrajets.map(t => t.id);
    const pendingRequests = reservations
        .filter(r => driverTrajetIds.includes(r.trajetId) && r.statut === 'en_attente')
        .map(r => {
            const trajet = trajets.find(t => t.id === r.trajetId);
            return { ...r, trajet };
        });

    const handleAccept = (reservationId: string, trajetId: string) => {
        updateReservationStatus(reservationId, 'confirmé');
        const trajet = trajets.find(t => t.id === trajetId);
        if (trajet && trajet.placesDisponibles > 0) {
            updateTrajet(trajetId, { placesDisponibles: trajet.placesDisponibles - 1 });
        }
    };

    const handleReject = (reservationId: string) => {
        updateReservationStatus(reservationId, 'refusé');
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="space-y-1 mb-8">
                <h1 className="text-3xl font-black tracking-tight">Demandes de réservation</h1>
                <p className="text-muted-foreground">
                    Gérez les demandes de passagers pour vos trajets.
                </p>
            </div>

            {pendingRequests.length === 0 ? (
                <Card className="border-dashed border-2">
                    <CardContent className="py-16 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Aucune demande en attente</h3>
                        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                            Vous n'avez pas de nouvelles demandes de réservation pour vos trajets.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {pendingRequests.map(req => (
                        <Card key={req.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                        En attente
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        Reçue le {new Date(req.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold">Passager #{req.etudiantId.slice(0, 8)}</p>
                                        <p className="text-sm text-muted-foreground">Demande une place</p>
                                    </div>
                                </div>

                                <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <span className="font-medium">{req.trajet?.pointDepart} → {req.trajet?.destination}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {req.trajet ? new Date(req.trajet.dateHeure).toLocaleDateString() : 'N/A'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {req.trajet ? new Date(req.trajet.dateHeure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        className="flex-1 rounded-xl font-bold"
                                        onClick={() => handleAccept(req.id, req.trajetId)}
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Accepter
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 rounded-xl font-bold text-destructive hover:bg-destructive/10"
                                        onClick={() => handleReject(req.id)}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Refuser
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
