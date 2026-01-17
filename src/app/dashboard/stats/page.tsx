'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ArrowRightLeft, 
  Calendar,
  ShieldAlert,
  Loader2,
  RefreshCcw,
  Zap,
  MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    ResponsiveContainer, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    Tooltip, 
    CartesianGrid,
    PieChart,
    Pie,
    Cell
} from 'recharts';

interface StatsData {
    users: { role: string; count: number }[];
    onboarding: { pending: number };
    trajetsToday: { statut: string; count: number }[];
    reservations: { total: number };
    reports: { pending: number };
}

export default function StatisticsPage() {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/stats');
            const result = await res.json();
            if (result.success) {
                setStats(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const userRolesData = stats?.users.map(u => ({
        name: u.role === 'passager' ? 'Passagers' : u.role === 'conducteur' ? 'Conducteurs' : 'Admins',
        value: u.count
    })) || [];

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    const kpis = [
        { 
            title: "Taux de croissance", 
            value: "+24%", 
            sub: "Inscriptions mensuelles", 
            icon: TrendingUp, 
            color: "text-green-500" 
        },
        { 
            title: "Zones actives", 
            value: "8", 
            sub: "Points d'arrêt campus", 
            icon: MapPin, 
            color: "text-blue-500" 
        },
        { 
            title: "Alertes sécurité", 
            value: stats?.reports.pending.toString() || "0", 
            sub: "Litiges non résolus", 
            icon: ShieldAlert, 
            color: stats?.reports.pending && stats.reports.pending > 0 ? "text-red-500" : "text-muted-foreground" 
        }
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="font-bold text-lg animate-pulse">Calcul des statistiques stratégiques...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-primary" />
                        Analyses & Performances
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Vue d&apos;ensemble de l&apos;activité du campus de Lomé.
                    </p>
                </div>
                <Button 
                    variant="outline" 
                    className="font-bold gap-2 bg-card border-2" 
                    onClick={fetchStats}
                >
                    <RefreshCcw className="w-4 h-4" />
                    Actualiser
                </Button>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kpis.map((kpi, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="border-0 shadow-sm bg-primary text-primary-foreground overflow-hidden">
                            <CardContent className="p-6 relative">
                                <kpi.icon className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 rotate-12" />
                                <p className="text-xs font-black uppercase tracking-widest opacity-80">{kpi.title}</p>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <h3 className="text-4xl font-black">{kpi.value}</h3>
                                    <Badge variant="secondary" className="bg-white/20 text-white border-0">{kpi.sub}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Distribution des utilisateurs */}
                <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black">Population Universitaire</CardTitle>
                                <CardDescription>Répartition par rôle</CardDescription>
                            </div>
                            <Users className="w-5 h-5 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent className="h-75">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={userRolesData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {userRolesData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-6 mt-4">
                            {userRolesData.map((entry, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-xs font-bold">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Trajets du jour */}
                <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black">Activité Quotidienne</CardTitle>
                                <CardDescription>Flux de trajets du 17 Janvier 2026</CardDescription>
                            </div>
                            <Zap className="w-5 h-5 text-amber-500" />
                        </div>
                    </CardHeader>
                    <CardContent className="h-75">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.trajetsToday || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis 
                                    dataKey="statut" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fontWeight: 600 }}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recap Bottom Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-card/30 border-dashed">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-muted-foreground">Demandes Conducteurs</p>
                            <p className="text-lg font-bold">{stats?.onboarding.pending} en attente</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/30 border-dashed">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-green-500/10 text-green-600">
                            <ArrowRightLeft className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-muted-foreground">Réservations Totales</p>
                            <p className="text-lg font-bold">{stats?.reservations.total}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
