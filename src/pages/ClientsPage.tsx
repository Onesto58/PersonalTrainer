import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ClientFormModal } from '../components/ClientFormModal';

export const ClientsPage: React.FC = () => {
    const { clients } = useStore();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Clienti</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={20} />
                    Nuovo Cliente
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                    type="text"
                    placeholder="Cerca cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-background"
                />
            </div>

            {/* Clients List */}
            {/* Desktop Table View */}
            <div className="hidden md:block bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border">
                                <th className="px-6 py-3 font-medium text-muted-foreground">Nome</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground">Contatti</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground">Stato</th>
                                <th className="px-6 py-3 font-medium text-muted-foreground">Data Iscrizione</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredClients.map((client) => (
                                <tr
                                    key={client.id}
                                    className="hover:bg-accent/50 transition cursor-pointer"
                                    onClick={() => navigate(`/clients/${client.id}`)}
                                >
                                    <td className="px-6 py-4 font-medium">{client.name}</td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        <div className="flex flex-col text-sm">
                                            <span>{client.email || 'N/A'}</span>
                                            <span>{client.phone || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${client.status === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {client.status === 'active' ? 'Attivo' : 'Inattivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground text-sm">
                                        {new Date(client.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredClients.map((client) => (
                    <div
                        key={client.id}
                        onClick={() => navigate(`/clients/${client.id}`)}
                        className="bg-card p-4 rounded-xl border border-border shadow-sm hover:border-blue-500 transition-colors active:scale-[0.98] cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-lg">{client.name}</h3>
                                <p className="text-sm text-muted-foreground">{client.email || 'N/A'}</p>
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${client.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {client.status === 'active' ? 'Attivo' : 'Inattivo'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground border-t border-border pt-3">
                            <span>{client.phone || 'Telefono non inserito'}</span>
                            <div className="flex gap-1">
                                <span>{client.gender === 'F' ? 'Iscritta il' : 'Iscritto il'}</span>
                                <span>{new Date(client.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredClients.length === 0 && (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                    <p className="text-muted-foreground">Nessun cliente trovato.</p>
                </div>
            )}

            <ClientFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

