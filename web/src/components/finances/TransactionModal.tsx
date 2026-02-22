import { useState, useEffect } from 'react';
import { Loader2, X, AlertCircle } from 'lucide-react';
import { financeService, Transaction } from '../../services/financeService';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    transaction?: Transaction | null;
}

const CATEGORIES = ['CUOTA', 'MATERIAL', 'ARBITRAJE', 'PATROCINIO', 'EVENTO', 'OTROS'];

export const TransactionModal = ({ isOpen, onClose, onSaved, transaction }: TransactionModalProps) => {
    const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (transaction) {
                setType(transaction.type);
                setCategory(transaction.category);
                setAmount(transaction.amount.toString());
                setDescription(transaction.description);
                setDate(transaction.date);
            } else {
                setType('INCOME');
                setCategory('CUOTA');
                setAmount('');
                setDescription('');
                setDate(new Date().toISOString().split('T')[0]);
            }
        }
    }, [isOpen, transaction]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = {
                type,
                category,
                amount: parseFloat(amount),
                description,
                date
            };

            if (transaction) {
                await financeService.updateTransaction(transaction.id, data);
            } else {
                await financeService.createTransaction(data);
            }
            onSaved();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save transaction');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl outline-none">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {transaction ? 'Editar Transacción' : 'Añadir Transacción'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-5">
                    {error && (
                        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md flex items-start text-sm">
                            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center flex-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="type"
                                    value="INCOME"
                                    checked={type === 'INCOME'}
                                    onChange={() => setType('INCOME')}
                                    className="sr-only"
                                />
                                <div className={`flex-1 text-center py-2 rounded-md font-medium text-sm transition-colors ${type === 'INCOME' ? 'bg-green-100 text-green-700 border-2 border-green-500' : 'bg-gray-100 text-gray-600 border-2 border-transparent'}`}>
                                    Ingreso
                                </div>
                            </label>
                            <label className="flex items-center flex-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="type"
                                    value="EXPENSE"
                                    checked={type === 'EXPENSE'}
                                    onChange={() => setType('EXPENSE')}
                                    className="sr-only"
                                />
                                <div className={`flex-1 text-center py-2 rounded-md font-medium text-sm transition-colors ${type === 'EXPENSE' ? 'bg-red-100 text-red-700 border-2 border-red-500' : 'bg-gray-100 text-gray-600 border-2 border-transparent'}`}>
                                    Gasto
                                </div>
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Importe (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                    required
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                required
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Concepto / Descripción</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                required
                                placeholder="Ej: Cuota Anual 2026, Compra de balones..."
                            />
                        </div>

                        <div className="pt-4 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-75 disabled:cursor-not-allowed"
                            >
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
