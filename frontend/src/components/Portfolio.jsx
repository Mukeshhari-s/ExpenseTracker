import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import StockSearch from './StockSearch';
import { 
  investmentAPI, 
  dematAPI, 
  stockAPI 
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dematRes, portfolioRes] = await Promise.all([
        dematAPI.getAll(),
        investmentAPI.getPortfolioSummary(),
      ]);

      setDematAccounts(dematRes.data.accounts || []);
      setPortfolio(portfolioRes.data);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading"><div className="spinner"></div></div>
      </>
    );
  }

  const totalProfitLoss = portfolio?.total_profit_loss || 0;
  const profitLossPercent = portfolio?.profit_loss_percentage || 0;
  const isProfit = totalProfitLoss >= 0;

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Investment Portfolio</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Prices</span>
          </button>
        </div>

        {/* Demat Accounts */}
        <div className="card mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Demat Accounts</h2>
            <button onClick={handleAddDemat} className="btn-primary flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Add Demat Account</span>
            </button>
          </div>

          {dematAccounts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dematAccounts.map((demat) => (
                <div key={demat.id} className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm opacity-90">Demat Account</p>
                      <h3 className="text-xl font-bold">{demat.broker_name}</h3>
                    </div>
                    <button onClick={() => handleDeleteDemat(demat.id)} className="p-1 hover:bg-white/20 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm opacity-90">****{demat.account_number.slice(-4)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No demat accounts yet. Add one to start investing!</p>
          )}
        </div>

        {/* Portfolio Summary - Angel One Inspired */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-2xl p-8 mb-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Invested</p>
              <p className="text-3xl font-bold">{formatCurrency(portfolio?.total_invested || 0)}</p>
            </div>
            <div>
              <p className="text-sm opacity-90 mb-1">Current Value</p>
              <p className="text-3xl font-bold">{formatCurrency(portfolio?.current_value || 0)}</p>
            </div>
            <div>
              <p className="text-sm opacity-90 mb-1">Total Profit/Loss</p>
              <div className="flex items-center space-x-2">
                {isProfit ? (
                  <TrendingUp className="w-6 h-6" />
                ) : (
                  <TrendingDown className="w-6 h-6" />
                )}
                <div>
                  <p className="text-3xl font-bold">
                    {isProfit ? '+' : ''}{formatCurrency(totalProfitLoss)}
                  </p>
                  <p className="text-sm opacity-90">
                    {isProfit ? '+' : ''}{profitLossPercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Holdings */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Holdings</h2>
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
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Qty</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Avg Price</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">LTP</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Invested</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Current</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">P&L</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.holdings.map((holding) => {
                    const profitLoss = holding.profit_loss;
                    const profitLossPct = holding.profit_loss_percentage ?? 0;
                    const isProfitable = profitLoss >= 0;
                    
                    return (
                      <tr key={holding.stock_symbol} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold text-gray-800">{holding.stock_symbol}</p>
                            <p className="text-sm text-gray-600">{holding.stock_name}</p>
                          </div>
                        </td>
                        <td className="text-right py-4 px-4 text-gray-800">{holding.quantity}</td>
                        <td className="text-right py-4 px-4 text-gray-800">{formatCurrency(holding.avg_buy_price)}</td>
                        <td className="text-right py-4 px-4 font-medium text-gray-800">{formatCurrency(holding.current_price)}</td>
                        <td className="text-right py-4 px-4 text-gray-800">{formatCurrency(holding.invested_amount)}</td>
                        <td className="text-right py-4 px-4 font-medium text-gray-800">{formatCurrency(holding.current_value)}</td>
                        <td className={`text-right py-4 px-4 font-bold ${isProfitable ? 'profit' : 'loss'}`}>
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
            <div className="text-center py-12 text-gray-500">
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">{editingDemat ? 'Edit' : 'Add'} Demat Account</h3>
              <form onSubmit={handleSaveDemat} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Broker Name</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input 
                    type="text" 
                    value={dematForm.account_number} 
                    onChange={(e) => setDematForm({...dematForm, account_number: e.target.value})} 
                    className="input-field" 
                    required 
                  />
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="flex-1 btn-primary">Save</button>
                  <button type="button" onClick={() => setShowDematModal(false)} className="flex-1 btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Investment Modal */}
        {showInvestmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">{editingInvestment ? 'Edit' : 'Add'} Investment</h3>
              <form onSubmit={handleSaveInvestment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Demat Account</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Symbol</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Name</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Buy Price</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buy Date</label>
                  <input 
                    type="date" 
                    value={investmentForm.buy_date} 
                    onChange={(e) => setInvestmentForm({...investmentForm, buy_date: e.target.value})} 
                    className="input-field" 
                    required 
                  />
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="flex-1 btn-primary">Save</button>
                  <button type="button" onClick={() => setShowInvestmentModal(false)} className="flex-1 btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stock Search Overlay */}
        {showStockSearch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 w-full max-w-3xl shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-bold text-gray-800">Search Stocks</h4>
                <button onClick={() => setShowStockSearch(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <StockSearch onSelect={handleStockSelected} onClose={() => setShowStockSearch(false)} showPrice={true} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Portfolio;
