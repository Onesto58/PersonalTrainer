import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Client, PackageTemplate, Sale, Payment, Lesson } from '../types';
import type { Session } from '@supabase/supabase-js';

interface AppState {
    clients: Client[];
    packages: PackageTemplate[];
    sales: Sale[];
    payments: Payment[];
    lessons: Lesson[];
    session: Session | null;
    loading: boolean;
    initialized: boolean;

    // Auth Actions
    setSession: (session: Session | null) => void;
    signOut: () => Promise<void>;

    // Data Actions
    initialize: () => Promise<void>;
    
    addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
    updateClient: (id: number, updates: Partial<Client>) => Promise<void>;

    addPackage: (pkg: Omit<PackageTemplate, 'id'>) => Promise<void>;
    updatePackage: (id: number, updates: Partial<PackageTemplate>) => Promise<void>;
    deletePackage: (id: number) => Promise<void>;

    addSale: (sale: Omit<Sale, 'id'>) => Promise<void>;
    updateSale: (id: number, updates: Partial<Sale>) => Promise<void>;

    addPayment: (payment: Omit<Payment, 'id'>) => Promise<void>;
    updatePayment: (id: number, updates: Partial<Payment>) => Promise<void>;
    deletePayment: (id: number) => Promise<void>;

    addLesson: (lesson: Omit<Lesson, 'id'>) => Promise<void>;
    updateLesson: (id: number, updates: Partial<Lesson>) => Promise<void>;
    deleteLesson: (id: number) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
    clients: [],
    packages: [],
    sales: [],
    payments: [],
    lessons: [],
    session: null,
    loading: false,
    initialized: false,

    setSession: (session) => {
        set({ session });
        if (session) {
            get().initialize();
        } else {
            set({ clients: [], packages: [], sales: [], payments: [], lessons: [], initialized: false });
        }
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({ session: null, clients: [], packages: [], sales: [], payments: [], lessons: [], initialized: false });
    },

    initialize: async () => {
        if (get().loading) return;
        set({ loading: true });

        try {
            const [
                { data: clients },
                { data: packages },
                { data: sales },
                { data: payments },
                { data: lessons }
            ] = await Promise.all([
                supabase.from('clients').select('*').order('name'),
                supabase.from('package_templates').select('*').order('name'),
                supabase.from('sales').select('*').order('purchase_date', { ascending: false }),
                supabase.from('payments').select('*').order('date', { ascending: false }),
                supabase.from('lessons').select('*').order('date', { ascending: false })
            ]);

            set({
                clients: (clients || []).map(c => ({
                    ...c,
                    taxCode: c.tax_code,
                    birthDate: c.birth_date,
                    createdAt: c.created_at
                })),
                packages: packages || [],
                sales: (sales || []).map(s => ({
                    ...s,
                    clientId: s.client_id,
                    packageTemplateId: s.package_template_id,
                    purchaseDate: s.purchase_date,
                    initialLessons: s.initial_lessons,
                    costPerLesson: s.cost_per_lesson,
                    totalPrice: s.total_price
                })),
                payments: (payments || []).map(p => ({
                    ...p,
                    saleId: p.sale_id
                })),
                lessons: (lessons || []).map(l => ({
                    ...l,
                    saleId: l.sale_id,
                    startTime: l.start_time,
                    endTime: l.end_time
                })),
                initialized: true
            });
        } catch (error) {
            console.error('Error initializing store:', error);
        } finally {
            set({ loading: false });
        }
    },

    addClient: async (clientData) => {
        const { data, error } = await supabase.from('clients').insert([{
            name: clientData.name,
            email: clientData.email,
            phone: clientData.phone,
            tax_code: clientData.taxCode,
            birth_date: clientData.birthDate,
            address: clientData.address,
            city: clientData.city,
            gender: clientData.gender,
            status: clientData.status,
            notes: clientData.notes
        }]).select().single();

        if (error) throw error;
        if (data) {
            const newClient = {
                ...data,
                taxCode: data.tax_code,
                birthDate: data.birth_date,
                createdAt: data.created_at
            };
            set(state => ({ clients: [...state.clients, newClient].sort((a,b) => a.name.localeCompare(b.name)) }));
        }
    },

    updateClient: async (id, updates) => {
        const { error } = await supabase.from('clients').update({
            name: updates.name,
            email: updates.email,
            phone: updates.phone,
            tax_code: updates.taxCode,
            birth_date: updates.birthDate,
            address: updates.address,
            city: updates.city,
            gender: updates.gender,
            status: updates.status,
            notes: updates.notes
        }).eq('id', id);

        if (error) throw error;
        set(state => ({
            clients: state.clients.map(c => c.id === id ? { ...c, ...updates } : c)
        }));
    },

    addPackage: async (pkgData) => {
        const { data, error } = await supabase.from('package_templates').insert([{
            name: pkgData.name,
            default_price: pkgData.defaultPrice,
            lesson_count: pkgData.lessonCount
        }]).select().single();

        if (error) throw error;
        if (data) {
            set(state => ({ packages: [...state.packages, data] }));
        }
    },

    updatePackage: async (id, updates) => {
        const { error } = await supabase.from('package_templates').update({
            name: updates.name,
            default_price: updates.defaultPrice,
            lesson_count: updates.lessonCount
        }).eq('id', id);

        if (error) throw error;
        set(state => ({
            packages: state.packages.map(p => p.id === id ? { ...p, ...updates } : p)
        }));
    },

    deletePackage: async (id) => {
        const { error } = await supabase.from('package_templates').delete().eq('id', id);
        if (error) throw error;
        set(state => ({
            packages: state.packages.filter(p => p.id !== id)
        }));
    },

    addSale: async (saleData) => {
        const { data, error } = await supabase.from('sales').insert([{
            client_id: saleData.clientId,
            package_template_id: saleData.packageTemplateId,
            description: saleData.description,
            initial_lessons: saleData.initialLessons,
            cost_per_lesson: saleData.costPerLesson,
            total_price: saleData.totalPrice,
            status: saleData.status,
            notes: saleData.notes,
            purchase_date: saleData.purchaseDate
        }]).select().single();

        if (error) throw error;
        if (data) {
            const newSale = {
                ...data,
                clientId: data.client_id,
                packageTemplateId: data.package_template_id,
                purchaseDate: data.purchase_date,
                initialLessons: data.initial_lessons,
                costPerLesson: data.cost_per_lesson,
                totalPrice: data.total_price
            };
            set(state => ({ sales: [newSale, ...state.sales] }));
        }
    },

    updateSale: async (id, updates) => {
        const { error } = await supabase.from('sales').update({
            description: updates.description,
            initial_lessons: updates.initialLessons,
            cost_per_lesson: updates.costPerLesson,
            total_price: updates.totalPrice,
            status: updates.status,
            notes: updates.notes
        }).eq('id', id);

        if (error) throw error;
        set(state => ({
            sales: state.sales.map(s => s.id === id ? { ...s, ...updates } : s)
        }));
    },

    addPayment: async (paymentData) => {
        const { data, error } = await supabase.from('payments').insert([{
            sale_id: paymentData.saleId,
            amount: paymentData.amount,
            method: paymentData.method,
            notes: paymentData.notes,
            date: paymentData.date
        }]).select().single();

        if (error) throw error;
        if (data) {
            const newPayment = {
                ...data,
                saleId: data.sale_id
            };
            set(state => ({ payments: [newPayment, ...state.payments] }));
        }
    },

    updatePayment: async (id, updates) => {
        const { error } = await supabase.from('payments').update({
            amount: updates.amount,
            method: updates.method,
            notes: updates.notes,
            date: updates.date
        }).eq('id', id);

        if (error) throw error;
        set(state => ({
            payments: state.payments.map(p => p.id === id ? { ...p, ...updates } : p)
        }));
    },

    deletePayment: async (id) => {
        const { error } = await supabase.from('payments').delete().eq('id', id);
        if (error) throw error;
        set(state => ({
            payments: state.payments.filter(p => p.id !== id)
        }));
    },

    addLesson: async (lessonData) => {
        const { data, error } = await supabase.from('lessons').insert([{
            sale_id: lessonData.saleId,
            date: lessonData.date,
            start_time: lessonData.startTime,
            end_time: lessonData.endTime,
            type: lessonData.type,
            notes: lessonData.notes
        }]).select().single();

        if (error) throw error;
        if (data) {
            const newLesson = {
                ...data,
                saleId: data.sale_id,
                startTime: data.start_time,
                endTime: data.end_time
            };

            // Update status of sale locally if needed
            const sale = get().sales.find(s => s.id === lessonData.saleId);
            let updatedSales = get().sales;
            if (sale && lessonData.type === 'lesson') {
                const saleLessonsCount = [...get().lessons, newLesson].filter(l => l.saleId === sale.id && l.type === 'lesson').length;
                const newStatus = saleLessonsCount >= sale.initialLessons ? 'completed' : 'active';
                
                await supabase.from('sales').update({ status: newStatus }).eq('id', sale.id);
                updatedSales = get().sales.map(s => s.id === sale.id ? { ...s, status: newStatus } : s);
            }

            set(state => ({ 
                lessons: [newLesson, ...state.lessons],
                sales: updatedSales
            }));
        }
    },

    updateLesson: async (id, updates) => {
        const { error } = await supabase.from('lessons').update({
            date: updates.date,
            start_time: updates.startTime,
            end_time: updates.endTime,
            type: updates.type,
            notes: updates.notes
        }).eq('id', id);

        if (error) throw error;

        // Recalculate sale status if type changed
        const lesson = get().lessons.find(l => l.id === id);
        let updatedSales = get().sales;
        if (lesson && updates.type !== undefined) {
            const sale = get().sales.find(s => s.id === lesson.saleId);
            if (sale) {
                const tempLessons = get().lessons.map(l => l.id === id ? { ...l, ...updates } : l);
                const saleLessonsCount = tempLessons.filter(l => l.saleId === sale.id && l.type === 'lesson').length;
                const newStatus = saleLessonsCount >= sale.initialLessons ? 'completed' : 'active';
                
                await supabase.from('sales').update({ status: newStatus }).eq('id', sale.id);
                updatedSales = get().sales.map(s => s.id === sale.id ? { ...s, status: newStatus } : s);
            }
        }

        set(state => ({
            lessons: state.lessons.map(l => l.id === id ? { ...l, ...updates } : l),
            sales: updatedSales
        }));
    },

    deleteLesson: async (id) => {
        const lesson = get().lessons.find(l => l.id === id);
        const { error } = await supabase.from('lessons').delete().eq('id', id);
        if (error) throw error;

        let updatedSales = get().sales;
        if (lesson) {
            const sale = get().sales.find(s => s.id === lesson.saleId);
            if (sale) {
                const tempLessons = get().lessons.filter(l => l.id !== id);
                const saleLessonsCount = tempLessons.filter(l => l.saleId === sale.id && l.type === 'lesson').length;
                const newStatus = saleLessonsCount >= sale.initialLessons ? 'completed' : 'active';
                
                await supabase.from('sales').update({ status: newStatus }).eq('id', sale.id);
                updatedSales = get().sales.map(s => s.id === sale.id ? { ...s, status: newStatus } : s);
            }
        }

        set(state => ({
            lessons: state.lessons.filter(l => l.id !== id),
            sales: updatedSales
        }));
    }
}));
