import { authService } from './authService';

const VITE_API_URL = (import.meta as any).env ? (import.meta as any).env.VITE_API_URL : undefined;
const BASE_API_URL = VITE_API_URL || 'http://localhost:3000/api';
const API_URL = `${BASE_API_URL}/products`;

const getHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: 'Camisetas' | 'Accesorios' | 'Equipamiento' | 'Otros';
  sizes: string[];
  available: boolean;
  contactWhatsApp: string | null;
  createdAt: string;
  updatedAt: string;
}

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Error al obtener productos');
    return response.json();
  },

  getAllProducts: async (): Promise<Product[]> => {
    const response = await fetch(`${API_URL}/all`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Error al obtener productos');
    return response.json();
  },

  createProduct: async (data: Partial<Product>): Promise<Product> => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error al crear producto');
    return response.json();
  },

  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error al actualizar producto');
    return response.json();
  },

  deleteProduct: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Error al eliminar producto');
  }
};
