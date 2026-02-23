import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// @ts-ignore
const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface StatsData {
  attendance: {
    totalEvents: number;
    globalStats: {
      ATTENDING: number;
      NOT_ATTENDING: number;
      PENDING: number;
    }
  };
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

const COLORS = ['#10B981', '#EF4444', '#F59E0B']; // Green, Red, Amber

export const DashboardPanel: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      // Using the valid persistent DEV_ADMIN_TOKEN from eventService
      const FAKE_ADMIN_TOKEN = localStorage.getItem('token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjRkYWRhNWZhLWIzNDctNDA5Yy1hZjY2LWEyMjk1M2ZhOTM2NyIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc3MTcwODE4MCwiZXhwIjoxODAzMjY1NzgwfQ.u276z2WQf1VFurEyoT2wxYthu31NUPginGV067JG28w';

      try {
        const [attRes, finRes] = await Promise.all([
          fetch(`${BASE_API_URL}/stats/attendance`, {
            headers: { 'Authorization': `Bearer ${FAKE_ADMIN_TOKEN}` }
          }),
          fetch(`${BASE_API_URL}/stats/finances`, {
            headers: { 'Authorization': `Bearer ${FAKE_ADMIN_TOKEN}` }
          })
        ]);

        if (!attRes.ok || !finRes.ok) {
          throw new Error('Error fetching detailed statistics');
        }

        const attendanceData = await attRes.json();
        const financeData = await finRes.json();

        setStats({
          attendance: attendanceData,
          finances: financeData
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando Estadísticas...</div>;
  }

  if (error || !stats) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  const { attendance, finances } = stats;

  const attendanceChartData = [
    { name: 'Asistirán', value: attendance.globalStats.ATTENDING },
    { name: 'No Asistirán', value: attendance.globalStats.NOT_ATTENDING },
    { name: 'Pendientes', value: attendance.globalStats.PENDING }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Balance Total</p>
            <p className={`text-3xl font-bold mt-1 ${finances.summary.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {finances.summary.currentBalance.toFixed(2)}€
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            📊
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Ingresos Totales</p>
            <p className="text-3xl font-bold mt-1 text-emerald-600">
              +{finances.summary.totalIncome.toFixed(2)}€
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            📈
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Eventos</p>
            <p className="text-3xl font-bold mt-1 text-gray-900">
              {attendance.totalEvents}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            🗓️
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Attendance Breakdown */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Desglose de Asistencias</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {attendanceChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Distribution */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Ingresos por Categoría</h2>
          {finances.charts.incomeByCategory.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={finances.charts.incomeByCategory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                  <Tooltip
                      cursor={{fill: '#F3F4F6'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="h-80 flex items-center justify-center text-gray-400">
               No hay ingresos suficientes para graficar
             </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DashboardPanel;
