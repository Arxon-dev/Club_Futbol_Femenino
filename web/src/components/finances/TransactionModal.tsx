import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { financeService, Transaction } from '../../services/financeService';
import EliteModal from '../ui/EliteModal';
import EliteButton from '../ui/EliteButton';
import { EliteInput, EliteSelect } from '../ui/EliteInput';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    transaction?: Transaction | null;
    users?: any[];
}

const CATEGORIES = ['CUOTA', 'MATERIAL', 'ARBITRAJE', 'PATROCINIO', 'EVENTO', 'OTROS'];

export const TransactionModal = ({ isOpen, onClose, onSaved, transaction, users = [] }: TransactionModalProps) => {
    const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [userId, setUserId] = useState<string>('');
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
                setUserId(transaction.userId || '');
            } else {
                setType('INCOME');
                setCategory('CUOTA');
                setAmount('');
                setDescription('');
                setDate(new Date().toISOString().split('T')[0]);
                setUserId('');
            }
        }
    }, [isOpen, transaction]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = { type, category, amount: parseFloat(amount), description, date, userId: userId || undefined };
            if (transaction) {
                await financeService.updateTransaction(transaction.id, data);
            } else {
                await financeService.createTransaction(data);
            }
            onSaved();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <EliteModal
            isOpen={isOpen}
            onClose={onClose}
            title={transaction ? 'Editar Transacción' : 'Añadir Transacción'}
            maxWidth="max-w-md"
        >
            {error && (
                <div className="mb-4 bg-elite-accent/10 text-elite-accent p-3 rounded-xl flex items-start text-sm border border-elite-accent/20">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type Toggle */}
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setType('INCOME')}
                        className={`flex-1 text-center py-2 rounded-xl text-sm font-medium transition-all ${type === 'INCOME' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-500 border border-transparent'}`}
                    >
                        Ingreso
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('EXPENSE')}
                        className={`flex-1 text-center py-2 rounded-xl text-sm font-medium transition-all ${type === 'EXPENSE' ? 'bg-elite-accent/15 text-elite-accent border border-elite-accent/30' : 'bg-white/5 text-slate-500 border border-transparent'}`}
                    >
                        Gasto
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <EliteInput label="Importe (€)" type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="0.00" />
                    <EliteInput label="Fecha" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>

                <EliteSelect label="Categoría" value={category} onChange={(e) => setCategory(e.target.value)} required>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </EliteSelect>

                <EliteSelect label="Asignar a Jugador (Opcional)" value={userId} onChange={(e) => setUserId(e.target.value)}>
                    <option value="">-- Ninguno (General) --</option>
                    {users?.map(user => (
                        <option key={user.id} value={user.id}>
                            {user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : user.email}
                        </option>
                    ))}
                </EliteSelect>

                <EliteInput label="Concepto" type="text" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Ej: Cuota Anual 2026" />

                <div className="pt-3 flex justify-end gap-2 border-t border-white/5">
                    <EliteButton type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancelar</EliteButton>
                    <EliteButton type="submit" loading={loading}>Guardar</EliteButton>
                </div>
            </form>
        </EliteModal>
    );
};
