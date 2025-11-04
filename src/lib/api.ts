import axios, { AxiosInstance } from 'axios';
import { ContactFormData } from '@/types';

// Now using Next.js API Routes - no need for localhost:5000
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    errors?: any;
}

export const contactApi = {
    submit: async (data: ContactFormData): Promise<ApiResponse> => {
        try {
            const response = await apiClient.post<ApiResponse>('/contact', data);
            return response.data;
        } catch (error: any) {
            if (error.response?.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.',
            };
        }
    },

    getAll: async (): Promise<ApiResponse> => {
        try {
            const response = await apiClient.get<ApiResponse>('/contact');
            return response.data;
        } catch (error: any) {
            if (error.response?.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: 'Fehler beim Abrufen von Kontakten',
            };
        }
    },

    markAsRead: async (id: string): Promise<ApiResponse> => {
        try {
            const response = await apiClient.patch<ApiResponse>(`/contact/${id}/read`);
            return response.data;
        } catch (error: any) {
            if (error.response?.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: 'Fehler beim Aktualisieren des Status',
            };
        }
    },
};

export default apiClient;
