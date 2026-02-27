import { authService } from './authService';

const VITE_API_URL = (import.meta as any).env ? (import.meta as any).env.VITE_API_URL : undefined;
const BASE_API_URL = VITE_API_URL || 'http://localhost:3000/api';
const API_URL = `${BASE_API_URL}/roster`;

const getHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export interface RosterProfile {
  firstName: string | null;
  lastName: string | null;
  dorsal: number | null;
  position: string | null;
}

export interface RosterMember {
  id: string;
  email: string;
  role: string;
  profile: RosterProfile | null;
}

export const rosterService = {
  getRoster: async (): Promise<RosterMember[]> => {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Error al obtener la plantilla');
    return response.json();
  }
};
