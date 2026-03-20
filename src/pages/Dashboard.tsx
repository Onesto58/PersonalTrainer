import React from 'react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import { Users, Euro, Calendar, ArrowRight } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const { clients, payments, lessons } = useStore();

    // Metrics
    const activeClients = clients.filter(c => c.status === 'active').length;

    const today = new Date().toISOString().split('T')[0];
    const lessonsToday = lessons.filter(l => l.date.startsWith(today)).length;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const incomeMonth = payments
        .filter(p => {
            const d = new Date(p.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((acc, p) => acc + p.amount, 0);

    // Recent Clients
    const recentClients = [...clients]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                            <Calendar size={28} />
                        </div>
                        <div>
                            <h3 className="text-muted-foreground text-sm font-medium">Lezioni Oggi</h3>
                            <p className="text-3xl font-bold mt-1">{lessonsToday}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg">
                            <Users size={28} />
                        </div>
                        <div>
                            <h3 className="text-muted-foreground text-sm font-medium">Clienti Attivi</h3>
                            <p className="text-3xl font-bold mt-1">{activeClients}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 rounded-lg">
                            <Euro size={28} />
                        </div>
                        <div>
                            <h3 className="text-muted-foreground text-sm font-medium">Incasso Mese</h3>
                            <p className="text-3xl font-bold mt-1">€ {incomeMonth.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Clients / Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Ultimi Clienti Iscritti</h3>
                        <Link to="/clients" className="text-blue-600 text-sm hover:underline">Vedi tutti</Link>
                    </div>
                    <div className="space-y-3">
                        {recentClients.length === 0 ? (
                            <p className="text-muted-foreground text-sm">Nessun cliente recente.</p>
                        ) : (
                            recentClients.map(client => (
                                <Link
                                    key={client.id}
                                    to={`/clients/${client.id}`}
                                    className="flex items-center justify-between p-3 hover:bg-accent rounded-lg transition group"
                                >
                                    <div>
                                        <p className="font-medium group-hover:text-blue-600 transition">{client.name}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(client.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <ArrowRight size={16} className="text-muted-foreground group-hover:text-blue-600 transition" />
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg flex flex-col justify-center items-start">
                    <h3 className="font-bold text-2xl mb-2">Accesso Rapido</h3>
                    <p className="text-blue-100 mb-6">Gestisci la tua attività velocemente.</p>

                    <div className="flex flex-wrap gap-3">
                        <Link to="/clients" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition backdrop-blur-sm">
                            + Nuovo Cliente
                        </Link>
                        <Link to="/packages" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition backdrop-blur-sm">
                            Configura Pacchetti
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
