import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import StockSearch from './StockSearch';
import DatePicker from './DatePicker';
import { 
  investmentAPI, 
  dematAPI, 
  stockAPI,
  getApiErrorMessage
} from '../services/api';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Building2,
  X
} from 'lucide-react';
import { getUser } from '../utils/auth';

function Portfolio() {
  const user = getUser();
  const [dematAccounts, setDematAccounts] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  const [showDematModal, setShowDematModal] = useState(false);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [editingDemat, setEditingDemat] = useState(null);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [showStockSearch, setShowStockSearch] = useState(false);

  const [dematForm, setDematForm] = useState({
    broker_name: '',
    account_number: '',
  });

  const [investmentForm, setInvestmentForm] = useState({
    demat_account_id: '',
    stock_symbol: '',
    stock_name: '',
    quantity: '',
    buy_price: '',
    buy_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Prevent background scrolling when modals are open
  useEffect(() => {
    if (showDematModal || showInvestmentModal || showStockSearch) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    // Cleanup on unmount
    return () => document.body.classList.remove('modal-open');
  }, [showDematModal, showInvestmentModal, showStockSearch]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [dematRes, portfolioRes] = await Promise.all([
        dematAPI.getAll(),
        investmentAPI.getPortfolioSummary(),
      ]);

      setDematAccounts(dematRes.data.accounts || []);
      setPortfolio(portfolioRes.data);
    } catch (error) {
      setError(getApiErrorMessage(error, 'Error loading portfolio'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleAddDemat = () => {
    setDematForm({ broker_name: '', account_number: '' });
    setEditingDemat(null);
    setShowDematModal(true);
  };

  const handleSaveDemat = async (e) => {
    e.preventDefault();
    try {
      if (editingDemat) {
        await dematAPI.update(editingDemat.id, dematForm);
      } else {
        await dematAPI.add(dematForm);
      }
      setShowDematModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Error saving demat account');
    }
  };

  const handleDeleteDemat = async (id) => {
    if (window.confirm('Are you sure? This will also delete all investments in this account.')) {
      try {
        await dematAPI.delete(id);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.error || 'Error deleting demat account');
      }
    }
  };

  const handleAddInvestment = () => {
    setInvestmentForm({
      demat_account_id: dematAccounts[0]?.id || '',
      stock_symbol: '',
      stock_name: '',
      quantity: '',
      buy_price: '',
      buy_date: new Date().toISOString().split('T')[0],
    });
    setEditingInvestment(null);
    setShowInvestmentModal(true);
  };

  const handleStockSelected = (stock) => {
    setInvestmentForm((prev) => ({
      ...prev,
      stock_symbol: stock.symbol || prev.stock_symbol,
      stock_name: stock.name || prev.stock_name,
      buy_price: stock.price ?? prev.buy_price,
    }));
    setShowStockSearch(false);
  };

  const handleSaveInvestment = async (e) => {
    e.preventDefault();
    try {
      if (editingInvestment) {
        await investmentAPI.update(editingInvestment.id, investmentForm);
      } else {
        await investmentAPI.add(investmentForm);
      }
      setShowInvestmentModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Error saving investment');
    }
  };

  const handleDeleteInvestment = async (holding) => {
    if (window.confirm(`Delete all ${holding.stock_name} holdings?`)) {
      try {
        // Delete all investments for this stock
        for (const inv of holding.investments) {
          await investmentAPI.delete(inv.id);
        }
        fetchData();
      } catch (error) {
        alert(error.response?.data?.error || 'Error deleting investment');
      }
    }
  };

  const formatCurrency = (amount) => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥' };
    const symbol = symbols[user?.currency] || '$';
    return `${symbol}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const totalProfitLoss = portfolio?.total_profit_loss || 0;
  const profitLossPercent = portfolio?.profit_loss_percentage || 0;
  const isProfit = totalProfitLoss >= 0;

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
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-100">Investment Portfolio</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary flex items-center space-x-2 whitespace-nowrap"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Prices</span>
          </button>
        </div>

        {/* Demat Accounts */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-gray-100">Demat Accounts</h2>
            <button onClick={handleAddDemat} className="btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center">
              <Plus className="w-5 h-5" />
              <span>Add Demat Account</span>
            </button>
          </div>

          {dematAccounts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {dematAccounts.map((demat) => (
                <div key={demat.id} className="bg-gradient-to-br from-green-500 to-green-700 text-white p-4 sm:p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm opacity-90 truncate">Demat Account</p>
                      <h3 className="text-lg sm:text-xl font-bold truncate">{demat.broker_name}</h3>
                    </div>
                    <button onClick={() => handleDeleteDemat(demat.id)} className="p-1.5 sm:p-1 hover:bg-white/20 rounded ml-2 flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm opacity-90 truncate">****{demat.account_number.slice(-4)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8 text-sm">No demat accounts yet. Add one to start investing!</p>
          )}
        </div>

        {/* Portfolio Summary - Angel One Inspired */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-3 sm:p-6 mb-6 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
            <div>
              <p className="text-xs sm:text-sm opacity-90 mb-1">Total Invested</p>
              <p className="text-2xl sm:text-2xl font-bold">{formatCurrency(portfolio?.total_invested || 0)}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm opacity-90 mb-1">Current Value</p>
              <p className="text-2xl sm:text-2xl font-bold">{formatCurrency(portfolio?.current_value || 0)}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm opacity-90 mb-1">Total Profit/Loss</p>
              <div className="flex items-center space-x-2">
                {isProfit ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                <div>
                  <p className="text-2xl sm:text-2xl font-bold">
                    {isProfit ? '+' : ''}{formatCurrency(totalProfitLoss)}
                  </p>
                  <p className="text-xs sm:text-sm opacity-90">
                    {isProfit ? '+' : ''}{profitLossPercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Holdings */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-100">Holdings</h2>
            <button 
              onClick={handleAddInvestment} 
              className="btn-primary flex items-center space-x-2"
              disabled={dematAccounts.length === 0}
            >
              <Plus className="w-5 h-5" />
              <span>Add Investment</span>
            </button>
          </div>

          {portfolio && portfolio.holdings && portfolio.holdings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 px-3 font-semibold text-gray-200 text-sm">Stock</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-200 text-sm">Qty</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-200 text-sm">Avg Price</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-200 text-sm">LTP</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-200 text-sm">Invested</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-200 text-sm">Current</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-200 text-sm">P&L</th>
                    <th className="text-center py-2 px-3 font-semibold text-gray-200 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.holdings.map((holding) => {
                    const profitLoss = holding.profit_loss;
                    const profitLossPct = holding.profit_loss_percentage ?? 0;
                    const isProfitable = profitLoss >= 0;
                    
                    return (
                      <tr key={holding.stock_symbol} className="border-b border-gray-700 hover:bg-gray-700/50">
                        <td className="py-3 px-3">
                          <div>
                            <p className="font-semibold text-gray-100 text-sm">{holding.stock_symbol}</p>
                            <p className="text-xs text-gray-300">{holding.stock_name}</p>
                          </div>
                        </td>
                        <td className="text-right py-3 px-3 text-gray-100 text-sm">{holding.quantity}</td>
                        <td className="text-right py-3 px-3 text-gray-100 text-sm">{formatCurrency(holding.avg_buy_price)}</td>
                        <td className="text-right py-3 px-3 font-medium text-gray-100 text-sm">{formatCurrency(holding.current_price)}</td>
                        <td className="text-right py-3 px-3 text-gray-100 text-sm">{formatCurrency(holding.invested_amount)}</td>
                        <td className="text-right py-3 px-3 font-medium text-gray-100 text-sm">{formatCurrency(holding.current_value)}</td>
                        <td className={`text-right py-3 px-3 font-bold text-sm ${isProfitable ? 'profit' : 'loss'}`}>
                          <div>
                            <p>{isProfitable ? '+' : ''}{formatCurrency(profitLoss)}</p>
                            <p className="text-sm">{isProfitable ? '+' : ''}{profitLossPct.toFixed(2)}%</p>
                          </div>
                        </td>
                        <td className="text-center py-4 px-4">
                          <button 
                            onClick={() => handleDeleteInvestment(holding)} 
                            className="p-2 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No investments yet</p>
              <button
                onClick={handleAddInvestment}
                className="btn-primary mt-4"
                disabled={dematAccounts.length === 0}
              >
                {dematAccounts.length === 0 ? 'Add Demat Account First' : 'Add Investment'}
              </button>
            </div>
          )}
        </div>

        {/* Demat Modal */}
        {showDematModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-2xl bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
                <div className="bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <h3 className="text-xl font-bold text-gray-100 mb-4">{editingDemat ? 'Edit' : 'Add'} Demat Account</h3>
                  <form onSubmit={handleSaveDemat} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Broker Name</label>
                      <input 
                        type="text" 
                        value={dematForm.broker_name} 
                        onChange={(e) => setDematForm({...dematForm, broker_name: e.target.value})} 
                        className="input-field" 
                        placeholder="e.g., Zerodha, Upstox, Angel One"
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Account Number</label>
                      <input 
                        type="text" 
                        value={dematForm.account_number} 
                        onChange={(e) => setDematForm({...dematForm, account_number: e.target.value})} 
                        className="input-field" 
                        required 
                      />
                    </div>
                  </form>
                </div>
                <div className="bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-3">
                  <button type="submit" onClick={handleSaveDemat} className="flex-1 btn-primary">Save</button>
                  <button type="button" onClick={() => setShowDematModal(false)} className="flex-1 btn-secondary">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Investment Modal */}
        {showInvestmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-2xl bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <h3 className="text-xl font-bold text-gray-100 mb-6">{editingInvestment ? 'Edit' : 'Add'} Investment</h3>
                  <form onSubmit={handleSaveInvestment} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Demat Account</label>
                      <select 
                        value={investmentForm.demat_account_id} 
                        onChange={(e) => setInvestmentForm({...investmentForm, demat_account_id: e.target.value})} 
                        className="input-field" 
                        required
                      >
                        <option value="">Select Demat Account</option>
                        {dematAccounts.map((demat) => (
                          <option key={demat.id} value={demat.id}>{demat.broker_name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Stock Symbol</label>
                      <input 
                        type="text" 
                        value={investmentForm.stock_symbol} 
                        onChange={(e) => setInvestmentForm({...investmentForm, stock_symbol: e.target.value.toUpperCase()})} 
                        className="input-field" 
                        placeholder="e.g., AAPL, GOOGL, RELIANCE.NS"
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Stock Name</label>
                      <input 
                        type="text" 
                        value={investmentForm.stock_name} 
                        onChange={(e) => setInvestmentForm({...investmentForm, stock_name: e.target.value})} 
                        className="input-field" 
                        placeholder="e.g., Apple Inc."
                        required 
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowStockSearch(true)}
                        className="w-full btn-secondary"
                      >
                        Search & autofill stock
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Quantity</label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={investmentForm.quantity} 
                          onChange={(e) => setInvestmentForm({...investmentForm, quantity: e.target.value})} 
                          className="input-field" 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Buy Price</label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={investmentForm.buy_price} 
                          onChange={(e) => setInvestmentForm({...investmentForm, buy_price: e.target.value})} 
                          className="input-field" 
                          required 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Buy Date</label>
                      <DatePicker 
                        value={investmentForm.buy_date} 
                        onChange={(date) => setInvestmentForm({...investmentForm, buy_date: date})}
                        label="Select purchase date"
                      />
                    </div>
                  </form>
                </div>
                <div className="bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-3">
                  <button type="submit" onClick={handleSaveInvestment} className="flex-1 btn-primary">Save</button>
                  <button type="button" onClick={() => setShowInvestmentModal(false)} className="flex-1 btn-secondary">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stock Search Overlay */}
        {showStockSearch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-2xl bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
                <div className="bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-bold text-gray-100">Search Stocks</h4>
                    <button onClick={() => setShowStockSearch(false)} className="p-2 hover:bg-gray-700 rounded-xl transition-colors">
                      <X className="w-6 h-6 text-gray-300" />
                    </button>
                  </div>
                  <StockSearch onSelect={handleStockSelected} onClose={() => setShowStockSearch(false)} showPrice={true} />
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

export default Portfolio;
