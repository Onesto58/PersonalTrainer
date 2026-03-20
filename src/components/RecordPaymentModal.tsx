import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import type { Sale, Payment } from '../types';
import { X, Euro, Calendar, Trash2 } from 'lucide-react';

interface RecordPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    sale: Sale;
    payment?: Payment; // Optional for editing
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({ isOpen, onClose, sale, payment }) => {
    const { addPayment, updatePayment, deletePayment } = useStore();

    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [method, setMethod] = useState('Contanti');
    const [notes, setNotes] = useState('');

    React.useEffect(() => {
        if (payment) {
            setAmount(payment.amount.toString());
            setDate(new Date(payment.date).toISOString().split('T')[0]);
            setMethod(payment.method);
            setNotes(payment.notes || '');
        } else {
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
            setMethod('Contanti');
            setNotes('');
        }
    }, [payment, isOpen]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || isSubmitting) return;

        setIsSubmitting(true);
        try {
            if (payment) {
                await updatePayment(payment.id, {
                    amount: Number(amount),
                    date: new Date(date).toISOString(),
                    method,
                    notes,
                });
            } else {
                await addPayment({
                    saleId: sale.id,
                    amount: Number(amount),
                    date: new Date(date).toISOString(),
                    method,
                    notes,
                });
            }

            onClose();
            resetForm();
        } catch (error) {
            console.error('Error saving payment:', error);
            alert('Errore durante il salvataggio. Riprova.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (payment && window.confirm('Sei sicuro di voler eliminare questo pagamento?') && !isSubmitting) {
            setIsSubmitting(true);
            try {
                await deletePayment(payment.id);
                onClose();
            } catch (error) {
                console.error('Error deleting payment:', error);
                alert('Errore durante l\'eliminazione. Riprova.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const resetForm = () => {
        setAmount('');
        setNotes('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-xl w-full max-w-sm p-6 shadow-xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold mb-1">{payment ? 'Modifica Pagamento' : 'Registra Pagamento'}</h2>
                <p className="text-sm text-muted-foreground mb-6">Per: {sale.description}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Importo (€)</label>
                        <div className="relative">
                            <Euro size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-background font-bold"
                                placeholder="0.00"
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Data</label>
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-background"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Metodo</label>
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-background"
                        >
                            <option value="Contanti">Contanti</option>
                            <option value="Bonifico">Bonifico</option>
                            <option value="PayPal/Satispay">PayPal / Satispay</option>
                            <option value="Altro">Altro</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Note (Opzionale)</label>
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-transparent"
                        />
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-2">
                        {payment ? (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isSubmitting}
                                className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition disabled:opacity-50"
                                title="Elimina pagamento"
                            >
                                {isSubmitting ? <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-600 rounded-full animate-spin" /> : <Trash2 size={18} />}
                                <span className="text-sm font-medium">Elimina</span>
                            </button>
                        ) : <div />}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-muted-foreground hover:bg-accent rounded-lg"
                            >
                                Annulla
                            </button>
                             <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                {payment ? 'Aggiorna' : 'Salva Pagamento'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
