const { sequelize, Event, Attendance, Transaction, User, Profile, Match } = require('../models');
const { Op } = require('sequelize');

// Obtener estadísticas generales para el Dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Finance summary
    const transactions = await Transaction.findAll();
    let totalIncome = 0, totalExpense = 0;
    const incomeByCategory = {}, expenseByCategory = {};

    transactions.forEach(t => {
      const amount = parseFloat(t.amount);
      const cat = t.category || 'Otros';
      if (t.type === 'INCOME') {
        totalIncome += amount;
        incomeByCategory[cat] = (incomeByCategory[cat] || 0) + amount;
      } else if (t.type === 'EXPENSE') {
        totalExpense += amount;
        expenseByCategory[cat] = (expenseByCategory[cat] || 0) + amount;
      }
    });

    const parseCategoryArray = (obj) =>
      Object.entries(obj).map(([name, value]) => ({ name, value }));

    // 2. Roster count
    const playerCount = await User.count({ where: { role: 'PLAYER' } });
    const coachCount = await User.count({ where: { role: 'COACH' } });

    // 3. Next match
    let nextMatch = null;
    try {
      nextMatch = await Match.findOne({
        where: { date: { [Op.gte]: new Date() } },
        order: [['date', 'ASC']]
      });
    } catch { /* Match table might not exist yet */ }

    // 4. Recent matches (last 5)
    let recentMatches = [];
    try {
      recentMatches = await Match.findAll({
        where: { date: { [Op.lt]: new Date() } },
        order: [['date', 'DESC']],
        limit: 5
      });
    } catch { /* ok */ }

    // 5. Attendance stats
    let attendanceStats = { ATTENDING: 0, NOT_ATTENDING: 0, PENDING: 0, totalEvents: 0 };
    try {
      attendanceStats.totalEvents = await Event.count();
      const attendances = await Attendance.findAll({
        attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['status']
      });
      attendances.forEach(r => {
        const s = r.status;
        if (attendanceStats[s] !== undefined) attendanceStats[s] = parseInt(r.get('count'), 10);
      });
    } catch { /* ok */ }

    res.json({
      finances: {
        summary: { totalIncome, totalExpense, currentBalance: totalIncome - totalExpense },
        charts: {
          incomeByCategory: parseCategoryArray(incomeByCategory),
          expenseByCategory: parseCategoryArray(expenseByCategory)
        }
      },
      roster: { playerCount, coachCount, total: playerCount + coachCount },
      nextMatch: nextMatch ? {
        opponentName: nextMatch.opponentName,
        date: nextMatch.date,
        time: nextMatch.time,
        location: nextMatch.location,
        competition: nextMatch.competition
      } : null,
      recentMatches: recentMatches.map(m => ({
        opponentName: m.opponentName, date: m.date, result: m.result, competition: m.competition
      })),
      attendance: attendanceStats
    });
  } catch (error) {
    console.error('Error getDashboardStats:', error);
    res.status(500).json({ message: 'Error al obtener stats del dashboard' });
  }
};

// Obtener estadísticas de Asistencia
exports.getAttendanceStats = async (req, res) => {
  try {
    // Total de eventos
    const totalEvents = await Event.count();

    // Conteo global de asistencias por estado (ATTENDING, NOT_ATTENDING, PENDING)
    const attendances = await Attendance.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Formatear la respuesta { ATTENDING: X, NOT_ATTENDING: Y, PENDING: Z }
    const globalStats = {
      ATTENDING: 0,
      NOT_ATTENDING: 0,
      PENDING: 0
    };

    attendances.forEach((record) => {
      const status = record.status;
      const count = parseInt(record.get('count'), 10);
      if (globalStats[status] !== undefined) {
        globalStats[status] = count;
      }
    });

    res.status(200).json({
      totalEvents,
      globalStats
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de asistencia:', error);
    res.status(500).json({ message: 'Error interno al obtener estadísticas de asistencia' });
  }
};

// Obtener estadísticas de Tesorería (Finanzas)
exports.getFinanceStats = async (req, res) => {
  try {
    const transactions = await Transaction.findAll();

    let totalIncome = 0;
    let totalExpense = 0;

    // Agrupación de ingresos por categoría
    const incomeByCategory = {};
    // Agrupación de gastos por categoría
    const expenseByCategory = {};

    transactions.forEach(t => {
      const amount = parseFloat(t.amount);
      const cat = t.category || 'Otros';

      if (t.type === 'INCOME') {
        totalIncome += amount;
        incomeByCategory[cat] = (incomeByCategory[cat] || 0) + amount;
      } else if (t.type === 'EXPENSE') {
        totalExpense += amount;
        expenseByCategory[cat] = (expenseByCategory[cat] || 0) + amount;
      }
    });

    const currentBalance = totalIncome - totalExpense;

    // Convert input objects to array form for Recharts e.g. [{ name: 'Cuotas', value: 100 }]
    const parseCategoryArray = (obj) => {
      return Object.entries(obj).map(([name, value]) => ({ name, value }));
    };

    res.status(200).json({
      summary: {
        totalIncome,
        totalExpense,
        currentBalance
      },
      charts: {
        incomeByCategory: parseCategoryArray(incomeByCategory),
        expenseByCategory: parseCategoryArray(expenseByCategory)
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de finanzas:', error);
    res.status(500).json({ message: 'Error interno al obtener estadísticas de finanzas' });
  }
};
