export type ClientStatus = 'active' | 'inactive';

export interface Client {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    taxCode?: string; // Codice Fiscale
    birthDate?: string; // ISO Date string
    address?: string;
    city?: string;
    gender?: 'M' | 'F' | 'Other';
    status: ClientStatus;
    createdAt: string; // ISO Date string
    notes?: string;
}

export interface PackageTemplate {
    id: number;
    name: string;
    defaultPrice: number;
    lessonCount: number;
}

export type SaleStatus = 'active' | 'completed' | 'archived';

export interface Sale {
    id: number;
    clientId: number;
    packageTemplateId?: number; // Optional link to original template
    description: string; // "10 Lezioni" (copied from template or custom)

    // Pricing & Lessons
    initialLessons: number;
    costPerLesson: number;
    totalPrice: number; // calculated as initialLessons * costPerLesson

    purchaseDate: string; // ISO Date string
    status: SaleStatus;
    notes?: string;
}

export interface Payment {
    id: number;
    saleId: number;
    amount: number;
    date: string; // ISO Date string
    method: string; // 'cash', 'transfer', etc.
    notes?: string;
}

export interface Lesson {
    id: number;
    saleId: number;
    date: string; // ISO Date string
    startTime?: string; // HH:mm
    endTime?: string; // HH:mm
    notes?: string;
    type: 'lesson' | 'check'; // 'lesson' counts towards initialLessons, 'check' does not
}
