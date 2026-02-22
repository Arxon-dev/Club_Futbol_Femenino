// Event definitions
export interface Event {
    id: string;
    title: string;
    type: 'MATCH' | 'TRAINING' | 'OTHER';
    date: string;
    location: string;
    description: string;
}

export interface CreateEventDto {
    title: string;
    type: 'MATCH' | 'TRAINING' | 'OTHER';
    date: string;
    location: string;
    description: string;
}

// @ts-ignore
const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_URL = `${BASE_API_URL}/events`;

// Temporary hardcoded admin token for testing attendance endpoints
const DEV_ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjRkYWRhNWZhLWIzNDctNDA5Yy1hZjY2LWEyMjk1M2ZhOTM2NyIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc3MTcwODE4MCwiZXhwIjoxODAzMjY1NzgwfQ.u276z2WQf1VFurEyoT2wxYthu31NUPginGV067JG28w';

export const eventService = {
    async getEvents(): Promise<Event[]> {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Error fetching events');
        }
        const data = await response.json();
        return data.events;
    },

    async createEvent(eventData: CreateEventDto): Promise<Event> {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || DEV_ADMIN_TOKEN}`
            },
            body: JSON.stringify(eventData)
        });
        
        if (!response.ok) {
            throw new Error('Error creating event');
        }
        
        const data = await response.json();
        return data.event;
    },

    async getEventAttendances(eventId: string): Promise<any> {
        const response = await fetch(`${API_URL}/${eventId}/attendance`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || DEV_ADMIN_TOKEN}`
            }
        });
        if (!response.ok) {
            throw new Error('Error fetching attendances');
        }
        const data = await response.json();
        return data.attendances || [];
    }
};
