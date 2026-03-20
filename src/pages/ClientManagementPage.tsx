import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Search, Download, Filter, MoreHorizontal, UserPlus, FileSpreadsheet, Plus, Euro, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SellPackageModal } from '../components/SellPackageModal';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { LogLessonModal } from '../components/LogLessonModal';
import type { Client, Sale } from '../types';
import clsx from 'clsx';

export const ClientManagementPage: React.FC = () => {
    const { clients, sales, lessons, payments } = useStore();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isSellModalOpen, setIsSellModalOpen] = useState(false);
    const [selectedSaleForPayment, setSelectedSaleForPayment] = useState<Sale | null>(null);
    const [selectedSaleForLesson, setSelectedSaleForLesson] = useState<Sale | null>(null);

    const clientData = useMemo(() => {
        return clients.map(client => {
            const clientSales = sales.filter(s => s.clientId === client.id);
            const activeSale = clientSales.find(s => s.status === 'active') || clientSales[0];
            
            // Lessons calculation
            const allLessons = lessons.filter(l => clientSales.some(s => s.id === l.saleId) && l.type === 'lesson');
            const activeSaleLessons = activeSale ? lessons.filter(l => l.saleId === activeSale.id && l.type === 'lesson') : [];
            
            // Payment calculation
            const totalDue = clientSales.reduce((acc, s) => acc + s.totalPrice, 0);
            const totalPaid = payments.filter(p => clientSales.some(s => s.id === p.saleId))
                                     .reduce((acc, p) => acc + p.amount, 0);
            
            const [firstName, ...lastNameParts] = client.name.split(' ');
            const lastName = lastNameParts.join(' ') || '-';

            return {
                ...client,
                firstName,
                lastName,
                activeSale,
                lessonsSvolte: allLessons.length,
                lessonsPreviste: clientSales.reduce((acc, s) => acc + s.initialLessons, 0),
                activeSaleLessonsDone: activeSaleLessons.length,
                activeSaleLessonsTotal: activeSale?.initialLessons || 0,
                totalDue,
                totalPaid,
                paymentStatus: totalDue === 0 ? 'N/A' : (totalPaid >= totalDue ? 'Saldato' : (totalPaid > 0 ? 'Parziale' : 'Da pagare')),
                currentPackage: activeSale?.description || 'Nessuno'
            };
        });
    }, [clients, sales, lessons, payments]);

    const filteredClientData = clientData.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header section with Glassmorphism */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/40 backdrop-blur-md p-4 md:p-6 rounded-[2rem] border border-white/10 shadow-xl">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Gestione Clienti
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">Monitora progressi, pagamenti e pacchetti attivi</p>
                </div>
                <div className="flex w-full md:w-auto gap-3 mt-4 md:mt-0">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-5 py-3 md:py-2.5 rounded-2xl hover:opacity-90 transition-all font-semibold active:scale-95 border border-border/50 shadow-sm text-sm">
                        <Download size={18} />
                        Esporta
                    </button>
                    <Link to="/clients" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 md:py-2.5 rounded-2xl hover:opacity-90 transition-all font-semibold active:scale-95 shadow-lg shadow-primary/20 text-sm">
                        <UserPlus size={18} />
                        Nuovo
                    </Link>
                </div>
            </div>

            {/* Controls & Search */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Cerca per nome, cognome o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 md:py-4 bg-card/50 border border-border/50 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-inner backdrop-blur-sm text-sm md:text-base"
                    />
                </div>
                <button className="flex items-center justify-center gap-2 px-6 py-4 bg-card/50 border border-border/50 rounded-2xl hover:bg-accent hover:text-accent-foreground transition-all">
                    <Filter size={20} />
                    <span>Filtri</span>
                </button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative bg-card rounded-[2rem] border border-border/50 shadow-2xl overflow-hidden backdrop-blur-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-muted/30 border-b border-border/50">
                                    <th className="px-8 py-5 font-bold text-xs uppercase tracking-widest text-muted-foreground/80">Nome</th>
                                    <th className="px-8 py-5 font-bold text-xs uppercase tracking-widest text-muted-foreground/80">Cognome</th>
                                    <th className="px-8 py-5 font-bold text-xs uppercase tracking-widest text-muted-foreground/80">Lezioni Svolte</th>
                                    <th className="px-8 py-5 font-bold text-xs uppercase tracking-widest text-muted-foreground/80 text-center">Lezioni Previste</th>
                                    <th className="px-8 py-5 font-bold text-xs uppercase tracking-widest text-muted-foreground/80">Stato Pagamento</th>
                                    <th className="px-8 py-5 font-bold text-xs uppercase tracking-widest text-muted-foreground/80">Pacchetto Attivo</th>
                                    <th className="px-8 py-5 font-bold text-xs uppercase tracking-widest text-muted-foreground/80 text-center">Azioni</th>
                                    <th className="px-8 py-5 font-bold text-xs uppercase tracking-widest text-muted-foreground/80"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {filteredClientData.map((client) => {
                                    const canLogLesson = client.activeSale && (client.activeSaleLessonsDone < client.activeSaleLessonsTotal);
                                    const canPay = client.activeSale && (client.totalPaid < client.totalDue);

                                    return (
                                        <tr key={client.id} className="group/row hover:bg-primary/[0.03] transition-colors relative">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-primary font-bold shadow-inner">
                                                        {client.firstName[0]}
                                                    </div>
                                                    <Link to={`/clients/${client.id}`} className="font-bold hover:text-primary transition-colors">
                                                        {client.firstName}
                                                    </Link>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-foreground/80 font-medium">{client.lastName}</td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-2 group/lessons">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-black text-foreground">{client.lessonsSvolte}</span>
                                                            <span className="text-muted-foreground/60 text-xs">totali</span>
                                                        </div>
                                                        <button 
                                                            onClick={() => setSelectedSaleForLesson(client.activeSale || null)}
                                                            disabled={!canLogLesson}
                                                            className={clsx(
                                                                "p-1.5 rounded-lg transition-all border scale-90 opacity-0 group-hover/lessons:opacity-100 group-hover/lessons:scale-100 hover:scale-110",
                                                                canLogLesson 
                                                                    ? "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500 hover:text-white shadow-sm"
                                                                    : "hidden"
                                                            )}
                                                            title="Registra Lezione"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    <div className="w-full bg-secondary/50 h-1.5 rounded-full overflow-hidden">
                                                        <div 
                                                            className="bg-blue-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                                                            style={{ width: `${Math.min(100, (client.lessonsSvolte / (client.lessonsPreviste || 1)) * 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 font-black border border-orange-500/20">
                                                    {client.lessonsPreviste}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                {client.paymentStatus !== 'Saldato' && client.paymentStatus !== 'N/A' && (
                                                    <span className={clsx(
                                                        "inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-tight shadow-sm border",
                                                        client.paymentStatus === 'Parziale' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                                                        client.paymentStatus === 'Da pagare' ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                                                        "bg-muted text-muted-foreground border-border"
                                                    )}>
                                                        <div className={clsx(
                                                            "w-1.5 h-1.5 rounded-full mr-2",
                                                            client.paymentStatus === 'Parziale' ? "bg-amber-600" :
                                                            client.paymentStatus === 'Da pagare' ? "bg-rose-600" :
                                                            "bg-muted-foreground"
                                                        )} />
                                                        {client.paymentStatus}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <FileSpreadsheet className="text-primary/40" size={16} />
                                                    <span className="text-sm font-semibold text-muted-foreground italic group-hover/row:text-primary/80 transition-colors">
                                                        {client.currentPackage}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        onClick={() => setSelectedSaleForPayment(client.activeSale || null)}
                                                        disabled={!canPay}
                                                        className={clsx(
                                                            "p-2.5 rounded-xl transition-all shadow-sm border",
                                                            canPay 
                                                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                                                                : "bg-muted text-muted-foreground/30 border-border cursor-not-allowed"
                                                        )}
                                                        title="Registra Pagamento"
                                                    >
                                                        <Euro size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedClient(client);
                                                            setIsSellModalOpen(true);
                                                        }}
                                                        className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all shadow-sm"
                                                        title="Vendi Pacchetto"
                                                    >
                                                        <ShoppingBag size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="p-2 hover:bg-secondary rounded-xl transition-colors text-muted-foreground/50 hover:text-foreground">
                                                    <MoreHorizontal size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredClientData.map((client) => {
                    const canLogLesson = client.activeSale && (client.activeSaleLessonsDone < client.activeSaleLessonsTotal);
                    const canPay = client.activeSale && (client.totalPaid < client.totalDue);

                    return (
                        <div 
                            key={client.id}
                            onClick={() => navigate(`/clients/${client.id}`)}
                            className="bg-card p-5 rounded-3xl border border-border shadow-md active:scale-[0.98] transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                                        {client.firstName[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight">{client.name}</h3>
                                        {client.paymentStatus !== 'Saldato' && client.paymentStatus !== 'N/A' && (
                                            <span className={clsx(
                                                "inline-flex items-center mt-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border",
                                                client.paymentStatus === 'Parziale' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                                                "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                            )}>
                                                {client.paymentStatus}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setSelectedSaleForLesson(client.activeSale || null); }}
                                        disabled={!canLogLesson}
                                        className={clsx(
                                            "p-3 rounded-xl border transition-all shadow-sm",
                                            canLogLesson ? "bg-blue-500 text-white border-blue-600 shadow-blue-500/20" : "bg-muted text-muted-foreground/30 hidden"
                                        )}
                                    >
                                        <Plus size={18} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setSelectedSaleForPayment(client.activeSale || null); }}
                                        disabled={!canPay}
                                        className={clsx(
                                            "p-3 rounded-xl border transition-all shadow-sm",
                                            canPay ? "bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/20" : "bg-muted text-muted-foreground/30 hidden"
                                        )}
                                    >
                                        <Euro size={18} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setSelectedClient(client); setIsSellModalOpen(true); }}
                                        className="p-3 rounded-xl bg-secondary text-secondary-foreground border border-border shadow-sm"
                                    >
                                        <ShoppingBag size={18} />
                                    </button>
                                </div>
                            </div>

                            {client.activeSale && (
                                <div className="space-y-3 bg-muted/30 p-4 rounded-2xl border border-border/50">
                                    <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                        <span>Pacchetto Attivo</span>
                                        <span className="text-primary">{client.lessonsSvolte} / {client.lessonsPreviste} lezioni</span>
                                    </div>
                                    <h4 className="font-bold text-sm truncate">{client.currentPackage}</h4>
                                    <div className="w-full bg-secondary/50 h-2 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-primary h-full rounded-full transition-all duration-1000" 
                                            style={{ width: `${Math.min(100, (client.lessonsSvolte / (client.lessonsPreviste || 1)) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                {filteredClientData.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                            <Search className="text-muted-foreground/40" size={32} />
                        </div>
                        <h3 className="text-xl font-bold">Nessun cliente trovato</h3>
                    </div>
                )}
            </div>

            {/* Modals */}
            {selectedClient && (
                <SellPackageModal
                    isOpen={isSellModalOpen}
                    onClose={() => {
                        setIsSellModalOpen(false);
                        setSelectedClient(null);
                    }}
                    client={selectedClient}
                />
            )}

            {selectedSaleForPayment && (
                <RecordPaymentModal
                    isOpen={!!selectedSaleForPayment}
                    onClose={() => setSelectedSaleForPayment(null)}
                    sale={selectedSaleForPayment}
                />
            )}

            {selectedSaleForLesson && (
                <LogLessonModal
                    isOpen={!!selectedSaleForLesson}
                    onClose={() => setSelectedSaleForLesson(null)}
                    sale={selectedSaleForLesson}
                />
            )}
        </div>
    );
};
