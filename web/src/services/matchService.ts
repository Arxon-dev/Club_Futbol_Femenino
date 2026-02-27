import { authService } from './authService';

const VITE_API_URL = (import.meta as any).env ? (import.meta as any).env.VITE_API_URL : undefined;
const BASE_API_URL = VITE_API_URL || 'http://localhost:3000/api';
const API_URL = `${BASE_API_URL}/matches`;

const getHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export interface Match {
  id: number;
  date: string;
  opponentName: string;
  opponentLogoUrl: string | null;
  location: string;
  result: string;
  competition: string;
  time: string | null;
}

export const matchService = {
  getAllMatches: async (): Promise<Match[]> => {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Error al obtener partidos');
    return response.json();
  },

  createMatch: async (matchData: Partial<Match>): Promise<Match> => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(matchData)
    });
    if (!response.ok) throw new Error('Error al crear el partido');
    return response.json();
  },

  updateMatch: async (id: number, matchData: Partial<Match>): Promise<Match> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(matchData)
    });
    if (!response.ok) throw new Error('Error al actualizar el partido');
    return response.json();
  },

  deleteMatch: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Error al eliminar el partido');
  }
};
