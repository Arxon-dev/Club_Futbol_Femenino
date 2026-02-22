// @ts-ignore
const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_URL = `${BASE_API_URL}/finances`;

const DEV_ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjRkYWRhNWZhLWIzNDctNDA5Yy1hZjY2LWEyMjk1M2ZhOTM2NyIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc3MTcwODE4MCwiZXhwIjoxODAzMjY1NzgwfQ.u276z2WQf1VFurEyoT2wxYthu31NUPginGV067JG28w';
const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token') || DEV_ADMIN_TOKEN}`
});

export interface Transaction {
    id: string;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    amount: number | string;
    description: string;
    date: string;
    userId?: string;
    user?: {
        id: string;
        username: string;
        email: string;
    };
    createdAt: string;
}

export interface TreasuryData {
    transactions: Transaction[];
    summary: {
        totalIncome: number;
        totalExpense: number;
        balance: number;
    };
}

export const financeService = {
    getTransactions: async (): Promise<TreasuryData> => {
        const response = await fetch(API_URL, { headers: getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch transactions');
        return await response.json();
    },

    createTransaction: async (data: Partial<Transaction>): Promise<Transaction> => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create transaction');
        return await response.json();
    },

    updateTransaction: async (id: string, data: Partial<Transaction>): Promise<Transaction> => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update transaction');
        return await response.json();
    },

    deleteTransaction: async (id: string): Promise<void> => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete transaction');
    }
};
