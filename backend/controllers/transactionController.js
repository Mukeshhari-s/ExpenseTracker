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
    if (bankAccountId) {
      if (bankAccountId === 'cash') {
        query.bankAccountId = null;
      } else {
        query.bankAccountId = bankAccountId;
      }
    }
    if (category) query.category = category;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    let transactionQuery = Transaction.find(query)
      .populate('bankAccountId', 'bankName accountType')
      .populate('toBankAccountId', 'bankName accountType')
      .sort({ date: -1, createdAt: -1 });

    // Apply limit if provided
    if (limit) {
      transactionQuery = transactionQuery.limit(parseInt(limit));
    }

    const transactions = await transactionQuery;

    // Normalize response for frontend expectations
    const normalized = transactions.map((tx) => ({
      id: tx._id,
      bank_account_id: tx.bankAccountId?._id || null,
      bank_name: tx.bankAccountId?.bankName || 'Cash',
      bank_account_type: tx.bankAccountId?.accountType || 'Cash',
      to_bank_account_id: tx.toBankAccountId?._id || null,
      to_bank_name: tx.toBankAccountId?.bankName || null,
      to_bank_account_type: tx.toBankAccountId?.accountType || null,
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
    const rawBankAccountId = req.body.bankAccountId || req.body.bank_account_id;
    const bankAccountId = rawBankAccountId && rawBankAccountId !== 'cash' ? rawBankAccountId : null;
    const type = req.body.type;
    const amount = Number(req.body.amount);
    const category = req.body.category;
    const source = req.body.source;
    const notes = req.body.notes;
    const date = req.body.date;
    const rawToBankAccountId = req.body.toBankAccountId || req.body.to_bank_account_id;
    const toBankAccountId = rawToBankAccountId && rawToBankAccountId !== 'cash' ? rawToBankAccountId : null;

    if (!type || Number.isNaN(amount) || !date) {
      return res.status(400).json({ 
        error: 'Please provide type, amount, and date' 
      });
    }

    if (!['income', 'expense', 'transfer'].includes(type)) {
      return res.status(400).json({ error: 'Type must be income, expense, or transfer' });
    }

    if (type === 'transfer') {
      if (!bankAccountId || !toBankAccountId) {
        return res.status(400).json({ error: 'Transfer requires from and to bank accounts' });
      }
      if (bankAccountId === toBankAccountId) {
        return res.status(400).json({ error: 'Transfer accounts must be different' });
      }

      const [fromAccount, toAccount] = await Promise.all([
        BankAccount.findOne({ _id: bankAccountId, userId: req.user.userId }),
        BankAccount.findOne({ _id: toBankAccountId, userId: req.user.userId })
      ]);

      if (!fromAccount || !toAccount) {
        return res.status(404).json({ error: 'Bank account not found' });
      }
    } else if (bankAccountId) {
      // Verify bank account belongs to user
      const bankAccount = await BankAccount.findOne({ 
        _id: bankAccountId, 
        userId: req.user.userId 
      });

      if (!bankAccount) {
        return res.status(404).json({ error: 'Bank account not found' });
      }
    }

    const transaction = await Transaction.create({
      userId: req.user.userId,
      bankAccountId,
      toBankAccountId: type === 'transfer' ? toBankAccountId : null,
      type,
      amount,
      category,
      source,
      notes,
      date: new Date(date)
    });

    if (type === 'transfer') {
      await BankAccount.findByIdAndUpdate(
        bankAccountId,
        { $inc: { balance: -amount } }
      );
      await BankAccount.findByIdAndUpdate(
        toBankAccountId,
        { $inc: { balance: amount } }
      );
    } else if (bankAccountId) {
      // Update bank account balance
      const balanceChange = type === 'income' ? amount : -amount;
      await BankAccount.findByIdAndUpdate(
        bankAccountId,
        { $inc: { balance: balanceChange } }
      );
    }

    res.status(201).json({
      message: 'Transaction added successfully',
      transaction: {
        id: transaction._id,
        bank_account_id: transaction.bankAccountId,
        to_bank_account_id: transaction.toBankAccountId,
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
    const hasBankAccountId = Object.prototype.hasOwnProperty.call(req.body, 'bankAccountId') ||
      Object.prototype.hasOwnProperty.call(req.body, 'bank_account_id');
    const rawBankAccountId = req.body.bankAccountId || req.body.bank_account_id;
    const bankAccountId = hasBankAccountId
      ? (rawBankAccountId && rawBankAccountId !== 'cash' ? rawBankAccountId : null)
      : undefined;
    const hasToBankAccountId = Object.prototype.hasOwnProperty.call(req.body, 'toBankAccountId') ||
      Object.prototype.hasOwnProperty.call(req.body, 'to_bank_account_id');
    const rawToBankAccountId = req.body.toBankAccountId || req.body.to_bank_account_id;
    const toBankAccountId = hasToBankAccountId
      ? (rawToBankAccountId && rawToBankAccountId !== 'cash' ? rawToBankAccountId : null)
      : undefined;
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

    const nextType = type || transaction.type;
    const nextAmount = amount !== undefined ? amount : transaction.amount;
    const nextBankAccountId = bankAccountId === undefined ? transaction.bankAccountId : bankAccountId;
    const nextToBankAccountId = toBankAccountId === undefined ? transaction.toBankAccountId : toBankAccountId;

    if (!['income', 'expense', 'transfer'].includes(nextType)) {
      return res.status(400).json({ error: 'Type must be income, expense, or transfer' });
    }

    if (nextType === 'transfer') {
      if (!nextBankAccountId || !nextToBankAccountId) {
        return res.status(400).json({ error: 'Transfer requires from and to bank accounts' });
      }
      if (String(nextBankAccountId) === String(nextToBankAccountId)) {
        return res.status(400).json({ error: 'Transfer accounts must be different' });
      }

      const [fromAccount, toAccount] = await Promise.all([
        BankAccount.findOne({ _id: nextBankAccountId, userId: req.user.userId }),
        BankAccount.findOne({ _id: nextToBankAccountId, userId: req.user.userId })
      ]);

      if (!fromAccount || !toAccount) {
        return res.status(404).json({ error: 'Bank account not found' });
      }
    } else if (nextBankAccountId) {
      const bankAccount = await BankAccount.findOne({
        _id: nextBankAccountId,
        userId: req.user.userId
      });

      if (!bankAccount) {
        return res.status(404).json({ error: 'Bank account not found' });
      }
    }

    if (transaction.type === 'transfer') {
      if (transaction.bankAccountId) {
        await BankAccount.findByIdAndUpdate(
          transaction.bankAccountId,
          { $inc: { balance: transaction.amount } }
        );
      }
      if (transaction.toBankAccountId) {
        await BankAccount.findByIdAndUpdate(
          transaction.toBankAccountId,
          { $inc: { balance: -transaction.amount } }
        );
      }
    } else if (transaction.bankAccountId) {
      // Revert old balance change
      const oldBalanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount;
      await BankAccount.findByIdAndUpdate(
        transaction.bankAccountId,
        { $inc: { balance: oldBalanceChange } }
      );
    }

    // Update transaction
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      {
        bankAccountId: nextBankAccountId,
        toBankAccountId: nextType === 'transfer' ? nextToBankAccountId : null,
        type: nextType,
        amount: nextAmount,
        category: category !== undefined ? category : transaction.category,
        source: source !== undefined ? source : transaction.source,
        notes: notes !== undefined ? notes : transaction.notes,
        date: date ? new Date(date) : transaction.date
      },
      { new: true }
    );

    if (updatedTransaction.type === 'transfer') {
      if (updatedTransaction.bankAccountId) {
        await BankAccount.findByIdAndUpdate(
          updatedTransaction.bankAccountId,
          { $inc: { balance: -updatedTransaction.amount } }
        );
      }
      if (updatedTransaction.toBankAccountId) {
        await BankAccount.findByIdAndUpdate(
          updatedTransaction.toBankAccountId,
          { $inc: { balance: updatedTransaction.amount } }
        );
      }
    } else if (updatedTransaction.bankAccountId) {
      // Apply new balance change
      const newBalanceChange = updatedTransaction.type === 'income' ? updatedTransaction.amount : -updatedTransaction.amount;
      await BankAccount.findByIdAndUpdate(
        updatedTransaction.bankAccountId,
        { $inc: { balance: newBalanceChange } }
      );
    }

    res.json({
      message: 'Transaction updated successfully',
      transaction: {
        id: updatedTransaction._id,
        bank_account_id: updatedTransaction.bankAccountId,
        to_bank_account_id: updatedTransaction.toBankAccountId,
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

    if (transaction.type === 'transfer') {
      if (transaction.bankAccountId) {
        await BankAccount.findByIdAndUpdate(
          transaction.bankAccountId,
          { $inc: { balance: transaction.amount } }
        );
      }
      if (transaction.toBankAccountId) {
        await BankAccount.findByIdAndUpdate(
          transaction.toBankAccountId,
          { $inc: { balance: -transaction.amount } }
        );
      }
    } else if (transaction.bankAccountId) {
      // Revert balance change
      const balanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount;
      await BankAccount.findByIdAndUpdate(
        transaction.bankAccountId,
        { $inc: { balance: balanceChange } }
      );
    }

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

    const filteredTransactions = await Transaction.find({ userId: req.user.userId, date: { $gte: startDateObj, $lte: endDateObj } });
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

    // Count total transactions
    const totalTransactions = await Transaction.countDocuments(userMatch);

    console.log(`[MONTHLY SUMMARY] UserId: ${req.user.userId}, Income: ${incomeTotal}, Expenses: ${expenseTotal}, Transactions: ${totalTransactions}`);

    res.json({
      period: { start: startDate, end: endDate },
      total_income: incomeTotal,
      total_expenses: expenseTotal,
      net_savings: incomeTotal - expenseTotal,
      total_transactions: totalTransactions,
      expenses_by_category: expensesByCategory.map((c) => ({
        category: c._id || 'Uncategorized',
        total: c.total,
        count: c.count,
      })),
      expenses_by_bank: expensesByBank.map((b) => ({
        bank_account_id: b._id,
        bank_name: b.bank?.bankName || 'Cash',
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
