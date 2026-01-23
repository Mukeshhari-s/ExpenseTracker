import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { 
  bankAPI, 
  transactionAPI 
} from '../services/api';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  ArrowUpCircle, 
  ArrowDownCircle,
  Filter,
  Download
} from 'lucide-react';
import { getUser } from '../utils/auth';

function BankManagement() {
  const user = getUser();
  const [banks, setBanks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showBankModal, setShowBankModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [bankForm, setBankForm] = useState({
    bank_name: '',
    account_number: '',
    account_type: 'Savings',
    balance: 0,
  });

  const [transactionForm, setTransactionForm] = useState({
    bank_account_id: '',
    type: 'expense',
    amount: '',
    category: '',
    source: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [filters, setFilters] = useState({
    type: '',
    bank_account_id: '',
    category: '',
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [banksRes, transactionsRes, categoriesRes] = await Promise.all([
        bankAPI.getAll(),
        transactionAPI.getAll(filters),
        transactionAPI.getCategories(),
      ]);

      setBanks(banksRes.data.accounts || []);
      setTransactions(transactionsRes.data.transactions || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBank = () => {
    setBankForm({
      bank_name: '',
      account_number: '',
      account_type: 'Savings',
      balance: 0,
    });
    setEditingBank(null);
    setShowBankModal(true);
  };

  const handleEditBank = (bank) => {
    setBankForm(bank);
    setEditingBank(bank);
    setShowBankModal(true);
  };

  const handleSaveBank = async (e) => {
    e.preventDefault();
    try {
      if (editingBank) {
        await bankAPI.update(editingBank.id, bankForm);
      } else {
        await bankAPI.add(bankForm);
      }
      setShowBankModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Error saving bank account');
    }
  };

  const handleDeleteBank = async (id) => {
    if (window.confirm('Are you sure you want to delete this bank account?')) {
      try {
        await bankAPI.delete(id);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.error || 'Error deleting bank account');
      }
    }
  };

  const handleAddTransaction = () => {
    setTransactionForm({
      bank_account_id: banks[0]?.id || '',
      type: 'expense',
      amount: '',
      category: '',
      source: '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
    });
    setEditingTransaction(null);
    setShowTransactionModal(true);
  };

  const handleEditTransaction = (transaction) => {
    setTransactionForm({
      bank_account_id: transaction.bank_account_id,
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category || '',
      source: transaction.source || '',
      notes: transaction.notes || '',
      date: transaction.date,
    });
    setEditingTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    try {
      if (editingTransaction) {
        await transactionAPI.update(editingTransaction.id, transactionForm);
      } else {
        await transactionAPI.add(transactionForm);
      }
      setShowTransactionModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Error saving transaction');
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionAPI.delete(id);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.error || 'Error deleting transaction');
      }
    }
  };

  const formatCurrency = (amount) => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥' };
    const symbol = symbols[user?.currency] || '$';
    return `${symbol}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading"><div className="spinner"></div></div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Bank Accounts & Transactions</h1>

        {/* Bank Accounts Section */}
        <div className="card mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Your Bank Accounts</h2>
            <button onClick={handleAddBank} className="btn-primary flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Add Bank</span>
            </button>
          </div>

          {banks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {banks.map((bank) => (
                <div key={bank.id} className="bg-gradient-to-br from-primary-500 to-primary-700 text-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm opacity-90">{bank.account_type}</p>
                      <h3 className="text-xl font-bold">{bank.bank_name}</h3>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleEditBank(bank)} className="p-1 hover:bg-white/20 rounded">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteBank(bank.id)} className="p-1 hover:bg-white/20 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm opacity-90 mb-2">****{bank.account_number.slice(-4)}</p>
                  <p className="text-3xl font-bold">{formatCurrency(bank.balance)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No bank accounts yet. Add one to get started!</p>
          )}
        </div>

        {/* Transactions Section */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Transactions</h2>
            <button onClick={handleAddTransaction} className="btn-primary flex items-center space-x-2" disabled={banks.length === 0}>
              <Plus className="w-5 h-5" />
              <span>Add Transaction</span>
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})} className="input-field">
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select value={filters.bank_account_id} onChange={(e) => setFilters({...filters, bank_account_id: e.target.value})} className="input-field">
              <option value="">All Banks</option>
              {banks.map((bank) => (
                <option key={bank.id} value={bank.id}>{bank.bank_name}</option>
              ))}
            </select>
            <select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})} className="input-field">
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Transaction List */}
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <ArrowDownCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {transaction.category || transaction.source || transaction.type}
                      </p>
                      <p className="text-sm text-gray-600">
                        {transaction.bank_name} • {formatDate(transaction.date)}
                      </p>
                      {transaction.notes && <p className="text-xs text-gray-500 mt-1">{transaction.notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className={`text-lg font-bold ${transaction.type === 'income' ? 'profit' : 'loss'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                    <button onClick={() => handleEditTransaction(transaction)} className="p-2 hover:bg-gray-200 rounded">
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button onClick={() => handleDeleteTransaction(transaction.id)} className="p-2 hover:bg-red-100 rounded">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No transactions found</p>
          )}
        </div>

        {/* Bank Modal */}
        {showBankModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">{editingBank ? 'Edit' : 'Add'} Bank Account</h3>
              <form onSubmit={handleSaveBank} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input type="text" value={bankForm.bank_name} onChange={(e) => setBankForm({...bankForm, bank_name: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input type="text" value={bankForm.account_number} onChange={(e) => setBankForm({...bankForm, account_number: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                  <select value={bankForm.account_type} onChange={(e) => setBankForm({...bankForm, account_type: e.target.value})} className="input-field">
                    <option value="Savings">Savings</option>
                    <option value="Current">Current</option>
                    <option value="Checking">Checking</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Balance</label>
                  <input type="number" step="0.01" value={bankForm.balance} onChange={(e) => setBankForm({...bankForm, balance: parseFloat(e.target.value) || 0})} className="input-field" />
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="flex-1 btn-primary">Save</button>
                  <button type="button" onClick={() => setShowBankModal(false)} className="flex-1 btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transaction Modal */}
        {showTransactionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">{editingTransaction ? 'Edit' : 'Add'} Transaction</h3>
              <form onSubmit={handleSaveTransaction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
                  <select value={transactionForm.bank_account_id} onChange={(e) => setTransactionForm({...transactionForm, bank_account_id: e.target.value})} className="input-field" required>
                    <option value="">Select Bank</option>
                    {banks.map((bank) => (
                      <option key={bank.id} value={bank.id}>{bank.bank_name} - {bank.account_type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={transactionForm.type} onChange={(e) => setTransactionForm({...transactionForm, type: e.target.value})} className="input-field" required>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input type="number" step="0.01" value={transactionForm.amount} onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})} className="input-field" required />
                </div>
                {transactionForm.type === 'expense' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input type="text" value={transactionForm.category} onChange={(e) => setTransactionForm({...transactionForm, category: e.target.value})} className="input-field" placeholder="e.g., Food, Transport, Entertainment" />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                    <input type="text" value={transactionForm.source} onChange={(e) => setTransactionForm({...transactionForm, source: e.target.value})} className="input-field" placeholder="e.g., Salary, Freelance" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={transactionForm.date} onChange={(e) => setTransactionForm({...transactionForm, date: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea value={transactionForm.notes} onChange={(e) => setTransactionForm({...transactionForm, notes: e.target.value})} className="input-field" rows="2"></textarea>
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="flex-1 btn-primary">Save</button>
                  <button type="button" onClick={() => setShowTransactionModal(false)} className="flex-1 btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default BankManagement;
