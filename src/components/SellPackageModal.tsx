import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { Client } from '../types';
import { X, DollarSign } from 'lucide-react';

interface SellPackageModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client;
}

export const SellPackageModal: React.FC<SellPackageModalProps> = ({ isOpen, onClose, client }) => {
    const { packages, addSale } = useStore();

    const [selectedPackageId, setSelectedPackageId] = useState<number | ''>('');
    const [description, setDescription] = useState('');
    const [lessonCount, setLessonCount] = useState<number>(0);
    const [costPerLesson, setCostPerLesson] = useState<number>(0);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (selectedPackageId !== '') {
            const pkg = packages.find(p => p.id === selectedPackageId);
            if (pkg) {
                setDescription(pkg.name);
                setLessonCount(pkg.lessonCount);
                const derivedCost = pkg.defaultPrice / pkg.lessonCount;
                setCostPerLesson(parseFloat(derivedCost.toFixed(2)));
                setTotalPrice(pkg.defaultPrice);
            }
        }
    }, [selectedPackageId, packages]);

    const handleLessonCountChange = (value: string) => {
        const count = Number(value);
        setLessonCount(count);
        setTotalPrice(Number((count * costPerLesson).toFixed(2)));
    };

    const handleCostPerLessonChange = (value: string) => {
        const cost = Number(value);
        setCostPerLesson(cost);
        setTotalPrice(Number((lessonCount * cost).toFixed(2)));
    };

    const handleTotalPriceChange = (value: string) => {
        const total = Number(value);
        setTotalPrice(total);
        if (lessonCount > 0) {
            setCostPerLesson(Number((total / lessonCount).toFixed(2)));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || lessonCount <= 0 || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await addSale({
                clientId: client.id,
                packageTemplateId: selectedPackageId === '' ? undefined : selectedPackageId,
                description,
                initialLessons: lessonCount,
                costPerLesson,
                totalPrice,
                purchaseDate: new Date(date).toISOString(),
                status: 'active',
            });
            onClose();
        } catch (error) {
            console.error('Error selling package:', error);
            alert('Errore durante la vendita. Riprova.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-xl w-full max-w-lg p-6 shadow-xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold mb-6">Vendi Pacchetto a {client.name}</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Package Selection */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Seleziona Pacchetto (Template)
                        </label>
                        <select
                            value={selectedPackageId}
                            onChange={(e) => setSelectedPackageId(e.target.value ? Number(e.target.value) : '')}
                            className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-background"
                        >
                            <option value="">-- Seleziona --</option>
                            {packages.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.lessonCount} lezioni - €{p.defaultPrice})</option>
                            ))}
                        </select>
                    </div>

                    <div className="h-px bg-border my-4" />

                    {/* Configuration Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-1">Descrizione Vendita</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">N. Lezioni</label>
                            <input
                                type="number"
                                value={lessonCount || ''}
                                onChange={(e) => handleLessonCountChange(e.target.value)}
                                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-transparent"
                                min="1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Data Acquisto</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-transparent"
                            />
                        </div>

                        <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                            <label className="block text-xs font-medium text-primary mb-1">Prezzo / Lezione (€)</label>
                            <div className="relative">
                                <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-primary" />
                                <input
                                    type="number"
                                    step="0.01"
                                    value={costPerLesson || ''}
                                    onChange={(e) => handleCostPerLessonChange(e.target.value)}
                                    className="w-full pl-7 pr-2 py-1 bg-background border border-primary/20 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary font-bold text-primary"
                                />
                            </div>
                        </div>

                        <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                            <label className="block text-xs font-medium text-green-600 dark:text-green-400 mb-1">Prezzo Totale (€)</label>
                            <div className="relative">
                                <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-green-600 dark:text-green-400" />
                                <input
                                    type="number"
                                    step="0.01"
                                    value={totalPrice || ''}
                                    onChange={(e) => handleTotalPriceChange(e.target.value)}
                                    className="w-full pl-7 pr-2 py-1 bg-background border border-green-500/20 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 font-bold text-green-600 dark:text-green-400"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
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
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            Conferma Vendita
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
