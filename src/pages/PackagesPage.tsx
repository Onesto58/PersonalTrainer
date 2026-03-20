import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import type { PackageTemplate } from '../types';

export const PackagesPage: React.FC = () => {
    const { packages, addPackage, deletePackage, updatePackage } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [defaultPrice, setDefaultPrice] = useState('');
    const [lessonCount, setLessonCount] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !defaultPrice || !lessonCount || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const pkgData = {
                name,
                defaultPrice: Number(defaultPrice),
                lessonCount: Number(lessonCount),
            };

            if (editingId) {
                await updatePackage(editingId, pkgData);
            } else {
                await addPackage(pkgData);
            }

            resetForm();
        } catch (error) {
            console.error('Error saving package:', error);
            alert('Errore durante il salvataggio. Riprova.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (pkg: PackageTemplate) => {
        setEditingId(pkg.id);
        setName(pkg.name);
        setDefaultPrice(pkg.defaultPrice.toString());
        setLessonCount(pkg.lessonCount.toString());
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setName('');
        setDefaultPrice('');
        setLessonCount('');
        setEditingId(null);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Pacchetti e Listino</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={20} />
                    Nuovo Pacchetto
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                    <div key={pkg.id} className="bg-card p-6 rounded-xl shadow-sm border border-border flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-card-foreground">{pkg.name}</h3>
                            <div className="mt-4 space-y-2">
                                <p className="text-muted-foreground flex justify-between">
                                    <span>Prezzo:</span>
                                    <span className="font-semibold text-foreground">€ {pkg.defaultPrice}</span>
                                </p>
                                <p className="text-muted-foreground flex justify-between">
                                    <span>Lezioni:</span>
                                    <span className="font-semibold text-foreground">{pkg.lessonCount}</span>
                                </p>
                                <p className="text-muted-foreground flex justify-between border-t border-dashed pt-2 mt-2">
                                    <span>Costo/Lezione:</span>
                                    <span className="font-medium text-blue-600">€ {(pkg.defaultPrice / pkg.lessonCount).toFixed(2)}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => handleEdit(pkg)}
                                disabled={isSubmitting}
                                className="p-2 text-muted-foreground hover:bg-accent rounded-lg hover:text-blue-600 transition disabled:opacity-50"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button
                                onClick={async () => {
                                    if (window.confirm('Sei sicuro di voler eliminare questo pacchetto?') && !isSubmitting) {
                                        setIsSubmitting(true);
                                        try {
                                            await deletePackage(pkg.id);
                                        } catch (error) {
                                            console.error('Error deleting package:', error);
                                        } finally {
                                            setIsSubmitting(false);
                                        }
                                    }
                                }}
                                disabled={isSubmitting}
                                className="p-2 text-muted-foreground hover:bg-accent rounded-lg hover:text-destructive transition disabled:opacity-50"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {packages.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                        Non hai ancora creato nessun pacchetto. Inizia ora!
                    </div>
                )}
            </div>

            {/* Basic Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-card rounded-xl w-full max-w-md p-6 shadow-xl">
                        <h2 className="text-xl font-bold mb-4">
                            {editingId ? 'Modifica Pacchetto' : 'Nuovo Pacchetto'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Nome Pacchetto</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-transparent"
                                    placeholder="es. 10 Lezioni Standard"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Prezzo (€)</label>
                                    <input
                                        type="number"
                                        value={defaultPrice}
                                        onChange={(e) => setDefaultPrice(e.target.value)}
                                        className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-transparent"
                                        placeholder="300"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">N. Lezioni</label>
                                    <input
                                        type="number"
                                        value={lessonCount}
                                        onChange={(e) => setLessonCount(e.target.value)}
                                        className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-transparent"
                                        placeholder="10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={resetForm}
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
                                    {editingId ? 'Aggiorna' : 'Salva'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
