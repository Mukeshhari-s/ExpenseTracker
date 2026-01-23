import DematAccount from '../models/DematAccount.js';

// Get all demat accounts
export const getDematAccounts = async (req, res) => {
  try {
    const accounts = await DematAccount.find({ userId: req.user.userId }).sort({ createdAt: -1 });

    const normalized = accounts.map((account) => ({
      id: account._id,
      broker_name: account.brokerName,
      account_number: account.accountNumber,
      created_at: account.createdAt,
    }));

    res.json({ accounts: normalized });
  } catch (error) {
    console.error('Get demat accounts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add demat account
export const addDematAccount = async (req, res) => {
  try {
    const brokerName = req.body.brokerName || req.body.broker_name;
    const accountNumber = req.body.accountNumber || req.body.account_number;

    if (!brokerName || !accountNumber) {
      return res.status(400).json({ 
        error: 'Please provide broker name and account number' 
      });
    }

    const account = await DematAccount.create({
      userId: req.user.userId,
      brokerName,
      accountNumber
    });

    res.status(201).json({
      message: 'Demat account added successfully',
      account: {
        id: account._id,
        broker_name: account.brokerName,
        account_number: account.accountNumber,
      }
    });
  } catch (error) {
    console.error('Add demat account error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update demat account
export const updateDematAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const brokerName = req.body.brokerName || req.body.broker_name;
    const accountNumber = req.body.accountNumber || req.body.account_number;

    const account = await DematAccount.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      {
        brokerName: brokerName || undefined,
        accountNumber: accountNumber || undefined
      },
      { new: true, runValidators: true }
    );

    if (!account) {
      return res.status(404).json({ error: 'Demat account not found' });
    }

    res.json({
      message: 'Demat account updated successfully',
      account: {
        id: account._id,
        broker_name: account.brokerName,
        account_number: account.accountNumber,
      }
    });
  } catch (error) {
    console.error('Update demat account error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete demat account
export const deleteDematAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await DematAccount.findOneAndDelete({ _id: id, userId: req.user.userId });

    if (!account) {
      return res.status(404).json({ error: 'Demat account not found' });
    }

    res.json({ message: 'Demat account deleted successfully' });
  } catch (error) {
    console.error('Delete demat account error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
