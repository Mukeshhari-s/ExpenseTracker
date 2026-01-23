import Transaction from '../models/Transaction.js';
import BankAccount from '../models/BankAccount.js';

// Get all transactions
export const getTransactions = async (req, res) => {
  try {
    const { type, bankAccountId, startDate, endDate, category } = req.query;

    let query = { userId: req.user.userId };

    if (type) query.type = type;
    if (bankAccountId) query.bankAccountId = bankAccountId;
    if (category) query.category = category;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate('bankAccountId', 'bankName')
      .sort({ date: -1, createdAt: -1 });

    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add new transaction
export const addTransaction = async (req, res) => {
  try {
    const { bankAccountId, type, amount, category, source, notes, date } = req.body;

    if (!bankAccountId || !type || !amount || !date) {
      return res.status(400).json({ 
        error: 'Please provide bankAccountId, type, amount, and date' 
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either income or expense' });
    }

    // Verify bank account belongs to user
    const bankAccount = await BankAccount.findOne({ 
      _id: bankAccountId, 
      userId: req.user.userId 
    });

    if (!bankAccount) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    const transaction = await Transaction.create({
      userId: req.user.userId,
      bankAccountId,
      type,
      amount,
      category,
      source,
      notes,
      date: new Date(date)
    });

    // Update bank account balance
    const balanceChange = type === 'income' ? amount : -amount;
    await BankAccount.findByIdAndUpdate(
      bankAccountId,
      { $inc: { balance: balanceChange } }
    );

    res.status(201).json({
      message: 'Transaction added successfully',
      transaction
    });
  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update transaction
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { bankAccountId, type, amount, category, source, notes, date } = req.body;

    const transaction = await Transaction.findOne({ 
      _id: id, 
      userId: req.user.userId 
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Revert old balance change
    const oldBalanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount;
    await BankAccount.findByIdAndUpdate(
      transaction.bankAccountId,
      { $inc: { balance: oldBalanceChange } }
    );

    // Update transaction
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      {
        bankAccountId: bankAccountId || transaction.bankAccountId,
        type: type || transaction.type,
        amount: amount !== undefined ? amount : transaction.amount,
        category: category !== undefined ? category : transaction.category,
        source: source !== undefined ? source : transaction.source,
        notes: notes !== undefined ? notes : transaction.notes,
        date: date ? new Date(date) : transaction.date
      },
      { new: true }
    );

    // Apply new balance change
    const newBalanceChange = updatedTransaction.type === 'income' ? updatedTransaction.amount : -updatedTransaction.amount;
    await BankAccount.findByIdAndUpdate(
      updatedTransaction.bankAccountId,
      { $inc: { balance: newBalanceChange } }
    );

    res.json({
      message: 'Transaction updated successfully',
      transaction: updatedTransaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete transaction
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({ 
      _id: id, 
      userId: req.user.userId 
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Revert balance change
    const balanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount;
    await BankAccount.findByIdAndUpdate(
      transaction.bankAccountId,
      { $inc: { balance: balanceChange } }
    );

    await Transaction.findByIdAndDelete(id);

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get monthly summary
export const getMonthlySummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let startDate, endDate;
    
    if (month && year) {
      startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
    } else {
      // Current month
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
      const lastDay = new Date(currentYear, currentMonth, 0).getDate();
      endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${lastDay}`;
    }

    const income = await get(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM transactions 
       WHERE user_id = ? AND type = 'income' AND date BETWEEN ? AND ?`,
      [req.user.userId, startDate, endDate]
    );

    const expenses = await get(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM transactions 
       WHERE user_id = ? AND type = 'expense' AND date BETWEEN ? AND ?`,
      [req.user.userId, startDate, endDate]
    );

    const expensesByCategory = await all(
      `SELECT category, SUM(amount) as total, COUNT(*) as count
       FROM transactions 
       WHERE user_id = ? AND type = 'expense' AND date BETWEEN ? AND ?
       GROUP BY category
       ORDER BY total DESC`,
      [req.user.userId, startDate, endDate]
    );

    const expensesByBank = await all(
      `SELECT b.bank_name, SUM(t.amount) as total, COUNT(*) as count
       FROM transactions t
       LEFT JOIN bank_accounts b ON t.bank_account_id = b.id
       WHERE t.user_id = ? AND t.type = 'expense' AND t.date BETWEEN ? AND ?
       GROUP BY t.bank_account_id
       ORDER BY total DESC`,
      [req.user.userId, startDate, endDate]
    );

    res.json({
      period: { start: startDate, end: endDate },
      total_income: income.total,
      total_expenses: expenses.total,
      net_savings: income.total - expenses.total,
      expenses_by_category: expensesByCategory,
      expenses_by_bank: expensesByBank
    });
  } catch (error) {
    console.error('Get monthly summary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get expense categories
export const getCategories = async (req, res) => {
  try {
    const categories = await all(
      `SELECT DISTINCT category FROM transactions WHERE user_id = ? AND category IS NOT NULL ORDER BY category`,
      [req.user.userId]
    );
    res.json({ categories: categories.map(c => c.category) });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
