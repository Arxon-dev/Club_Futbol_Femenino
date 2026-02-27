import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import PageHeader from '../components/ui/PageHeader';
import EliteCard from '../components/ui/EliteCard';
import { TrendingUp, TrendingDown, Wallet, Users, Calendar, Trophy, CheckCircle, XCircle, Clock3 } from 'lucide-react';

// @ts-ignore
const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface DashboardData {
  finances: {
    summary: { totalIncome: number; totalExpense: number; currentBalance: number };
    charts: { incomeByCategory: { name: string; value: number }[]; expenseByCategory: { name: string; value: number }[] };
  };
  roster: { playerCount: number; coachCount: number; total: number };
  nextMatch: { opponentName: string; date: string; time: string | null; location: string; competition: string } | null;
  recentMatches: { opponentName: string; date: string; result: string; competition: string }[];
  attendance: { ATTENDING: number; NOT_ATTENDING: number; PENDING: number; totalEvents: number };
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  } catch { return iso; }
}

const PIE_COLORS = ['#10B981', '#F43F5E', '#64748B'];

export const DashboardPanel: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem('token') || '';
      try {
        const res = await fetch(`${BASE_API_URL}/stats/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Error fetching dashboard');
        setData(await res.json());
      } catch (err: any) { setError(err.message); }
      finally { setLoading(false); }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-elite-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <EliteCard><p className="text-elite-accent">Error: {error}</p></EliteCard>
      </div>
    );
  }

  const { finances, roster, nextMatch, recentMatches, attendance } = data;
  const totalAttendance = attendance.ATTENDING + attendance.NOT_ATTENDING + attendance.PENDING;
  const attendanceRate = totalAttendance > 0 ? Math.round((attendance.ATTENDING / totalAttendance) * 100) : 0;

  const attendancePie = [
    { name: 'Asisten', value: attendance.ATTENDING },
    { name: 'No asisten', value: attendance.NOT_ATTENDING },
    { name: 'Pendiente', value: attendance.PENDING },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader title="Dashboard" subtitle="Panel de control del club." />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Balance" value={`${finances.summary.currentBalance.toFixed(2)}€`}
          valueColor={finances.summary.currentBalance >= 0 ? 'text-emerald-400' : 'text-elite-accent'}
          icon={<Wallet className="w-5 h-5" />} iconBg="bg-elite-primary/15 text-elite-primary-hover"
        />
        <KPICard
          label="Plantilla" value={`${roster.total}`}
          subtext={`${roster.playerCount} jugadoras · ${roster.coachCount} staff`}
          valueColor="text-white"
          icon={<Users className="w-5 h-5" />} iconBg="bg-elite-secondary/15 text-elite-secondary"
        />
        <KPICard
          label="Ingresos" value={`+${finances.summary.totalIncome.toFixed(2)}€`}
          valueColor="text-emerald-400"
          icon={<TrendingUp className="w-5 h-5" />} iconBg="bg-emerald-500/15 text-emerald-400"
        />
        <KPICard
          label="Gastos" value={`-${finances.summary.totalExpense.toFixed(2)}€`}
          valueColor="text-elite-accent"
          icon={<TrendingDown className="w-5 h-5" />} iconBg="bg-elite-accent/15 text-elite-accent"
        />
      </div>

      {/* Row 2: Next Match + Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Match */}
        <EliteCard>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-elite-secondary" />
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Próximo Partido</h3>
          </div>
          {nextMatch ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-elite-primary/10 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-elite-primary" />
                </div>
                <div>
                  <p className="text-white font-semibold text-lg font-heading">vs {nextMatch.opponentName}</p>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full border bg-elite-secondary/15 text-elite-secondary border-elite-secondary/20">
                    {nextMatch.competition}
                  </span>
                </div>
              </div>
              <div className="flex gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-600" /> {formatDate(nextMatch.date)}
                </span>
                {nextMatch.time && (
                  <span className="flex items-center gap-1.5">
                    <Clock3 className="w-3.5 h-3.5 text-slate-600" /> {nextMatch.time}h
                  </span>
                )}
              </div>
              {nextMatch.location && (
                <p className="text-xs text-slate-500">📍 {nextMatch.location}</p>
              )}
            </div>
          ) : (
            <p className="text-slate-500 text-sm py-4">No hay partidos próximos programados.</p>
          )}

          {/* Recent matches */}
          {recentMatches.length > 0 && (
            <div className="mt-5 pt-4 border-t border-white/5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Últimos Resultados</p>
              <div className="space-y-2">
                {recentMatches.slice(0, 3).map((m, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">vs {m.opponentName}</span>
                    <span className="text-xs font-mono font-bold text-elite-primary">{m.result || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </EliteCard>

        {/* Attendance */}
        <EliteCard>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Asistencia</h3>
          </div>
          {attendance.totalEvents > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-36 h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={attendancePie} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                      {attendancePie.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#F8FAFC', fontSize: '13px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 flex-1">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-sm text-slate-400">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Asisten
                  </span>
                  <span className="text-white font-bold">{attendance.ATTENDING}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-sm text-slate-400">
                    <XCircle className="w-3.5 h-3.5 text-rose-400" /> No asisten
                  </span>
                  <span className="text-white font-bold">{attendance.NOT_ATTENDING}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-sm text-slate-400">
                    <Clock3 className="w-3.5 h-3.5 text-slate-500" /> Pendiente
                  </span>
                  <span className="text-white font-bold">{attendance.PENDING}</span>
                </div>
                <div className="pt-2 border-t border-white/5">
                  <p className="text-xs text-slate-500">{attendance.totalEvents} eventos · {attendanceRate}% asistencia</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm py-4">No hay datos de asistencia todavía.</p>
          )}
        </EliteCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EliteCard>
          <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Ingresos por Categoría</h3>
          {finances.charts.incomeByCategory.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={finances.charts.incomeByCategory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#F8FAFC', fontSize: '13px' }} />
                  <Bar dataKey="value" fill="#10B981" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-600 text-sm">No hay datos</div>
          )}
        </EliteCard>

        <EliteCard>
          <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Gastos por Categoría</h3>
          {finances.charts.expenseByCategory.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={finances.charts.expenseByCategory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#F8FAFC', fontSize: '13px' }} />
                  <Bar dataKey="value" fill="#F43F5E" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-600 text-sm">No hay datos</div>
          )}
        </EliteCard>
      </div>
    </div>
  );
};

function KPICard({ label, value, subtext, valueColor, icon, iconBg }: {
  label: string; value: string; subtext?: string; valueColor: string; icon: React.ReactNode; iconBg: string;
}) {
  return (
    <EliteCard className="flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <p className={`text-xl font-bold mt-0.5 ${valueColor} truncate`}>{value}</p>
        {subtext && <p className="text-[10px] text-slate-500 mt-0.5">{subtext}</p>}
      </div>
    </EliteCard>
  );
}

export default DashboardPanel;
