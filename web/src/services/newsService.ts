import { authService } from './authService';

const VITE_API_URL = (import.meta as any).env ? (import.meta as any).env.VITE_API_URL : undefined;
const BASE_API_URL = VITE_API_URL || 'http://localhost:3000/api';
const API_URL = `${BASE_API_URL}/news`;

const getHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export interface NewsArticle {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  category: string;
  author: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export const newsService = {
  getAllNews: async (): Promise<NewsArticle[]> => {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Error al obtener las noticias');
    return response.json();
  },

  getNewsById: async (id: number): Promise<NewsArticle> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Error al obtener la noticia');
    return response.json();
  },

  createNews: async (data: Partial<NewsArticle>): Promise<NewsArticle> => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error al crear la noticia');
    return response.json();
  },

  updateNews: async (id: number, data: Partial<NewsArticle>): Promise<NewsArticle> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error al actualizar la noticia');
    return response.json();
  },

  deleteNews: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Error al eliminar la noticia');
  }
};
