'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  ClipboardCheck, 
  Search, 
  CheckCircle, 
  XCircle, 
  Eye, 
  User, 
  FileText,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

interface OnboardingRequest {
    id: string;
    userId: string;
    permisNumero: string;
    permisImage: string | null;
    motoMarque: string;
    motoModele: string;
    motoImmatriculation: string;
    statut: 'en_attente' | 'approuvé' | 'rejeté';
    commentaireAdmin: string | null;
    createdAt: string;
    user?: {
        nom: string;
        prenom: string;
        email: string;
    };
}

export default function DriversValidationPage() {
    const [requests, setRequests] = useState<OnboardingRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<OnboardingRequest | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [comment, setComment] = useState('');

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/driver-applications');
            const result = await res.json();
            if (result.success) {
                setRequests(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch requests', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (id: string, statut: 'approuvé' | 'rejeté') => {
        try {
            setIsProcessing(true);
            const res = await fetch(`/api/admin/driver-applications/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ statut, commentaireAdmin: comment }),
            });
            const result = await res.json();

            if (result.success) {
                toast.success(`Demande ${statut}`, {
                    description: `Le dossier a été traité avec succès.`,
                });
                setSelectedRequest(null);
                setComment('');
                fetchRequests();
            } else {
                toast.error("Erreur", {
                    description: result.error?.message || "Une erreur est survenue",
                });
            }
        } catch {
            toast.error("Erreur", {
                description: "Impossible de contacter le serveur",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case 'en_attente':
                return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">En attente</Badge>;
            case 'approuvé':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approuvé</Badge>;
            case 'rejeté':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejeté</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <ClipboardCheck className="w-8 h-8 text-primary" />
                        Validation Motards
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gérez les demandes d&apos;onboarding et vérifiez les documents.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Rechercher un motard..." 
                            className="bg-card/50 pl-10 w-64"
                        />
                    </div>
                    <Button onClick={fetchRequests} variant="outline" size="icon">
                        <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Files d&apos;attente des dossiers</CardTitle>
                    <CardDescription>
                        {requests.length} demande(s) trouvée(s) au total.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="font-medium">Chargement des dossiers...</p>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground border-2 border-dashed rounded-2xl">
                            <CheckCircle className="w-12 h-12 opacity-20" />
                            <p className="text-lg font-medium">Aucun dossier en attente</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-border/50">
                                    <tr className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                        <th className="px-4 py-4">Utilisateur</th>
                                        <th className="px-4 py-4">Véhicule</th>
                                        <th className="px-4 py-4">Date</th>
                                        <th className="px-4 py-4">Statut</th>
                                        <th className="px-4 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    <AnimatePresence>
                                        {requests.map((req, idx) => (
                                            <motion.tr 
                                                key={req.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="group hover:bg-muted/50 transition-colors"
                                            >
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                                                            {req.user?.prenom[0]}{req.user?.nom[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm">{req.user?.prenom} {req.user?.nom}</p>
                                                            <p className="text-xs text-muted-foreground">{req.user?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <p className="text-sm font-medium">{req.motoMarque} {req.motoModele}</p>
                                                    <p className="text-xs text-muted-foreground uppercase">{req.motoImmatriculation}</p>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-muted-foreground">
                                                    {new Date(req.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <StatusBadge status={req.statut} />
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="font-bold gap-2 text-xs"
                                                        onClick={() => setSelectedRequest(req)}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Examiner
                                                    </Button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal d'examen du dossier */}
            <Dialog open={!!selectedRequest} onOpenChange={(open: boolean) => !open && setSelectedRequest(null)}>
                <DialogContent className="sm:max-w-150 p-0 overflow-hidden border-0 shadow-2xl">
                    <DialogHeader className="p-6 bg-primary text-primary-foreground">
                        <DialogTitle className="text-2xl font-black">Examen du dossier</DialogTitle>
                        <DialogDescription className="text-primary-foreground/80 font-medium">
                            Vérifiez l&apos;identité et les documents avant validation.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        <section className="space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <User className="w-4 h-4" /> Information Utilisateur
                            </h4>
                            <div className="p-4 rounded-xl bg-muted/50 border border-border flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                    {selectedRequest?.user?.prenom[0]}{selectedRequest?.user?.nom[0]}
                                </div>
                                <div>
                                    <p className="font-black text-lg">{selectedRequest?.user?.prenom} {selectedRequest?.user?.nom}</p>
                                    <p className="text-sm text-muted-foreground">{selectedRequest?.user?.email}</p>
                                </div>
                            </div>
                        </section>

                        <div className="grid grid-cols-2 gap-6">
                            <section className="space-y-3">
                                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Permis de conduire
                                </h4>
                                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                                    <p className="text-xs font-bold text-muted-foreground uppercase">Numéro</p>
                                    <p className="font-bold text-lg tabular-nums mt-1">{selectedRequest?.permisNumero}</p>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Loader2 className="w-4 h-4" /> Moto
                                </h4>
                                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                                    <p className="text-xs font-bold text-muted-foreground uppercase">Modèle & Plaque</p>
                                    <p className="font-bold text-lg mt-1">{selectedRequest?.motoMarque} {selectedRequest?.motoModele}</p>
                                    <Badge variant="secondary" className="mt-1 font-black">{selectedRequest?.motoImmatriculation}</Badge>
                                </div>
                            </section>
                        </div>

                        <section className="space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Commentaires Admin (Optionnel)</h4>
                            <textarea 
                                className="w-full h-24 p-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary"
                                placeholder="Indiquez la raison du rejet ou un message d'encouragement..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </section>
                    </div>

                    <DialogFooter className="p-6 bg-muted/30 border-t flex flex-row justify-between sm:justify-between items-center">
                        <Button 
                            variant="destructive" 
                            className="font-bold gap-2 px-6"
                            onClick={() => handleAction(selectedRequest!.id, 'rejeté')}
                            disabled={isProcessing}
                        >
                            <XCircle className="w-4 h-4" />
                            Rejeter
                        </Button>
                        <Button 
                            className="font-bold gap-2 bg-green-600 hover:bg-green-700 px-6"
                            onClick={() => handleAction(selectedRequest!.id, 'approuvé')}
                            disabled={isProcessing}
                        >
                            <CheckCircle className="w-4 h-4" />
                            Approuver
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
