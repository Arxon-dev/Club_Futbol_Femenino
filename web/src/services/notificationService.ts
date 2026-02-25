export interface PushNotificationDto {
    title: string;
    body: string;
    userId?: string; // Optional: if present, send to specific user. If missing, broadcast
}

// @ts-ignore
const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_URL = `${BASE_API_URL}/notifications`;

const getToken = () => localStorage.getItem('token');

export const notificationService = {
    async sendNotification(data: PushNotificationDto): Promise<any> {
        const response = await fetch(`${API_URL}/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}` // Temporary auth for dev
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Request failed');
        }
        
        return response.json();
    }
};
