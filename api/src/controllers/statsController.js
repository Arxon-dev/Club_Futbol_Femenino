const { sequelize, Event, Attendance, Transaction } = require('../models');

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
