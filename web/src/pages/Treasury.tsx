import { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, Wallet, Calendar, Tag, Trash2, Edit2, Loader2 } from 'lucide-react';
import { financeService, Transaction, TreasuryData } from '../services/financeService';
import { TransactionModal } from '../components/finances/TransactionModal';

export const Treasury = () => {
    const [data, setData] = useState<TreasuryData | null>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [treasuryData, usersData] = await Promise.all([
                financeService.getTransactions(),
                import('../services/userService').then(m => m.userService.getUsers())
            ]);
            setData(treasuryData);
            setUsers(usersData);
            setError('');
        } catch (err: any) {
            setError('Error loading treasury data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta transacción?')) return;
        
        try {
            setDeletingId(id);
            await financeService.deleteTransaction(id);
            await loadData();
        } catch (err) {
            console.error('Failed to delete transaction:', err);
            alert('Error al eliminar la transacción');
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = (t: Transaction) => {
        setSelectedTransaction(t);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setSelectedTransaction(null);
        setIsModalOpen(true);
    };

    if (loading && !data) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 border-l-4 border-green-500 pl-3">Tesorería</h1>
                <button
                    onClick={handleNew}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Transacción
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md shadow-sm border border-red-100">
                    {error}
                </div>
            )}

            {/* Resumen de Tarjetas */}
            {data && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                                    <Wallet className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Balance Total</dt>
                                        <dd className="text-2xl font-semibold text-gray-900">
                                            {data.summary.balance.toFixed(2)} €
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                                    <TrendingUp className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Ingresos</dt>
                                        <dd className="text-2xl font-semibold text-green-600">
                                            {data.summary.totalIncome.toFixed(2)} €
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                                    <TrendingDown className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Gastos</dt>
                                        <dd className="text-2xl font-semibold text-red-600">
                                            {data.summary.totalExpense.toFixed(2)} €
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabla de Transacciones */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Histórico de Movimientos</h3>
                </div>
                
                {data?.transactions.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        No hay transacciones registradas todavía.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concepto</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asociado a</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Importe</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data?.transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                {new Date(t.date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {t.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                <Tag className="w-3 h-3 mr-1" />
                                                {t.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {t.user ? t.user.username : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                                            <span className={t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                                                {t.type === 'INCOME' ? '+' : '-'} {parseFloat(t.amount.toString()).toFixed(2)} €
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(t)}
                                                className="text-blue-600 hover:text-blue-900 p-1 mx-1 rounded hover:bg-blue-50 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                disabled={deletingId === t.id}
                                                className="text-red-600 hover:text-red-900 p-1 mx-1 rounded hover:bg-red-50 transition-colors"
                                                title="Eliminar"
                                            >
                                                {deletingId === t.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSaved={loadData}
                transaction={selectedTransaction}
                users={users}
            />
        </div>
    );
};
