// @ts-ignore
const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_URL = `${BASE_API_URL}/users`;

const DEV_ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjRkYWRhNWZhLWIzNDctNDA5Yy1hZjY2LWEyMjk1M2ZhOTM2NyIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc3MTcwODE4MCwiZXhwIjoxODAzMjY1NzgwfQ.u276z2WQf1VFurEyoT2wxYthu31NUPginGV067JG28w';

const getToken = () => localStorage.getItem('token') || DEV_ADMIN_TOKEN;

export interface ProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthdate?: string;
  clothingSize?: string;
  medicalInfo?: string;
  dorsal?: number;
  position?: string;
}

export interface UserDto {
  id: string;
  email: string;
  role: string;
  profile?: ProfileDto;
}

export const userService = {
  async getUsers(): Promise<UserDto[]> {
    const response = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async getProfile(userId: string): Promise<UserDto> {
    const response = await fetch(`${API_URL}/${userId}/profile`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch user profile');
    return response.json();
  },

  async updateProfile(userId: string, profileData: ProfileDto): Promise<any> {
    const response = await fetch(`${API_URL}/${userId}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(profileData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update profile');
    }
    
    return response.json();
  }
};
