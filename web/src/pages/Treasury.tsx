import { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, Wallet, Calendar, Tag, Trash2, Edit2, Loader2 } from 'lucide-react';
import { financeService, Transaction, TreasuryData } from '../services/financeService';
import { TransactionModal } from '../components/finances/TransactionModal';
import PageHeader from '../components/ui/PageHeader';
import EliteCard from '../components/ui/EliteCard';
import EliteButton from '../components/ui/EliteButton';
import EliteTable from '../components/ui/EliteTable';

export const Treasury = () => {
    const [data, setData] = useState<TreasuryData | null>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => { loadData(); }, []);

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
            alert('Error al eliminar la transacción');
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = (t: Transaction) => {
        setSelectedTransaction(t);
        setIsModalOpen(true);
    };

    if (loading && !data) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-elite-primary" />
            </div>
        );
    }

    const statCards = data ? [
        {
            label: 'Balance Total',
            value: `${data.summary.balance.toFixed(2)} €`,
            valueColor: data.summary.balance >= 0 ? 'text-emerald-400' : 'text-elite-accent',
            icon: <Wallet className="w-5 h-5" />,
            iconBg: 'bg-elite-primary/15 text-elite-primary-hover',
        },
        {
            label: 'Total Ingresos',
            value: `${data.summary.totalIncome.toFixed(2)} €`,
            valueColor: 'text-emerald-400',
            icon: <TrendingUp className="w-5 h-5" />,
            iconBg: 'bg-emerald-500/15 text-emerald-400',
        },
        {
            label: 'Total Gastos',
            value: `${data.summary.totalExpense.toFixed(2)} €`,
            valueColor: 'text-elite-accent',
            icon: <TrendingDown className="w-5 h-5" />,
            iconBg: 'bg-elite-accent/15 text-elite-accent',
        },
    ] : [];

    const columns = [
        {
            key: 'date',
            header: 'Fecha',
            render: (t: Transaction) => (
                <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(t.date).toLocaleDateString()}
                </div>
            )
        },
        {
            key: 'description',
            header: 'Concepto',
            render: (t: Transaction) => <span className="text-white font-medium">{t.description}</span>
        },
        {
            key: 'category',
            header: 'Categoría',
            render: (t: Transaction) => (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white/5 text-slate-300 border border-white/5">
                    <Tag className="w-3 h-3" />
                    {t.category}
                </span>
            )
        },
        {
            key: 'user',
            header: 'Asociado a',
            render: (t: Transaction) => <span className="text-slate-400">{t.user ? t.user.username : '-'}</span>
        },
        {
            key: 'amount',
            header: 'Importe',
            className: 'text-right',
            render: (t: Transaction) => (
                <span className={`font-semibold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-elite-accent'}`}>
                    {t.type === 'INCOME' ? '+' : '-'} {parseFloat(t.amount.toString()).toFixed(2)} €
                </span>
            )
        },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (t: Transaction) => (
                <div className="flex items-center justify-end gap-1">
                    <button
                        onClick={() => handleEdit(t)}
                        className="p-1.5 text-slate-500 hover:text-elite-secondary hover:bg-elite-secondary/10 rounded-lg transition-colors"
                        title="Editar"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => handleDelete(t.id)}
                        disabled={deletingId === t.id}
                        className="p-1.5 text-slate-500 hover:text-elite-accent hover:bg-elite-accent/10 rounded-lg transition-colors"
                        title="Eliminar"
                    >
                        {deletingId === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                </div>
            )
        },
    ];

    return (
        <div className="space-y-6 animate-slide-up">
            <PageHeader
                title="Tesorería"
                subtitle="Gestión financiera del club."
                actions={
                    <EliteButton
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => { setSelectedTransaction(null); setIsModalOpen(true); }}
                    >
                        Nueva Transacción
                    </EliteButton>
                }
            />

            {error && (
                <div className="bg-elite-accent/10 border border-elite-accent/20 text-elite-accent p-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* Stats */}
            {data && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {statCards.map((card) => (
                        <EliteCard key={card.label} className="flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
                                {card.icon}
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.label}</p>
                                <p className={`text-xl font-bold mt-0.5 ${card.valueColor}`}>{card.value}</p>
                            </div>
                        </EliteCard>
                    ))}
                </div>
            )}

            {/* Transactions Table */}
            <EliteCard padding="p-0">
                <div className="px-5 py-3.5 border-b border-white/5">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Histórico de Movimientos</h3>
                </div>
                <EliteTable
                    columns={columns}
                    data={data?.transactions || []}
                    keyExtractor={(t) => t.id}
                    emptyMessage="No hay transacciones registradas todavía."
                />
            </EliteCard>

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
