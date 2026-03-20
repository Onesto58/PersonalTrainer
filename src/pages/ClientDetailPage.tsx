import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { SellPackageModal } from '../components/SellPackageModal';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { LogLessonModal } from '../components/LogLessonModal';
import { ClientFormModal } from '../components/ClientFormModal';
import type { Sale, Lesson, Payment } from '../types';
import { ArrowLeft, ShoppingBag, User, Plus, Euro, ClipboardList, Pencil, Mail, Phone, Hash, Calendar, MapPin, Clock } from 'lucide-react';

export const ClientDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { clients, sales, payments, lessons } = useStore();

    const [isSellModalOpen, setIsSellModalOpen] = useState(false);
    const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
    const [selectedSaleForPayment, setSelectedSaleForPayment] = useState<Sale | null>(null);
    const [selectedSaleForLesson, setSelectedSaleForLesson] = useState<Sale | null>(null);
    const [selectedLessonForEdit, setSelectedLessonForEdit] = useState<Lesson | null>(null);
    const [selectedPaymentForEdit, setSelectedPaymentForEdit] = useState<Payment | null>(null);

    const client = clients.find((c: any) => c.id === Number(id));
    const clientSales = sales.filter((s: any) => s.clientId === Number(id));

    if (!client) {
        return <div className="p-8 text-center">Cliente non trovato</div>;
    }

    // Helper to calculate stats per sale
    const getSaleStats = (saleId: number, totalPrice: number, initialLessons: number) => {
        // Payment Stats
        const salePayments = payments.filter((p: Payment) => p.saleId === saleId);
        const totalPaid = salePayments.reduce((acc: number, p: Payment) => acc + p.amount, 0);
        const remainingToPay = totalPrice - totalPaid;
        const paymentProgress = Math.min((totalPaid / totalPrice) * 100, 100);

        // Lesson Stats
        const saleLessons = lessons.filter((l: Lesson) => l.saleId === saleId).sort((a: Lesson, b: Lesson) => new Date(b.date).getTime() - new Date(a.date).getTime());;
        const lessonsUsed = saleLessons.filter((l: Lesson) => l.type === 'lesson').length;
        const lessonsRemaining = initialLessons - lessonsUsed;
        const lessonProgress = Math.min((lessonsUsed / initialLessons) * 100, 100);

        return {
            totalPaid, remainingToPay, paymentProgress, salePayments,
            lessonsUsed, lessonsRemaining, lessonProgress, saleLessons
        };
    };

    return (
        <div className="space-y-6">
            <button
                onClick={() => navigate('/clients')}
                className="flex items-center text-muted-foreground hover:text-foreground transition"
            >
                <ArrowLeft size={20} className="mr-1" />
                Torna ai Clienti
            </button>

            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Client Info Card */}
                <div className="w-full md:w-1/3 bg-card p-6 rounded-xl shadow-sm border border-border relative group">
                    <button
                        onClick={() => setIsEditClientModalOpen(true)}
                        className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Modifica Profilo"
                    >
                        <Pencil size={18} />
                    </button>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <User size={32} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{client.name}</h2>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${client.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {client.status === 'active' ? 'Attivo' : 'Inattivo'}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Mail size={16} className="shrink-0" />
                                <span className="truncate">{client.email || 'Email non inserita'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Phone size={16} className="shrink-0" />
                                <span>{client.phone || 'Telefono non inserito'}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border space-y-3">
                            <div className="flex flex-wrap gap-x-6 gap-y-3">
                                {client.gender && (
                                    <div className="flex items-center gap-2 text-sm text-foreground/70">
                                        <User size={14} className="text-primary" />
                                        <span>{client.gender === 'M' ? 'Uomo' : client.gender === 'F' ? 'Donna' : 'Altro'}</span>
                                    </div>
                                )}
                                {client.birthDate && (
                                    <div className="flex items-center gap-2 text-sm text-foreground/70">
                                        <Calendar size={14} className="text-primary" />
                                        <span> {new Date(client.birthDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {client.taxCode && (
                                    <div className="flex items-center gap-2 text-sm text-foreground/70">
                                        <Hash size={14} className="text-primary" />
                                        <span className="uppercase font-mono">{client.taxCode}</span>
                                    </div>
                                )}
                            </div>
                            {(client.address || client.city) && (
                                <div className="flex items-start gap-3 text-muted-foreground">
                                    <MapPin size={16} className="shrink-0 mt-0.5" />
                                    <span>
                                        {client.address}{client.address && client.city ? ', ' : ''}{client.city}
                                    </span>
                                </div>
                            )}
                        </div>

                        {client.notes && (
                            <div className="pt-4 border-t border-border">
                                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Note / Infortuni</p>
                                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{client.notes}</p>
                            </div>
                        )}

                        <div className="pt-4 border-t border-border text-[11px] text-muted-foreground flex justify-between">
                            <span>{client.gender === 'F' ? 'Iscritta il' : 'Iscritto il'}</span>
                            <span>{new Date(client.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Sales Area */}
                <div className="flex-1 w-full space-y-6">
                    <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <ShoppingBag size={20} />
                                Pacchetti Attivi & Storico
                            </h3>
                            <button
                                onClick={() => setIsSellModalOpen(true)}
                                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg"
                            >
                                <Plus size={16} />
                                Vendi Pacchetto
                            </button>
                        </div>

                        {clientSales.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                                Nessun pacchetto acquistato.
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {clientSales.map(sale => {
                                    const stats = getSaleStats(sale.id, sale.totalPrice, sale.initialLessons);

                                    return (
                                        <div key={sale.id} className="border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition bg-muted/30">
                                            {/* Header Sale */}
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-bold text-lg text-foreground flex items-center gap-2">
                                                        {sale.description}
                                                        {stats.lessonsRemaining <= 0 && <span className="text-xs bg-gray-200 text-gray-700 px-2 rounded-full">Completato</span>}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Acquistato il {new Date(sale.purchaseDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-xl text-foreground">€ {sale.totalPrice}</p>
                                                    <p className="text-xs text-muted-foreground">€ {sale.costPerLesson} / lezione</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                                {/* Lesson Progress */}
                                                <div className="bg-background p-3 rounded-lg border border-border">
                                                    <div className="flex justify-between text-sm mb-1 font-medium">
                                                        <span className="flex items-center gap-1 text-foreground">
                                                            <ClipboardList size={14} /> Lezioni
                                                        </span>
                                                        <span className={stats.lessonsRemaining <= 3 ? "text-orange-600" : "text-gray-600"}>
                                                            {stats.lessonsUsed} / {sale.initialLessons}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-secondary rounded-full h-2 mb-2">
                                                        <div
                                                            className={`h-2 rounded-full ${stats.lessonsRemaining <= 0 ? 'bg-gray-400' : 'bg-blue-500'}`}
                                                            style={{ width: `${stats.lessonProgress}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-muted-foreground">Rimaste: {stats.lessonsRemaining}</span>
                                                        {stats.lessonsRemaining > 0 && (
                                                            <button
                                                                onClick={() => setSelectedSaleForLesson(sale as Sale)}
                                                                className="text-blue-600 hover:underlin font-medium"
                                                            >
                                                                + Registra
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Payment Progress */}
                                                <div className="bg-background p-3 rounded-lg border border-border">
                                                    <div className="flex justify-between text-sm mb-1 font-medium">
                                                        <span className="flex items-center gap-1 text-foreground">
                                                            <Euro size={14} /> Pagamenti
                                                        </span>
                                                        <span className={stats.remainingToPay > 0 ? "text-red-500" : "text-green-500"}>
                                                            {stats.totalPaid} / {sale.totalPrice} €
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-secondary rounded-full h-2 mb-2">
                                                        <div
                                                            className={`h-2 rounded-full ${stats.remainingToPay <= 0 ? 'bg-green-500' : 'bg-yellow-500'}`}
                                                            style={{ width: `${stats.paymentProgress}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-muted-foreground">Da saldare: € {stats.remainingToPay.toFixed(2)}</span>
                                                        {stats.remainingToPay > 0 && (
                                                            <button
                                                                onClick={() => setSelectedSaleForPayment(sale)}
                                                                className="text-green-600 hover:underline font-medium"
                                                            >
                                                                + Paga
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* History Section */}
                                            <div className="mt-6 border-t border-border pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Lessons History */}
                                                <div>
                                                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-1">
                                                        <ClipboardList size={12} /> Storico Lezioni
                                                    </p>
                                                    {stats.saleLessons.length > 0 ? (
                                                        <ul className="space-y-2">
                                                            {stats.saleLessons.map((l: Lesson) => (
                                                                <li key={l.id} className={`text-sm p-2 rounded border flex justify-between items-start group ${l.type === 'check' ? 'bg-amber-50/50 border-amber-200/50 italic opacity-80' : 'bg-background border-border'}`}>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                             <span className="font-medium text-foreground">{new Date(l.date).toLocaleDateString()}</span>
                                                                             {l.startTime && (
                                                                                 <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                                                                     <Clock size={10} />
                                                                                     {l.startTime} - {l.endTime}
                                                                                 </span>
                                                                             )}
                                                                            {l.type === 'check' && (
                                                                                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">Check</span>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground italic truncate" title={l.notes}>
                                                                            {l.notes || 'Nessuna nota'}
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => setSelectedLessonForEdit(l)}
                                                                        className="ml-2 p-1 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded opacity-0 group-hover:opacity-100 transition"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                                                    </button>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-xs text-muted-foreground italic">Nessuna lezione registrata.</p>
                                                    )}
                                                </div>

                                                {/* Payments History */}
                                                <div>
                                                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-1">
                                                        <Euro size={12} /> Storico Pagamenti
                                                    </p>
                                                    {stats.salePayments.length > 0 ? (
                                                        <ul className="space-y-2">
                                                            {stats.salePayments.sort((a: Payment, b: Payment) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((p: Payment) => (
                                                                <li key={p.id} className="text-sm bg-background p-2 rounded border border-border flex justify-between items-start group">
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex justify-between items-center mb-0.5">
                                                                            <span className="font-bold text-foreground">€ {p.amount.toFixed(2)}</span>
                                                                            <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">{p.method}</span>
                                                                        </div>
                                                                        <div className="text-[11px] text-muted-foreground">
                                                                            {new Date(p.date).toLocaleDateString()}
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => setSelectedPaymentForEdit(p)}
                                                                        className="ml-2 p-1 text-muted-foreground hover:text-green-600 hover:bg-green-50 rounded opacity-0 group-hover:opacity-100 transition"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                                                    </button>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-xs text-muted-foreground italic">Nessun pagamento registrato.</p>
                                                    )}
                                                </div>
                                            </div>

                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {client && (
                <SellPackageModal
                    isOpen={isSellModalOpen}
                    onClose={() => setIsSellModalOpen(false)}
                    client={client}
                />
            )}



            {(selectedSaleForLesson || selectedLessonForEdit) && (
                <LogLessonModal
                    isOpen={!!selectedSaleForLesson || !!selectedLessonForEdit}
                    onClose={() => {
                        setSelectedSaleForLesson(null);
                        setSelectedLessonForEdit(null);
                    }}
                    sale={selectedSaleForLesson || (clientSales.find((s: Sale) => s.id === selectedLessonForEdit?.saleId) as Sale)}
                    lesson={selectedLessonForEdit || undefined}
                />
            )}

            {(selectedSaleForPayment || selectedPaymentForEdit) && (
                <RecordPaymentModal
                    isOpen={!!selectedSaleForPayment || !!selectedPaymentForEdit}
                    onClose={() => {
                        setSelectedSaleForPayment(null);
                        setSelectedPaymentForEdit(null);
                    }}
                    sale={selectedSaleForPayment || (clientSales.find((s: Sale) => s.id === selectedPaymentForEdit?.saleId) as Sale)}
                    payment={selectedPaymentForEdit || undefined}
                />
            )}

            <ClientFormModal
                isOpen={isEditClientModalOpen}
                onClose={() => setIsEditClientModalOpen(false)}
                client={client}
            />
        </div>
    );
};
