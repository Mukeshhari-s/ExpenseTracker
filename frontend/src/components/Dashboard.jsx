import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { 
  transactionAPI, 
  bankAPI, 
  investmentAPI 
} from '../services/api';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart, 
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw
} from 'lucide-react';
import { getUser } from '../utils/auth';

function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [summary, setSummary] = useState({
    monthlyExpenses: 0,
    monthlyIncome: 0,
    netSavings: 0,
    totalBalance: 0,
    portfolioValue: 0,
    portfolioProfit: 0,
    portfolioProfitPercent: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      console.log('Fetching dashboard data...');

      // Fetch monthly summary
      console.log('Fetching monthly summary...');
      const monthlyData = await transactionAPI.getMonthlySummary();
      console.log('Monthly Data Response:', monthlyData);

      // Fetch bank summary
      console.log('Fetching bank summary...');
      const bankData = await bankAPI.getSummary();
      console.log('Bank Data Response:', bankData);

      // Fetch portfolio summary
      console.log('Fetching portfolio summary...');
      const portfolioData = await investmentAPI.getPortfolioSummary();
      console.log('Portfolio Data Response:', portfolioData);

      // Fetch recent transactions
      console.log('Fetching recent transactions...');
      const transactionsData = await transactionAPI.getAll({ limit: 5 });
      console.log('Transactions Data Response:', transactionsData);

      const monthly = monthlyData.data || {};
      const bank = bankData.data || {};
      const portfolio = portfolioData.data || {};
      const transactions = transactionsData.data || {};

      console.log('Extracted values:', {
        monthlyExpenses: monthly.total_expenses,
        monthlyIncome: monthly.total_income,
        netSavings: monthly.net_savings,
        totalBalance: bank.totalBalance,
        portfolioValue: portfolio.current_value,
        portfolioProfit: portfolio.total_profit_loss,
        portfolioProfitPercent: portfolio.profit_loss_percentage,
      });

      setSummary({
        monthlyExpenses: monthly.total_expenses || 0,
        monthlyIncome: monthly.total_income || 0,
        netSavings: monthly.net_savings || 0,
        totalBalance: bank.totalBalance || 0,
        portfolioValue: portfolio.current_value || 0,
        portfolioProfit: portfolio.total_profit_loss || 0,
        portfolioProfitPercent: portfolio.profit_loss_percentage || 0,
      });

      setRecentTransactions(transactions.transactions || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert('Error loading dashboard: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const formatCurrency = (amount) => {
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      JPY: '¥',
    };
    const symbol = symbols[user?.currency] || '$';
    return `${symbol}${Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
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
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-100">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-300 mt-1">
              Here's your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Monthly Expenses */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 font-medium">Monthly Expenses</span>
              <ArrowDownCircle className="w-6 h-6 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-gray-100">
              {formatCurrency(summary.monthlyExpenses)}
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Income: {formatCurrency(summary.monthlyIncome)}
            </p>
          </div>

          {/* Net Savings */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 font-medium">Net Savings</span>
              <Wallet className="w-6 h-6 text-blue-400" />
            </div>
            <div className={`text-3xl font-bold ${summary.netSavings >= 0 ? 'profit' : 'loss'}`}>
              {formatCurrency(summary.netSavings)}
            </div>
            <p className="text-sm text-gray-400 mt-2">
              This month
            </p>
          </div>

          {/* Total Bank Balance */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 font-medium">Bank Balance</span>
              <PieChart className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-100">
              {formatCurrency(summary.totalBalance)}
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Across all accounts
            </p>
          </div>

          {/* Portfolio Value */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 font-medium">Portfolio Value</span>
              <TrendingUp className={`w-6 h-6 ${summary.portfolioProfit >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
            <div className="text-3xl font-bold text-gray-100">
              {formatCurrency(summary.portfolioValue)}
            </div>
            <p className={`text-sm mt-2 ${summary.portfolioProfit >= 0 ? 'profit' : 'loss'}`}>
              {summary.portfolioProfit >= 0 ? '+' : ''}{formatCurrency(summary.portfolioProfit)} ({summary.portfolioProfitPercent.toFixed(2)}%)
            </p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-100">Recent Transactions</h2>
            <button
              onClick={() => navigate('/banks')}
              className="text-blue-400 hover:text-blue-300 font-medium">
              View All →
            </button>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'income' ? 'bg-green-900' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <ArrowDownCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-100">
                        {transaction.category || transaction.source || transaction.type}
                      </p>
                      <p className="text-sm text-gray-300">
                        {transaction.bank_name} • {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${
                    transaction.type === 'income' ? 'profit' : 'loss'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <PieChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No transactions yet</p>
              <button
                onClick={() => navigate('/banks')}
                className="btn-primary mt-4"
              >
                Add Transaction
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <button
            onClick={() => navigate('/banks')}
            className="card hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-100">Manage Banks</h3>
                <p className="text-gray-300">Add transactions and view expenses</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/portfolio')}
            className="card hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-100">View Portfolio</h3>
                <p className="text-gray-300">Track investments and profits</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
