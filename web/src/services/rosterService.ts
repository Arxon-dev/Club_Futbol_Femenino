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
  photoUrl: string | null;
  phone: string | null;
  clothingSize: string | null;
  medicalInfo: string | null;
  birthdate: string | null;
}

export interface RosterMember {
  id: string;
  email: string;
  role: string;
  profile: RosterProfile | null;
}

export interface AddMemberData {
  email: string;
  password: string;
  role: string;
  firstName?: string;
  lastName?: string;
  dorsal?: number;
  position?: string;
  phone?: string;
  clothingSize?: string;
  medicalInfo?: string;
  birthdate?: string;
  photoUrl?: string;
}

export interface UpdateMemberData {
  firstName?: string;
  lastName?: string;
  dorsal?: number | null;
  position?: string;
  phone?: string;
  clothingSize?: string;
  medicalInfo?: string;
  birthdate?: string;
  photoUrl?: string;
  role?: string;
}

export const rosterService = {
  getRoster: async (): Promise<RosterMember[]> => {
    const response = await fetch(API_URL, { method: 'GET', headers: getHeaders() });
    if (!response.ok) throw new Error('Error al obtener la plantilla');
    return response.json();
  },

  addMember: async (data: AddMemberData): Promise<RosterMember> => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Error al añadir miembro');
    }
    return response.json();
  },

  updateMember: async (id: string, data: UpdateMemberData): Promise<RosterMember> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Error al actualizar miembro');
    }
    return response.json();
  },

  removeMember: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Error al eliminar miembro');
    }
  }
};
