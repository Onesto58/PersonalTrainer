import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import type { Sale, Lesson } from '../types';
import { X, Calendar, ClipboardList, Trash2, Clock } from 'lucide-react';
import clsx from 'clsx';

interface LogLessonModalProps {
    isOpen: boolean;
    onClose: () => void;
    sale: Sale;
    lesson?: Lesson; // Optional for editing
}

export const LogLessonModal: React.FC<LogLessonModalProps> = ({ isOpen, onClose, sale, lesson }) => {
    const { addLesson, updateLesson, deleteLesson } = useStore();

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [type, setType] = useState<'lesson' | 'check'>('lesson');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    React.useEffect(() => {
        if (lesson) {
            setDate(new Date(lesson.date).toISOString().split('T')[0]);
            setNotes(lesson.notes || '');
            setType(lesson.type || 'lesson');
            setStartTime(lesson.startTime || '');
            setEndTime(lesson.endTime || '');
        } else {
            setDate(new Date().toISOString().split('T')[0]);
            setNotes('');
            setType('lesson');
            
            // Set default time to current hour
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const start = `${hours}:00`;
            const endHours = (now.getHours() + 1).toString().padStart(2, '0');
            const end = `${endHours}:00`;
            setStartTime(start);
            setEndTime(end);
        }
    }, [lesson, isOpen]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || isSubmitting) return;

        setIsSubmitting(true);
        try {
            if (lesson) {
                await updateLesson(lesson.id, {
                    date: new Date(date).toISOString(),
                    notes,
                    type,
                    startTime,
                    endTime,
                });
            } else {
                await addLesson({
                    saleId: sale.id,
                    date: new Date(date).toISOString(),
                    notes,
                    type,
                    startTime,
                    endTime,
                });
            }

            onClose();
            resetForm();
        } catch (error) {
            console.error('Error saving lesson:', error);
            alert('Errore durante il salvataggio. Riprova.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (lesson && window.confirm('Sei sicuro di voler eliminare questa lezione?') && !isSubmitting) {
            setIsSubmitting(true);
            try {
                await deleteLesson(lesson.id);
                onClose();
            } catch (error) {
                console.error('Error deleting lesson:', error);
                alert('Errore durante l\'eliminazione. Riprova.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const resetForm = () => {
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

                <h2 className="text-xl font-bold mb-1">{lesson ? 'Modifica Lezione' : 'Registra Lezione'}</h2>
                <p className="text-sm text-muted-foreground mb-6">Pacchetto: {sale.description}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Data Lezione</label>
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-background"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Inizio</label>
                            <div className="relative">
                                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => {
                                        const newStart = e.target.value;
                                        setStartTime(newStart);
                                        // Auto-set end time to +1 hour
                                        if (newStart) {
                                            const [h, m] = newStart.split(':').map(Number);
                                            const newEnd = `${((h + 1) % 24).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                                            setEndTime(newEnd);
                                        }
                                    }}
                                    className="w-full pl-9 pr-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-background"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Fine</label>
                            <div className="relative">
                                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-background"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Tipo di Registrazione</label>
                        <div className="flex gap-2 p-1 bg-muted rounded-xl border border-border">
                            <button
                                type="button"
                                onClick={() => setType('lesson')}
                                className={clsx(
                                    "flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all",
                                    type === 'lesson' 
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                                        : "text-muted-foreground hover:bg-background/50"
                                )}
                            >
                                Lezione Standard
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('check')}
                                className={clsx(
                                    "flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all",
                                    type === 'check' 
                                        ? "bg-amber-500 text-white shadow-md shadow-amber-500/20" 
                                        : "text-muted-foreground hover:bg-background/50"
                                )}
                            >
                                Check (Misure/Peso)
                            </button>
                        </div>
                        <p className="mt-2 text-[11px] text-muted-foreground italic">
                            {type === 'lesson' 
                                ? "La lezione verrà scalata dal totale del pacchetto." 
                                : "Il check verrà registrato nello storico ma non verrà scalato dal pacchetto."}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Note (Allenamento svolto)</label>
                        <div className="relative">
                            <ClipboardList size={16} className="absolute left-3 top-3 text-muted-foreground" />
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-transparent h-24 resize-none"
                                placeholder="Esercizi fatti, carichi, note..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-2">
                        {lesson ? (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isSubmitting}
                                className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition disabled:opacity-50"
                                title="Elimina lezione"
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
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                {lesson ? 'Aggiorna' : 'Salva Lezione'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
