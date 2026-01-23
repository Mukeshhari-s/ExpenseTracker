import BankAccount from '../models/BankAccount.js';

// Get all bank accounts for user
export const getBankAccounts = async (req, res) => {
  try {
    const accounts = await BankAccount.find({ userId: req.user.userId }).sort({ createdAt: -1 });

    // Normalize for frontend (snake_case + id)
    const normalized = accounts.map((account) => ({
      id: account._id,
      bank_name: account.bankName,
      account_number: account.accountNumber,
      account_type: account.accountType,
      balance: account.balance,
      created_at: account.createdAt,
    }));

    res.json({ accounts: normalized });
  } catch (error) {
    console.error('Get bank accounts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add new bank account
export const addBankAccount = async (req, res) => {
  try {
    // Accept both camelCase and snake_case from client
    const bankName = req.body.bankName || req.body.bank_name;
    const accountNumber = req.body.accountNumber || req.body.account_number;
    const accountType = req.body.accountType || req.body.account_type || 'Savings';
    const balance = Number(req.body.balance ?? 0);

    if (!bankName || !accountNumber) {
      return res.status(400).json({ error: 'Please provide bank name and account number' });
    }

    const account = await BankAccount.create({
      userId: req.user.userId,
      bankName,
      accountNumber,
      accountType,
      balance
    });

    res.status(201).json({
      message: 'Bank account added successfully',
      account: {
        id: account._id,
        bank_name: account.bankName,
        account_number: account.accountNumber,
        account_type: account.accountType,
        balance: account.balance,
      }
    });
  } catch (error) {
    console.error('Add bank account error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update bank account
export const updateBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const bankName = req.body.bankName || req.body.bank_name;
    const accountNumber = req.body.accountNumber || req.body.account_number;
    const accountType = req.body.accountType || req.body.account_type;
    const balance = req.body.balance !== undefined ? Number(req.body.balance) : undefined;

    const account = await BankAccount.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      {
        bankName: bankName || undefined,
        accountNumber: accountNumber || undefined,
        accountType: accountType || undefined,
        balance: balance !== undefined ? balance : undefined
      },
      { new: true, runValidators: true }
    );

    if (!account) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    res.json({
      message: 'Bank account updated successfully',
      account: {
        id: account._id,
        bank_name: account.bankName,
        account_number: account.accountNumber,
        account_type: account.accountType,
        balance: account.balance,
      }
    });
  } catch (error) {
    console.error('Update bank account error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete bank account
export const deleteBankAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await BankAccount.findOneAndDelete({ _id: id, userId: req.user.userId });

    if (!account) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    res.json({ message: 'Bank account deleted successfully' });
  } catch (error) {
    console.error('Delete bank account error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get account summary
export const getAccountSummary = async (req, res) => {
  try {
    const accounts = await BankAccount.find({ userId: req.user.userId });
    
    const totalAccounts = accounts.length;
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

    res.json({
      totalAccounts,
      totalBalance,
      accounts: accounts.map((account) => ({
        id: account._id,
        bank_name: account.bankName,
        account_number: account.accountNumber,
        account_type: account.accountType,
        balance: account.balance,
      }))
    });
  } catch (error) {
    console.error('Get account summary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
