import { authService } from './authService';

const VITE_API_URL = (import.meta as any).env ? (import.meta as any).env.VITE_API_URL : undefined;
const BASE_API_URL = VITE_API_URL || 'http://localhost:3000/api';
const API_URL = `${BASE_API_URL}/president-letter`;

const getHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export interface PresidentLetter {
  id: number;
  title: string;
  content: string;
  updatedAt: string;
}

export const presidentLetterService = {
  getLetter: async (): Promise<PresidentLetter> => {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error fetching letter');
    }
    return response.json();
  },

  updateLetter: async (title: string, content: string): Promise<PresidentLetter> => {
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error updating letter');
    }
    const data = await response.json();
    return data.letter;
  }
};
