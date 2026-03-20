import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Hash, Calendar, MapPin, Building2, ClipboardList } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Client } from '../types';
import clsx from 'clsx';

interface ClientFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    client?: Client; // If provided, we are in edit mode
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({ isOpen, onClose, client }) => {
    const { addClient, updateClient } = useStore();

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [taxCode, setTaxCode] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [notes, setNotes] = useState('');
    const [gender, setGender] = useState<'M' | 'F' | 'Other'>('M');

    useEffect(() => {
        if (client) {
            setName(client.name);
            setEmail(client.email || '');
            setPhone(client.phone || '');
            setTaxCode(client.taxCode || '');
            setBirthDate(client.birthDate ? new Date(client.birthDate).toISOString().split('T')[0] : '');
            setAddress(client.address || '');
            setCity(client.city || '');
            setNotes(client.notes || '');
            setGender(client.gender || 'M');
        } else {
            resetForm();
        }
    }, [client, isOpen]);

    const resetForm = () => {
        setName('');
        setEmail('');
        setPhone('');
        setTaxCode('');
        setBirthDate('');
        setAddress('');
        setCity('');
        setNotes('');
        setGender('M');
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const clientData = {
                name,
                email,
                phone,
                taxCode,
                birthDate: birthDate ? new Date(birthDate).toISOString() : undefined,
                address,
                city,
                notes,
                gender,
            };

            if (client) {
                await updateClient(client.id, clientData);
            } else {
                await addClient({
                    ...clientData,
                    status: 'active',
                });
            }
            onClose();
            if (!client) resetForm();
        } catch (error) {
            console.error('Error saving client:', error);
            alert('Errore durante il salvataggio. Riprova.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-card rounded-xl w-full max-w-lg p-6 shadow-xl relative my-8">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <User className="text-blue-500" />
                    {client ? 'Modifica Cliente' : 'Nuovo Cliente'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-1">Nome Completo *</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-background"
                                    required
                                    placeholder="Es: Mario Rossi"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-background"
                                    placeholder="mario.rossi@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Telefono</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-background"
                                    placeholder="+39 333 1234567"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Codice Fiscale</label>
                            <div className="relative">
                                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={taxCode}
                                    onChange={(e) => setTaxCode(e.target.value.toUpperCase())}
                                    className="w-full pl-9 pr-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-background uppercase"
                                    placeholder="RSSMRA80A01H501U"
                                    maxLength={16}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Data di Nascita</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="date"
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-background"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Indirizzo</label>
                            <div className="relative">
                                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-background"
                                    placeholder="Via Roma 1"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Città</label>
                            <div className="relative">
                                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-background"
                                    placeholder="Milano"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-2">Sesso</label>
                            <div className="flex gap-2 p-1 bg-muted rounded-xl border border-border w-fit">
                                {[
                                    { id: 'M', label: 'Uomo' },
                                    { id: 'F', label: 'Donna' },
                                    { id: 'Other', label: 'Altro' }
                                ].map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => setGender(option.id as any)}
                                        className={clsx(
                                            "py-1.5 px-4 rounded-lg text-sm font-bold transition-all",
                                            gender === option.id 
                                                ? "bg-white text-blue-600 shadow-sm border border-border" 
                                                : "text-muted-foreground hover:bg-background/50"
                                        )}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-1">Note / Infortuni / Obiettivi</label>
                            <div className="relative">
                                <ClipboardList size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-background h-24 resize-none"
                                    placeholder="Note aggiuntive sul cliente..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-muted-foreground hover:bg-accent rounded-lg transition"
                        >
                            Annulla
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {client ? 'Aggiorna Cliente' : 'Salva Cliente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
