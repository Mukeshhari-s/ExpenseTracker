import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import DatePicker from './DatePicker';
import { 
  bankAPI, 
  transactionAPI,
  getApiErrorMessage
} from '../services/api';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  ArrowUpCircle, 
  ArrowDownCircle,
  ArrowLeftRight,
  Filter,
  Download
} from 'lucide-react';
import { getUser } from '../utils/auth';

function BankManagement() {
  const user = getUser();
  const getLocalDateString = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
  };
  const [banks, setBanks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
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
    bank_account_id: 'cash',
    to_bank_account_id: '',
    type: 'expense',
    amount: '',
    category: '',
    source: '',
    notes: '',
    date: getLocalDateString(),
  });

  const [filters, setFilters] = useState({
    type: '',
    bank_account_id: '',
    category: '',
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  // Prevent background scrolling when modals are open
  useEffect(() => {
    if (showBankModal || showTransactionModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    // Cleanup on unmount
    return () => document.body.classList.remove('modal-open');
  }, [showBankModal, showTransactionModal]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [banksRes, transactionsRes, categoriesRes] = await Promise.all([
        bankAPI.getAll(),
        transactionAPI.getAll(filters),
        transactionAPI.getCategories(),
      ]);

      setBanks(banksRes.data.accounts || []);
      setTransactions(transactionsRes.data.transactions || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (error) {
      setError(getApiErrorMessage(error, 'Error fetching bank data'));
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
      bank_account_id: banks.length > 0 ? banks[0].id : 'cash',
      to_bank_account_id: banks.length > 1 ? banks[1].id : '',
      type: 'expense',
      amount: '',
      category: '',
      source: '',
      notes: '',
      date: getLocalDateString(),
    });
    setEditingTransaction(null);
    setShowTransactionModal(true);
  };

  const handleEditTransaction = (transaction) => {
    setTransactionForm({
      bank_account_id: transaction.bank_account_id || 'cash',
      to_bank_account_id: transaction.to_bank_account_id || '',
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
      if (transactionForm.type === 'transfer') {
        if (!transactionForm.bank_account_id || !transactionForm.to_bank_account_id) {
          alert('Please select both From and To accounts for a transfer');
          return;
        }
        if (transactionForm.bank_account_id === 'cash') {
          alert('Transfers must use a bank account (not cash)');
          return;
        }
        if (transactionForm.bank_account_id === transactionForm.to_bank_account_id) {
          alert('From and To accounts must be different');
          return;
        }
      }

      const payload = {
        ...transactionForm,
        bank_account_id: transactionForm.bank_account_id === 'cash' ? null : transactionForm.bank_account_id,
        to_bank_account_id: transactionForm.type === 'transfer'
          ? transactionForm.to_bank_account_id
          : null,
      };
      if (editingTransaction) {
        await transactionAPI.update(editingTransaction.id, payload);
      } else {
        await transactionAPI.add(payload);
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
    const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-800 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading">
            <div className="spinner" />
          </div>
        ) : (
          <>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-100 mb-4 sm:mb-6">Bank Accounts & Transactions</h1>

        {/* Bank Accounts Section */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-gray-100">Your Bank Accounts</h2>
            <button onClick={handleAddBank} className="btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center">
              <Plus className="w-5 h-5" />
              <span>Add Bank</span>
            </button>
          </div>

          {banks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {banks.map((bank) => (
                <div key={bank.id} className={`${
                  bank.is_cash
                    ? 'bg-gradient-to-br from-amber-500 to-amber-700'
                    : 'bg-gradient-to-br from-blue-500 to-blue-700'
                } text-white p-4 sm:p-6 rounded-lg shadow-md`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm opacity-90 truncate">{bank.account_type}</p>
                      <h3 className="text-lg sm:text-xl font-bold truncate">{bank.bank_name}</h3>
                    </div>
                    {!bank.is_cash && (
                      <div className="flex space-x-1 sm:space-x-2 ml-2 flex-shrink-0">
                        <button onClick={() => handleEditBank(bank)} className="p-1.5 sm:p-1 hover:bg-white/20 rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteBank(bank.id)} className="p-1.5 sm:p-1 hover:bg-white/20 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm opacity-90 mb-2 truncate">{bank.is_cash ? 'Always Available' : `****${bank.account_number.slice(-4)}`}</p>
                  <p className="text-xl sm:text-2xl font-bold truncate">{formatCurrency(bank.balance)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8 text-sm">No bank accounts yet. Add one to get started!</p>
          )}
        </div>

        {/* Transactions Section */}
        <div className="card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-gray-100">Transactions</h2>
            <button onClick={handleAddTransaction} className="btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center">
              <Plus className="w-5 h-5" />
              <span>Add Transaction</span>
            </button>
          </div>

          {/* Transaction List */}
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === 'income'
                        ? 'bg-green-900/20'
                        : transaction.type === 'expense'
                        ? 'bg-red-900/20'
                        : 'bg-blue-900/20'
                    }`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpCircle className="w-5 h-5 text-green-600" />
                      ) : transaction.type === 'expense' ? (
                        <ArrowDownCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <ArrowLeftRight className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-100">
                        {transaction.type === 'transfer'
                          ? 'Transfer'
                          : transaction.category || transaction.source || transaction.type}
                      </p>
                      <p className="text-sm text-gray-300">
                        {transaction.type === 'transfer'
                          ? `${transaction.bank_name} → ${transaction.to_bank_name || 'Unknown'}`
                          : transaction.bank_name} • {formatDate(transaction.date)}
                      </p>
                      {transaction.notes && <p className="text-xs text-gray-400 mt-1">{transaction.notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className={`text-lg font-bold ${
                      transaction.type === 'income'
                        ? 'profit'
                        : transaction.type === 'expense'
                        ? 'loss'
                        : 'text-blue-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}{formatCurrency(transaction.amount)}
                    </div>
                    <button onClick={() => handleEditTransaction(transaction)} className="p-2 hover:bg-gray-700 rounded">
                      <Edit2 className="w-4 h-4 text-gray-300" />
                    </button>
                    <button onClick={() => handleDeleteTransaction(transaction.id)} className="p-2 hover:bg-red-100 rounded">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">No transactions found</p>
          )}
        </div>

        {/* Bank Modal */}
        {showBankModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-2xl bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
                <div className="bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-bold text-gray-100 mb-4">{editingBank ? 'Edit' : 'Add'} Bank Account</h3>
                  <form onSubmit={handleSaveBank} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Bank Name</label>
                      <input type="text" value={bankForm.bank_name} onChange={(e) => setBankForm({...bankForm, bank_name: e.target.value})} className="input-field" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Account Number</label>
                      <input type="text" value={bankForm.account_number} onChange={(e) => setBankForm({...bankForm, account_number: e.target.value})} className="input-field" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Account Type</label>
                      <select value={bankForm.account_type} onChange={(e) => setBankForm({...bankForm, account_type: e.target.value})} className="input-field">
                        <option value="Savings">Savings</option>
                        <option value="Current">Current</option>
                        <option value="Checking">Checking</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Initial Balance</label>
                      <input type="number" step="0.01" value={bankForm.balance} onChange={(e) => setBankForm({...bankForm, balance: parseFloat(e.target.value) || 0})} className="input-field" />
                    </div>
                  </form>
                </div>
                <div className="bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-3">
                  <button type="submit" onClick={handleSaveBank} className="flex-1 btn-primary">Save</button>
                  <button type="button" onClick={() => setShowBankModal(false)} className="flex-1 btn-secondary">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Modal */}
        {showTransactionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-visible rounded-2xl bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4 relative overflow-visible">
                  <h3 className="text-lg font-bold text-gray-100 mb-4">{editingTransaction ? 'Edit' : 'Add'} Transaction</h3>
                  <form onSubmit={handleSaveTransaction} className="space-y-4 relative">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        {transactionForm.type === 'transfer' ? 'From Account' : 'Bank Account'}
                      </label>
                      <select value={transactionForm.bank_account_id} onChange={(e) => setTransactionForm({...transactionForm, bank_account_id: e.target.value})} className="input-field">
                        <option value="cash">Cash (Default)</option>
                        {banks.filter(b => !b.is_cash).map((bank) => (
                          <option key={bank.id} value={bank.id}>{bank.bank_name} - {bank.account_type}</option>
                        ))}
                      </select>
                    </div>
                    {transactionForm.type === 'transfer' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">To Account</label>
                        <select value={transactionForm.to_bank_account_id} onChange={(e) => setTransactionForm({...transactionForm, to_bank_account_id: e.target.value})} className="input-field" required>
                          <option value="">Select account</option>
                          <option value="cash">Cash</option>
                          {banks.filter(b => !b.is_cash).map((bank) => (
                            <option key={bank.id} value={bank.id}>{bank.bank_name} - {bank.account_type}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Type</label>
                      <select value={transactionForm.type} onChange={(e) => setTransactionForm({...transactionForm, type: e.target.value})} className="input-field" required>
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                        <option value="transfer">Transfer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Amount</label>
                      <input type="number" step="0.01" value={transactionForm.amount} onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})} className="input-field" required />
                    </div>
                    {transactionForm.type === 'expense' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Category</label>
                        <input type="text" value={transactionForm.category} onChange={(e) => setTransactionForm({...transactionForm, category: e.target.value})} className="input-field" placeholder="e.g., Food, Transport, Entertainment" />
                      </div>
                    ) : transactionForm.type === 'income' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Source</label>
                        <input type="text" value={transactionForm.source} onChange={(e) => setTransactionForm({...transactionForm, source: e.target.value})} className="input-field" placeholder="e.g., Salary, Freelance" />
                      </div>
                    ) : null}
                    <div className="relative z-10">
                      <label className="block text-sm font-medium text-gray-200 mb-2">Date</label>
                      <DatePicker 
                        value={transactionForm.date} 
                        onChange={(date) => setTransactionForm({...transactionForm, date})}
                        label="Select transaction date"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Notes (Optional)</label>
                      <textarea value={transactionForm.notes} onChange={(e) => setTransactionForm({...transactionForm, notes: e.target.value})} className="input-field" rows="2"></textarea>
                    </div>
                  </form>
                </div>
                <div className="bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-3">
                  <button type="submit" onClick={handleSaveTransaction} className="flex-1 btn-primary">Save</button>
                  <button type="button" onClick={() => setShowTransactionModal(false)} className="flex-1 btn-secondary">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </>
  );
}

export default BankManagement;
