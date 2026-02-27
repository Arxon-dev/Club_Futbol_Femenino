import { authService } from './authService';

const VITE_API_URL = (import.meta as any).env ? (import.meta as any).env.VITE_API_URL : undefined;
const BASE_API_URL = VITE_API_URL || 'http://localhost:3000/api';
const API_URL = `${BASE_API_URL}/chat`;

const getHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export interface ChatProfile {
  firstName: string | null;
  lastName: string | null;
}

export interface ChatUser {
  id: string;
  role: string;
  profile: ChatProfile | null;
}

export interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  user: ChatUser | null;
}

export const chatService = {
  getMessages: async (): Promise<ChatMessage[]> => {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Error al obtener mensajes');
    return response.json();
  },

  sendMessage: async (content: string): Promise<ChatMessage> => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content })
    });
    if (!response.ok) throw new Error('Error al enviar mensaje');
    return response.json();
  }
};
