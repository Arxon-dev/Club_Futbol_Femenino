import { authService } from './authService';

const VITE_API_URL = (import.meta as any).env ? (import.meta as any).env.VITE_API_URL : undefined;
const BASE_API_URL = VITE_API_URL || 'http://localhost:3000/api';
const API_URL = `${BASE_API_URL}/social-links`;

const getHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export interface SocialLinks {
  id: number;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  twitterUrl: string;
  updatedAt: string;
}

export const socialLinkService = {
  getLinks: async (): Promise<SocialLinks> => {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error fetching social links');
    }
    return response.json();
  },

  updateLinks: async (data: Partial<Omit<SocialLinks, 'id' | 'updatedAt'>>): Promise<SocialLinks> => {
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error updating social links');
    }
    const result = await response.json();
    return result.links;
  }
};
