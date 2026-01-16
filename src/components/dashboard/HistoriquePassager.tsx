'use client';

import { useState, useEffect } from 'react';
import { useReservationsStore, useTrajetsStore, useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Calendar, User, Bike, XCircle } from 'lucide-react';

export function HistoriquePassager() {
  const { user } = useAuthStore();
  const { reservations, updateReservationStatus } = useReservationsStore();
  const { trajets } = useTrajetsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) return null;

  const handleCancel = (id: string) => {
    if (confirm('Voulez-vous vraiment annuler cette réservation ?')) {
      updateReservationStatus(id, 'annulé');
    }
  };

  const userReservations = reservations
    .filter((r) => r.etudiantId === user.id)
    .map((r) => {
      const trajet = trajets.find((t) => t.id === r.trajetId);
      return { ...r, trajet };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmé': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'en_attente': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'refusé': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'annulé': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      case 'terminé': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Mon Historique</h2>
        <Badge variant="outline" className="px-3 py-1">
          {userReservations.length} Réservations
        </Badge>
      </div>

      {userReservations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Aucun trajet trouvé</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Vous n'avez pas encore effectué de réservation.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-1">
          {userReservations.map((res) => (
            <Card key={res.id} className="overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-wider">
                        <Calendar className="h-3.5 w-3.5" />
                        {res.trajet ? new Date(res.trajet.dateHeure).toLocaleDateString() : 'Date inconnue'}
                      </div>
                      <Badge className={getStatusColor(res.status)}>
                        {res.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">RÉSERVÉ LE</span>
                        <span className="text-xs font-semibold">{new Date(res.createdAt).toLocaleDateString()}</span>
                      </div>
                      {res.status === 'en_attente' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleCancel(res.id)}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Annuler
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        <div>
                          <p className="text-[10px] uppercase text-muted-foreground font-semibold">Départ</p>
                          <p className="text-sm font-medium">{res.trajet?.pointDepart || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-destructive shrink-0" />
                        <div>
                          <p className="text-[10px] uppercase text-muted-foreground font-semibold">Destination</p>
                          <p className="text-sm font-medium">{res.trajet?.destination || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-muted p-2 rounded-md">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-muted-foreground font-semibold">Conducteur</p>
                          <p className="text-sm font-medium">
                            {res.trajet?.conducteur.prenom} {res.trajet?.conducteur.nom}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-muted p-2 rounded-md">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-muted-foreground font-semibold">Heure</p>
                          <p className="text-sm font-medium">
                            {res.trajet ? new Date(res.trajet.dateHeure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
