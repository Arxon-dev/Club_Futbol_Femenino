export interface PushNotificationDto {
    title: string;
    body: string;
    userId?: string; // Optional: if present, send to specific user. If missing, broadcast
}

// @ts-ignore
const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_URL = `${BASE_API_URL}/notifications`;

const DEV_ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjRkYWRhNWZhLWIzNDctNDA5Yy1hZjY2LWEyMjk1M2ZhOTM2NyIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc3MTcwODE4MCwiZXhwIjoxODAzMjY1NzgwfQ.u276z2WQf1VFurEyoT2wxYthu31NUPginGV067JG28w';

export const notificationService = {
    async sendNotification(data: PushNotificationDto): Promise<any> {
        const endpoint = data.userId ? `${API_URL}/send` : `${API_URL}/broadcast`;
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || DEV_ADMIN_TOKEN}`
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
