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
  ArrowLeftRight,
  RefreshCw,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getUser } from '../utils/auth';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
  const [monthlyAnalysis, setMonthlyAnalysis] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-indexed
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchMonthlyAnalysis();
  }, [selectedMonth, selectedYear]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      console.log('Fetching dashboard data...');

      // Fetch monthly summary for current month (for stats cards)
      const monthlyData = await transactionAPI.getMonthlySummary();
      console.log('Monthly Data Response:', monthlyData);

      // Fetch bank summary
      const bankData = await bankAPI.getSummary();

      // Fetch portfolio summary
      const portfolioData = await investmentAPI.getPortfolioSummary();

      // Fetch recent transactions
      const transactionsData = await transactionAPI.getAll({ limit: 5 });

      const monthly = monthlyData.data || {};
      const bank = bankData.data || {};
      const portfolio = portfolioData.data || {};
      const transactions = transactionsData.data || {};

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
      alert('Error loading dashboard: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMonthlyAnalysis = async () => {
    try {
      console.log(`Fetching analysis for ${selectedMonth}/${selectedYear}`);
      const response = await transactionAPI.getMonthlySummary({
        month: selectedMonth,
        year: selectedYear
      });
      console.log('Monthly Analysis Response:', response.data);
      setMonthlyAnalysis(response.data || {});
    } catch (error) {
      console.error('Error fetching monthly analysis:', error);
    }
  };

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Don't go beyond current month
    if (selectedYear === currentYear && selectedMonth === currentMonth) {
      return;
    }
    
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-300 mt-1 text-sm sm:text-base">
              Here's your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary flex items-center space-x-2 whitespace-nowrap"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Monthly Expenses */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 font-medium text-xs sm:text-sm">Monthly Expenses</span>
              <ArrowDownCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" />
            </div>
            <div className="text-2xl sm:text-2xl font-bold text-gray-100 truncate">
              {formatCurrency(summary.monthlyExpenses)}
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Income: {formatCurrency(summary.monthlyIncome)}
            </p>
          </div>

          {/* Net Savings */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 font-medium text-xs sm:text-sm">Net Savings</span>
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0" />
            </div>
            <div className={`text-2xl sm:text-2xl font-bold ${summary.netSavings >= 0 ? 'profit' : 'loss'} truncate`}>
              {formatCurrency(summary.netSavings)}
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              This month
            </p>
          </div>

          {/* Total Bank Balance */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 font-medium">Bank Balance</span>
              <PieChart className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-2xl font-bold text-gray-100">
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
            <div className="text-2xl font-bold text-gray-100">
              {formatCurrency(summary.portfolioValue)}
            </div>
            <p className={`text-sm mt-2 ${summary.portfolioProfit >= 0 ? 'profit' : 'loss'}`}>
              {summary.portfolioProfit >= 0 ? '+' : ''}{formatCurrency(summary.portfolioProfit)} ({summary.portfolioProfitPercent.toFixed(2)}%)
            </p>
          </div>
        </div>

        {/* Monthly Expense Analysis */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-100 flex items-center space-x-2">
            <BarChart3 className="w-7 h-7 text-purple-500" />
            <span>Monthly Analysis</span>
          </h2>
          
          {/* Month Selector */}
          <div className="flex items-center space-x-3 bg-gray-800 rounded-lg px-4 py-2">
            <button
              onClick={handlePreviousMonth}
              className="text-gray-400 hover:text-gray-100 transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-gray-100 font-semibold min-w-[120px] text-center">
              {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </span>
            <button
              onClick={handleNextMonth}
              className={`transition-colors ${
                selectedYear === new Date().getFullYear() && selectedMonth === new Date().getMonth() + 1
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-400 hover:text-gray-100'
              }`}
              disabled={selectedYear === new Date().getFullYear() && selectedMonth === new Date().getMonth() + 1}
              title="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {monthlyAnalysis && (monthlyAnalysis.total_expenses > 0 || monthlyAnalysis.total_income > 0) ? (
          <div className="space-y-6 mb-8">
            {/* Category and Bank Charts Grid */}
            {(monthlyAnalysis.expenses_by_category?.length > 0 || monthlyAnalysis.expenses_by_bank?.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Expenses by Category - Doughnut Chart */}
                {monthlyAnalysis.expenses_by_category && monthlyAnalysis.expenses_by_category.length > 0 && (
              <div className="card lg:col-span-1">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-100 flex items-center space-x-2">
                    <PieChart className="w-6 h-6 text-blue-500" />
                    <span>Expenses by Category</span>
                  </h2>
                  <span className="text-sm text-gray-400">This Month</span>
                </div>
                
                <div className="h-48 sm:h-56 flex items-center justify-center mb-4">
                  <Doughnut
                    data={{
                      labels: monthlyAnalysis.expenses_by_category.map(cat => cat.category),
                      datasets: [{
                        data: monthlyAnalysis.expenses_by_category.map(cat => cat.total),
                        backgroundColor: [
                          'rgba(239, 68, 68, 0.8)',
                          'rgba(249, 115, 22, 0.8)',
                          'rgba(251, 191, 36, 0.8)',
                          'rgba(34, 197, 94, 0.8)',
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(168, 85, 247, 0.8)',
                          'rgba(236, 72, 153, 0.8)',
                          'rgba(148, 163, 184, 0.8)',
                        ],
                        borderColor: 'rgba(31, 41, 55, 1)',
                        borderWidth: 2,
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            color: 'rgb(229, 231, 235)',
                            padding: 15,
                            font: {
                              size: 11,
                            }
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const label = context.label || '';
                              const value = formatCurrency(context.parsed);
                              const percentage = ((context.parsed / monthlyAnalysis.total_expenses) * 100).toFixed(1);
                              return `${label}: ${value} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>

                {/* Category List */}
                <div className="space-y-2 mt-4">
                  {monthlyAnalysis.expenses_by_category.slice(0, 5).map((cat, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">{cat.category}</span>
                      <span className="text-gray-100 font-semibold">{formatCurrency(cat.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expenses by Bank - Bar Chart */}
            {monthlyAnalysis.expenses_by_bank && monthlyAnalysis.expenses_by_bank.length > 0 && (
              <div className="card lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-100 flex items-center space-x-2">
                    <BarChart3 className="w-6 h-6 text-green-500" />
                    <span>Spending by Bank Account</span>
                  </h2>
                  <span className="text-sm text-gray-400">This Month</span>
                </div>
                
                <div className="h-48 sm:h-56 mb-4">
                  <Bar
                    data={{
                      labels: monthlyAnalysis.expenses_by_bank.map(bank => bank.bank_name || 'Unknown'),
                      datasets: [{
                        label: 'Expenses',
                        data: monthlyAnalysis.expenses_by_bank.map(bank => bank.total),
                        backgroundColor: 'rgba(239, 68, 68, 0.7)',
                        borderColor: 'rgba(239, 68, 68, 1)',
                        borderWidth: 1,
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `Spent: ${formatCurrency(context.parsed.y)}`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            color: 'rgb(156, 163, 175)',
                            callback: function(value) {
                              return formatCurrency(value);
                            }
                          },
                          grid: {
                            color: 'rgba(75, 85, 99, 0.3)',
                          }
                        },
                        x: {
                          ticks: {
                            color: 'rgb(156, 163, 175)',
                          },
                          grid: {
                            display: false
                          }
                        }
                      }
                    }}
                  />
                </div>

                {/* Bank List */}
                <div className="space-y-2 mt-4 max-h-40 overflow-y-auto">
                  {monthlyAnalysis.expenses_by_bank.map((bank, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-gray-300">{bank.bank_name || 'Unknown'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-100 font-semibold">{formatCurrency(bank.total)}</span>
                        <span className="text-gray-400 text-xs ml-2">({bank.count} txns)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
              </div>
            )}

            {/* Income vs Expense Comparison & Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Income vs Expense - takes 2 columns */}
              <div className="card lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-100 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <span>Income vs Expenses</span>
                  </h2>
                  <span className="text-xs text-gray-400">
                    {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div className="h-40">
                  <Bar
                  data={{
                    labels: ['Income', 'Expenses', 'Savings'],
                    datasets: [{
                      label: 'Amount',
                      data: [
                        monthlyAnalysis.total_income || 0,
                        monthlyAnalysis.total_expenses || 0,
                        monthlyAnalysis.net_savings || 0
                      ],
                      backgroundColor: [
                        'rgba(34, 197, 94, 0.7)',
                        'rgba(239, 68, 68, 0.7)',
                        monthlyAnalysis.net_savings >= 0 ? 'rgba(59, 130, 246, 0.7)' : 'rgba(239, 68, 68, 0.7)'
                      ],
                      borderColor: [
                        'rgba(34, 197, 94, 1)',
                        'rgba(239, 68, 68, 1)',
                        monthlyAnalysis.net_savings >= 0 ? 'rgba(59, 130, 246, 1)' : 'rgba(239, 68, 68, 1)'
                      ],
                      borderWidth: 2,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.label}: ${formatCurrency(context.parsed.y)}`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          color: 'rgb(156, 163, 175)',
                          callback: function(value) {
                            return formatCurrency(value);
                          }
                        },
                        grid: {
                          color: 'rgba(75, 85, 99, 0.3)',
                        }
                      },
                      x: {
                        ticks: {
                          color: 'rgb(156, 163, 175)',
                          font: {
                            size: 14,
                            weight: 'bold'
                          }
                        },
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              </div>

              {/* Summary Stats - Compact */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="text-center">
                  <p className="text-gray-400 text-xs mb-1">Income</p>
                  <p className="text-green-400 font-bold text-sm">{formatCurrency(monthlyAnalysis.total_income || 0)}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs mb-1">Expenses</p>
                  <p className="text-red-400 font-bold text-sm">{formatCurrency(monthlyAnalysis.total_expenses || 0)}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs mb-1">Savings</p>
                  <p className={`font-bold text-sm ${monthlyAnalysis.net_savings >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                    {formatCurrency(monthlyAnalysis.net_savings || 0)}
                  </p>
                </div>
              </div>
              </div>

              {/* Recent Transactions - takes 1 column */}
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-100">Recent</h2>
                  <button
                    onClick={() => navigate('/banks')}
                    className="text-blue-400 hover:text-blue-300 text-xs font-medium">
                    View All →
                  </button>
                </div>

                {recentTransactions.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-2 bg-gray-700 rounded text-sm"
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                            transaction.type === 'income'
                              ? 'bg-green-900'
                              : transaction.type === 'expense'
                              ? 'bg-red-900'
                              : 'bg-blue-900/20'
                          }`}>
                            {transaction.type === 'income' ? (
                              <ArrowUpCircle className="w-4 h-4 text-green-600" />
                            ) : transaction.type === 'expense' ? (
                              <ArrowDownCircle className="w-4 h-4 text-red-600" />
                            ) : (
                              <ArrowLeftRight className="w-4 h-4 text-blue-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-100 text-xs truncate">
                              {transaction.type === 'transfer'
                                ? 'Transfer'
                                : transaction.category || transaction.source || transaction.type}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {formatDate(transaction.date)}
                            </p>
                          </div>
                        </div>
                        <div className={`text-xs font-bold flex-shrink-0 ml-2 ${
                          transaction.type === 'income'
                            ? 'text-green-400'
                            : transaction.type === 'expense'
                            ? 'text-red-400'
                            : 'text-blue-400'
                        }`}>
                          {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}{formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400 text-sm">
                    <p>No transactions yet</p>
                    <button
                      onClick={() => navigate('/banks')}
                      className="btn-primary mt-2 text-xs py-1"
                    >
                      Add Transaction
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="card mb-8 text-center py-12">
            <PieChart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No expense data for this month yet</p>
            <p className="text-gray-500 text-sm mt-2">Add some transactions to see visual analytics</p>
          </div>
        )}

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
