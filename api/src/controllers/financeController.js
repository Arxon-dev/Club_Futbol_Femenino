const { Transaction, User } = require('../models');

// Get all transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role']
        }
      ],
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });

    // Calculate balance
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      const amount = parseFloat(t.amount);
      if (t.type === 'INCOME') totalIncome += amount;
      if (t.type === 'EXPENSE') totalExpense += amount;
    });

    const balance = totalIncome - totalExpense;

    res.json({
      transactions,
      summary: {
        totalIncome,
        totalExpense,
        balance
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// Create a new transaction
exports.createTransaction = async (req, res) => {
  try {
    const { type, category, amount, description, date, userId } = req.body;

    const transaction = await Transaction.create({
      type,
      category,
      amount,
      description,
      date: date || new Date(),
      userId: userId || null
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

// Update a transaction
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, category, amount, description, date, userId } = req.body;

    const transaction = await Transaction.findByPk(id);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

    await transaction.update({
      type,
      category,
      amount,
      description,
      date,
      userId: userId || null
    });

    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findByPk(id);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

    await transaction.destroy();
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};

// Get transactions for a specific user
exports.getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;

    // Security check: if user is PLAYER, they can only request their own finances
    if (req.userRole === 'PLAYER' && req.userId !== userId) {
      return res.status(403).json({ error: 'No autorizado para ver las finanzas de otro jugador' });
    }

    const transactions = await Transaction.findAll({
      where: { userId },
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      const amount = parseFloat(t.amount);
      if (t.type === 'INCOME') totalIncome += amount;
      if (t.type === 'EXPENSE') totalExpense += amount;
    });

    const balance = totalIncome - totalExpense;

    res.json({
      transactions,
      summary: {
        totalIncome,
        totalExpense,
        balance
      }
    });

  } catch (error) {
    console.error('Error fetching user transactions:', error);
    res.status(500).json({ error: 'Failed to fetch user transactions' });
  }
};
