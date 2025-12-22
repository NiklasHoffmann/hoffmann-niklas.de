import { ContactFormData } from '@/types';

// Now using Next.js API Routes - no need for localhost:5000
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    errors?: any;
}

export const contactApi = {
    submit: async (data: ContactFormData): Promise<ApiResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            
            const result = await response.json();
            return result;
        } catch (error: any) {
            return {
                success: false,
                message: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.',
            };
        }
    },

    getAll: async (): Promise<ApiResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/contact`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            const result = await response.json();
            return result;
        } catch (error: any) {
            return {
                success: false,
                message: 'Fehler beim Abrufen von Kontakten',
            };
        }
    },

    markAsRead: async (id: string): Promise<ApiResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/contact/${id}/read`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            const result = await response.json();
            return result;
        } catch (error: any) {
            return {
                success: false,
                message: 'Fehler beim Aktualisieren des Status',
            };
        }
    },
};
