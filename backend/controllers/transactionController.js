import Transaction from '../models/Transaction.js';
import BankAccount from '../models/BankAccount.js';
import mongoose from 'mongoose';

// Get all transactions
export const getTransactions = async (req, res) => {
  try {
    const { type, startDate, endDate, category, limit } = req.query;
    const bankAccountId = req.query.bankAccountId || req.query.bank_account_id;

    let query = { userId: req.user.userId };

    if (type) query.type = type;
    if (bankAccountId) query.bankAccountId = bankAccountId;
    if (category) query.category = category;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    let transactionQuery = Transaction.find(query)
      .populate('bankAccountId', 'bankName accountType')
      .sort({ date: -1, createdAt: -1 });

    // Apply limit if provided
    if (limit) {
      transactionQuery = transactionQuery.limit(parseInt(limit));
    }

    const transactions = await transactionQuery;

    // Normalize response for frontend expectations
    const normalized = transactions.map((tx) => ({
      id: tx._id,
      bank_account_id: tx.bankAccountId?._id,
      bank_name: tx.bankAccountId?.bankName,
      bank_account_type: tx.bankAccountId?.accountType,
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      source: tx.source,
      notes: tx.notes,
      date: tx.date,
    }));

    res.json({ transactions: normalized });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add new transaction
export const addTransaction = async (req, res) => {
  try {
    // Accept camelCase or snake_case
    const bankAccountId = req.body.bankAccountId || req.body.bank_account_id;
    const type = req.body.type;
    const amount = Number(req.body.amount);
    const category = req.body.category;
    const source = req.body.source;
    const notes = req.body.notes;
    const date = req.body.date;

    if (!bankAccountId || !type || Number.isNaN(amount) || !date) {
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
      transaction: {
        id: transaction._id,
        bank_account_id: transaction.bankAccountId,
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        source: transaction.source,
        notes: transaction.notes,
        date: transaction.date,
      }
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
    const bankAccountId = req.body.bankAccountId || req.body.bank_account_id;
    const { type, category, source, notes, date } = req.body;
    const amount = req.body.amount !== undefined ? Number(req.body.amount) : undefined;

    const transaction = await Transaction.findOne({ 
      _id: id, 
      userId: req.user.userId 
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (amount !== undefined && Number.isNaN(amount)) {
      return res.status(400).json({ error: 'Amount must be a number' });
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
      transaction: {
        id: updatedTransaction._id,
        bank_account_id: updatedTransaction.bankAccountId,
        type: updatedTransaction.type,
        amount: updatedTransaction.amount,
        category: updatedTransaction.category,
        source: updatedTransaction.source,
        notes: updatedTransaction.notes,
        date: updatedTransaction.date,
      }
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
      // Calculate last day of the month (month is 1-indexed from API)
      const lastDay = new Date(year, month, 0).getDate();
      endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    } else {
      // Current month
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // 1-indexed
      startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
      // Calculate last day of current month (use next month's day 0)
      const lastDay = new Date(currentYear, currentMonth, 0).getDate();
      endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    }

    const startDateObj = new Date(`${startDate}T00:00:00Z`);
    const endDateObj = new Date(`${endDate}T23:59:59Z`);
    
    console.log(`[MONTHLY SUMMARY] Date range: ${startDate} to ${endDate}`);
    console.log(`[MONTHLY SUMMARY] Start: ${startDateObj.toISOString()}, End: ${endDateObj.toISOString()}`);

    // Convert userId to ObjectId for aggregate queries
    const userObjectId = new mongoose.Types.ObjectId(req.user.userId);

    // Only include transactions linked to bank accounts
    const userMatch = { 
      userId: userObjectId, 
      bankAccountId: { $exists: true, $ne: null },
      date: { 
        $gte: startDateObj, 
        $lte: endDateObj
      } 
    };

    // Debug: Check total transactions for this user
    const allTransactions = await Transaction.find({ userId: req.user.userId }).sort({ date: -1 });
    console.log(`[MONTHLY SUMMARY] Total transactions for user: ${allTransactions.length}`);
    allTransactions.slice(0, 3).forEach(tx => {
      console.log(`  - Date: ${tx.date.toISOString()}, Type: ${tx.type}, Amount: ${tx.amount}, BankId: ${tx.bankAccountId || 'N/A'}`);
    });

    const filteredTransactions = await Transaction.find({ userId: req.user.userId, bankAccountId: { $exists: true, $ne: null }, date: { $gte: startDateObj, $lte: endDateObj } });
    console.log(`[MONTHLY SUMMARY] Bank transactions for date range: ${filteredTransactions.length}`);

    const [incomeAgg, expenseAgg, expensesByCategory, expensesByBank] = await Promise.all([
      Transaction.aggregate([
        { $match: { ...userMatch, type: 'income' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { ...userMatch, type: 'expense' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { ...userMatch, type: 'expense' } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ]),
      Transaction.aggregate([
        { $match: { ...userMatch, type: 'expense' } },
        { $group: { _id: '$bankAccountId', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $lookup: { from: 'bankaccounts', localField: '_id', foreignField: '_id', as: 'bank' } },
        { $unwind: { path: '$bank', preserveNullAndEmptyArrays: true } },
        { $sort: { total: -1 } }
      ]),
    ]);

    const incomeTotal = incomeAgg[0]?.total || 0;
    const expenseTotal = expenseAgg[0]?.total || 0;

    console.log(`[MONTHLY SUMMARY] UserId: ${req.user.userId}, Income: ${incomeTotal}, Expenses: ${expenseTotal}`);

    res.json({
      period: { start: startDate, end: endDate },
      total_income: incomeTotal,
      total_expenses: expenseTotal,
      net_savings: incomeTotal - expenseTotal,
      expenses_by_category: expensesByCategory.map((c) => ({
        category: c._id || 'Uncategorized',
        total: c.total,
        count: c.count,
      })),
      expenses_by_bank: expensesByBank.map((b) => ({
        bank_account_id: b._id,
        bank_name: b.bank?.bankName,
        total: b.total,
        count: b.count,
      }))
    });
  } catch (error) {
    console.error('Get monthly summary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get expense categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Transaction.distinct('category', { userId: req.user.userId, category: { $ne: null } });
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
