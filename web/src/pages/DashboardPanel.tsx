import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import PageHeader from '../components/ui/PageHeader';
import EliteCard from '../components/ui/EliteCard';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

// @ts-ignore
const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface StatsData {
  finances: {
    summary: {
      totalIncome: number;
      totalExpense: number;
      currentBalance: number;
    };
    charts: {
      incomeByCategory: { name: string; value: number }[];
      expenseByCategory: { name: string; value: number }[];
    }
  }
}

export const DashboardPanel: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token') || '';
      try {
        const finRes = await fetch(`${BASE_API_URL}/stats/finances`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!finRes.ok) throw new Error('Error fetching statistics');
        const financeData = await finRes.json();
        setStats({ finances: financeData });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-elite-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center">
        <EliteCard><p className="text-elite-accent">Error: {error}</p></EliteCard>
      </div>
    );
  }

  const { finances } = stats;

  const statCards = [
    {
      label: 'Balance Total',
      value: `${finances.summary.currentBalance.toFixed(2)}€`,
      valueColor: finances.summary.currentBalance >= 0 ? 'text-emerald-400' : 'text-elite-accent',
      icon: <Wallet className="w-5 h-5" />,
      iconBg: 'bg-elite-primary/15 text-elite-primary-hover',
    },
    {
      label: 'Ingresos Totales',
      value: `+${finances.summary.totalIncome.toFixed(2)}€`,
      valueColor: 'text-emerald-400',
      icon: <TrendingUp className="w-5 h-5" />,
      iconBg: 'bg-emerald-500/15 text-emerald-400',
    },
    {
      label: 'Gastos Totales',
      value: `-${finances.summary.totalExpense.toFixed(2)}€`,
      valueColor: 'text-elite-accent',
      icon: <TrendingDown className="w-5 h-5" />,
      iconBg: 'bg-elite-accent/15 text-elite-accent',
    },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader title="Dashboard" subtitle="Resumen financiero del club." />

      {/* Stat Cards */}
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EliteCard>
          <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Ingresos por Categoría</h3>
          {finances.charts.incomeByCategory.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={finances.charts.incomeByCategory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#F8FAFC', fontSize: '13px' }}
                  />
                  <Bar dataKey="value" fill="#10B981" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-600 text-sm">
              No hay datos suficientes para graficar
            </div>
          )}
        </EliteCard>

        <EliteCard>
          <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Gastos por Categoría</h3>
          {finances.charts.expenseByCategory.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={finances.charts.expenseByCategory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#F8FAFC', fontSize: '13px' }}
                  />
                  <Bar dataKey="value" fill="#F43F5E" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-600 text-sm">
              No hay datos suficientes para graficar
            </div>
          )}
        </EliteCard>
      </div>
    </div>
  );
};

export default DashboardPanel;
