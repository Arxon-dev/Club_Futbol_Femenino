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
const getToken = () => localStorage.getItem('token');

export const eventService = {
    async getEvents(): Promise<Event[]> {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Error fetching events');
        }
        const data = await response.json();
        return data.events;
    },

    async updateAttendance(eventId: string, userId: string, isAttending: boolean): Promise<any> {
        const response = await fetch(`${API_URL}/${eventId}/attendance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ userId, isAttending })
        });
        
        if (!response.ok) {
            throw new Error('Error updating attendance');
        }
        
        const data = await response.json();
        return data.attendance;
    },

    async createEvent(eventData: CreateEventDto): Promise<Event> {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(eventData)
        });
        
        if (!response.ok) {
            throw new Error('Error creating event');
        }
        
        const data = await response.json();
        return data.event;
    },

    async removeEvent(eventId: string): Promise<void> {
        const response = await fetch(`${API_URL}/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        if (!response.ok) {
            throw new Error('Error deleting event');
        }
    },

    async getEventAttendances(eventId: string): Promise<any> {
        const response = await fetch(`${API_URL}/${eventId}/attendance`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        if (!response.ok) {
            throw new Error('Error fetching attendances');
        }
        const data = await response.json();
        return data.attendances || [];
    }
};
