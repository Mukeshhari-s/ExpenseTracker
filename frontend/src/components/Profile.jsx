import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { profileAPI, transactionAPI, investmentAPI } from '../services/api';
import { getUser, setUser, logout } from '../utils/auth';
import { User, Camera, Mail, DollarSign, Lock, LogOut, Save, TrendingUp, TrendingDown, Calendar, Download, Search } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Profile() {
  const navigate = useNavigate();
  const currentUser = getUser();
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const apiRootUrl = apiBaseUrl.replace(/\/api\/?$/, '');
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedMonthData, setSelectedMonthData] = useState(null);
  const [loadingMonthDetails, setLoadingMonthDetails] = useState(false);
  const [monthTransactions, setMonthTransactions] = useState([]);

  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    currency: currentUser?.currency || 'USD',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    fetchMonthlyHistory();
  }, []);

  const fetchMonthlyHistory = async () => {
    try {
      const cached = sessionStorage.getItem('profile_monthly_history');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.data && parsed?.timestamp && Date.now() - parsed.timestamp < 5 * 60 * 1000) {
          setMonthlyHistory(parsed.data);
          setLoadingHistory(false);
          return;
        }
      }

      setLoadingHistory(true);
      
      // Get last 6 months of data
      const promises = [];
      const months = [];
      const today = new Date();
      
      for (let i = 1; i <= 6; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        months.push({
          year,
          month,
          label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        });
        
        promises.push(
          transactionAPI.getMonthlySummary({ year, month })
        );
      }
      
      const results = await Promise.all(promises);
      
      const history = results.map((res, index) => ({
        ...months[index],
        data: res.data || {}
      }));
      
      const finalHistory = history.reverse();
      setMonthlyHistory(finalHistory);
      sessionStorage.setItem('profile_monthly_history', JSON.stringify({
        data: finalHistory,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error fetching monthly history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const formatCurrency = (amount) => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥' };
    const symbol = symbols[currentUser?.currency] || '$';
    return `${symbol}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const fetchMonthDetails = async (year, month) => {
    try {
      setLoadingMonthDetails(true);
      
      // Fetch summary
      const summaryRes = await transactionAPI.getMonthlySummary({ year, month });
      setSelectedMonthData(summaryRes.data);
      
      // Fetch all transactions for the month
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      const transactionsRes = await transactionAPI.getAll({ 
        startDate, 
        endDate 
      });
      
      setMonthTransactions(transactionsRes.data.transactions || []);
    } catch (error) {
      console.error('Error fetching month details:', error);
    } finally {
      setLoadingMonthDetails(false);
    }
  };

  const handleMonthSelect = (monthData) => {
    setSelectedMonth(monthData);
    fetchMonthDetails(monthData.year, monthData.month);
  };

  const downloadMonthlyReport = () => {
    if (!selectedMonth || !selectedMonthData) return;

    const { year, month, label } = selectedMonth;
    const { total_income, total_expenses, net_savings, expenses_by_category } = selectedMonthData;

    // Create CSV content
    let csvContent = `Monthly Expense Report - ${label}\n`;
    csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
    csvContent += `Summary\n`;
    csvContent += `Total Income,${total_income || 0}\n`;
    csvContent += `Total Expenses,${total_expenses || 0}\n`;
    csvContent += `Net Savings,${net_savings || 0}\n\n`;

    if (expenses_by_category && expenses_by_category.length > 0) {
      csvContent += `Expenses by Category\n`;
      csvContent += `Category,Amount,Count\n`;
      expenses_by_category.forEach(cat => {
        csvContent += `${cat.category},${cat.total},${cat.count}\n`;
      });
      csvContent += `\n`;
    }

    if (monthTransactions.length > 0) {
      csvContent += `All Transactions\n`;
      csvContent += `Date,Type,Category/Source,Amount,Bank,Notes\n`;
      monthTransactions.forEach(tx => {
        const categoryOrSource = tx.type === 'expense' ? tx.category : tx.source;
        csvContent += `${tx.date},${tx.type},${categoryOrSource || 'N/A'},${tx.amount},${tx.bank_name || 'N/A'},${tx.notes || ''}\n`;
      });
    }

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `expense_report_${year}_${String(month).padStart(2, '0')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
    setMessage({ type: '', text: '' });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validate password change
    if (profileData.new_password) {
      if (!profileData.current_password) {
        setMessage({ type: 'error', text: 'Current password is required to change password' });
        setLoading(false);
        return;
      }
      if (profileData.new_password !== profileData.confirm_password) {
        setMessage({ type: 'error', text: 'New passwords do not match' });
        setLoading(false);
        return;
      }
      if (profileData.new_password.length < 6) {
        setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
        setLoading(false);
        return;
      }
    }

    try {
      const updateData = {
        name: profileData.name,
        email: profileData.email,
        currency: profileData.currency,
      };

      if (profileData.new_password) {
        updateData.current_password = profileData.current_password;
        updateData.new_password = profileData.new_password;
      }

      const response = await profileAPI.update(updateData);
      
      // Update local storage
      setUser(response.data.user);
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Clear password fields
      setProfileData({
        ...profileData,
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Error updating profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 5MB' });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file' });
      return;
    }

    setUploadingPhoto(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      const response = await profileAPI.uploadPhoto(formData);
      
      // Update user with new photo
      const updatedUser = { ...currentUser, profilePhoto: response.data.profilePhoto };
      setUser(updatedUser);
      
      setMessage({ type: 'success', text: 'Profile photo updated successfully!' });
      
      // Reload page to show new photo
      window.location.reload();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Error uploading photo' 
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-8">Profile & Settings</h1>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-900/20 border border-green-200 text-green-700' 
              : 'bg-red-900/20 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Profile Photo Section */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-100 mb-6">Profile Photo</h2>
          
          <div className="flex items-center space-x-6">
            <div className="relative">
              {currentUser?.profilePhoto ? (
                <img
                  src={`${apiRootUrl}${currentUser.profilePhoto}`}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-600"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-900/20 flex items-center justify-center border-4 border-blue-600">
                  <User className="w-16 h-16 text-blue-600" />
                </div>
              )}
              
              <label 
                htmlFor="photo-upload" 
                className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
              >
                <Camera className="w-5 h-5 text-white" />
              </label>
              
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={uploadingPhoto}
              />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-100">{currentUser?.name}</h3>
              <p className="text-gray-300">{currentUser?.email}</p>
              <p className="text-sm text-gray-400 mt-2">
                {uploadingPhoto ? 'Uploading...' : 'Click the camera icon to change photo'}
              </p>
            </div>
          </div>
        </div>
        {/* Monthly History Section */}
        <div className="card mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-bold text-gray-100 flex items-center space-x-2">
              <Calendar className="w-6 h-6" />
              <span>Monthly Financial Summary</span>
            </h2>
            
            {/* Month Selector and Download */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex-1 sm:flex-initial">
                <select 
                  value={selectedMonth ? `${selectedMonth.year}-${selectedMonth.month}` : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [year, month] = e.target.value.split('-');
                      const monthData = monthlyHistory.find(m => m.year === parseInt(year) && m.month === parseInt(month));
                      handleMonthSelect(monthData);
                    } else {
                      setSelectedMonth(null);
                      setSelectedMonthData(null);
                      setMonthTransactions([]);
                    }
                  }}
                  className="input-field text-sm"
                >
                  <option value="">All Months</option>
                  {monthlyHistory.slice().reverse().map((m) => (
                    <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedMonth && (
                <button
                  onClick={downloadMonthlyReport}
                  className="btn-primary flex items-center space-x-2 whitespace-nowrap"
                  disabled={loadingMonthDetails}
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </button>
              )}
            </div>
          </div>

          {loadingHistory ? (
            <div className="text-center py-8">
              <div className="spinner mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading history...</p>
            </div>
          ) : monthlyHistory.length > 0 ? (
            <>
              {/* Summary Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {monthlyHistory.slice(-1).map((month) => (
                  <div key={month.label}>
                    <div className="bg-gradient-to-br from-red-500/20 to-red-700/20 border border-red-500/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300 text-xs sm:text-sm">Expenses</span>
                        <TrendingDown className="w-5 h-5 text-red-400" />
                      </div>
                      <p className="text-2xl font-bold text-red-400">{formatCurrency(month.data.total_expenses || 0)}</p>
                      <p className="text-xs text-gray-400 mt-1">Last Month</p>
                    </div>
                  </div>
                ))}
                
                {monthlyHistory.slice(-1).map((month) => (
                  <div key={`income-${month.label}`}>
                    <div className="bg-gradient-to-br from-green-500/20 to-green-700/20 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300 text-xs sm:text-sm">Income</span>
                        <TrendingUp className="w-5 h-5 text-green-400" />
                      </div>
                      <p className="text-2xl font-bold text-green-400">{formatCurrency(month.data.total_income || 0)}</p>
                      <p className="text-xs text-gray-400 mt-1">Last Month</p>
                    </div>
                  </div>
                ))}
                
                {monthlyHistory.slice(-1).map((month) => (
                  <div key={`savings-${month.label}`}>
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-700/20 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300 text-xs sm:text-sm">Savings</span>
                        <DollarSign className="w-5 h-5 text-blue-400" />
                      </div>
                      <p className={`text-2xl font-bold ${(month.data.net_savings || 0) >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                        {formatCurrency(month.data.net_savings || 0)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Last Month</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Line Chart */}
              <div className="bg-gray-900/50 rounded-lg p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">6-Month Trend</h3>
                <div className="h-64 sm:h-80">
                  <Line
                    data={{
                      labels: monthlyHistory.map(m => m.label),
                      datasets: [
                        {
                          label: 'Income',
                          data: monthlyHistory.map(m => m.data.total_income || 0),
                          borderColor: 'rgb(34, 197, 94)',
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          fill: true,
                          tension: 0.4,
                        },
                        {
                          label: 'Expenses',
                          data: monthlyHistory.map(m => m.data.total_expenses || 0),
                          borderColor: 'rgb(239, 68, 68)',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          fill: true,
                          tension: 0.4,
                        },
                        {
                          label: 'Savings',
                          data: monthlyHistory.map(m => m.data.net_savings || 0),
                          borderColor: 'rgb(59, 130, 246)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          fill: true,
                          tension: 0.4,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: {
                            color: 'rgb(229, 231, 235)',
                            font: {
                              size: 12,
                            },
                          },
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              let label = context.dataset.label || '';
                              if (label) {
                                label += ': ';
                              }
                              label += formatCurrency(context.parsed.y);
                              return label;
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
                          },
                        },
                        x: {
                          ticks: {
                            color: 'rgb(156, 163, 175)',
                          },
                          grid: {
                            color: 'rgba(75, 85, 99, 0.3)',
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Selected Month Detailed View */}
              {selectedMonth && (
                <div className="mt-6">
                  <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 sm:p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-100 flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        Viewing: {selectedMonth.label}
                      </h3>
                      <button
                        onClick={() => {
                          setSelectedMonth(null);
                          setSelectedMonthData(null);
                          setMonthTransactions([]);
                        }}
                        className="text-sm text-gray-300 hover:text-white"
                      >
                        Clear
                      </button>
                    </div>

                    {loadingMonthDetails ? (
                      <div className="text-center py-8">
                        <div className="spinner mx-auto"></div>
                        <p className="text-gray-400 mt-4">Loading details...</p>
                      </div>
                    ) : selectedMonthData ? (
                      <>
                        {/* Month Summary */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                          <div className="bg-gray-800 rounded-lg p-4">
                            <p className="text-gray-400 text-sm mb-1">Total Income</p>
                            <p className="text-2xl font-bold text-green-400">
                              {formatCurrency(selectedMonthData.total_income || 0)}
                            </p>
                          </div>
                          <div className="bg-gray-800 rounded-lg p-4">
                            <p className="text-gray-400 text-sm mb-1">Total Expenses</p>
                            <p className="text-2xl font-bold text-red-400">
                              {formatCurrency(selectedMonthData.total_expenses || 0)}
                            </p>
                          </div>
                          <div className="bg-gray-800 rounded-lg p-4">
                            <p className="text-gray-400 text-sm mb-1">Net Savings</p>
                            <p className={`text-2xl font-bold ${(selectedMonthData.net_savings || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {formatCurrency(selectedMonthData.net_savings || 0)}
                            </p>
                          </div>
                        </div>

                        {/* Expenses by Category */}
                        {selectedMonthData.expenses_by_category && selectedMonthData.expenses_by_category.length > 0 && (
                          <div className="mb-6">
                            <h4 className="font-semibold text-gray-100 mb-3">Expenses by Category</h4>
                            <div className="bg-gray-800 rounded-lg p-4">
                              <div className="space-y-3">
                                {selectedMonthData.expenses_by_category.map((cat, idx) => (
                                  <div key={idx} className="flex justify-between items-center">
                                    <div className="flex-1">
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="text-gray-200 text-sm font-medium">{cat.category}</span>
                                        <span className="text-gray-400 text-sm">{formatCurrency(cat.total)}</span>
                                      </div>
                                      <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div 
                                          className="bg-red-500 h-2 rounded-full"
                                          style={{ width: `${(cat.total / selectedMonthData.total_expenses) * 100}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Recent Transactions */}
                        {monthTransactions.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-100 mb-3">
                              Transactions ({monthTransactions.length})
                            </h4>
                            <div className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                              <div className="space-y-2">
                                {monthTransactions.map((tx) => (
                                  <div key={tx.id} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-gray-200 text-sm font-medium truncate">
                                        {tx.type === 'expense' ? tx.category : tx.source}
                                      </p>
                                      <p className="text-gray-400 text-xs truncate">
                                        {new Date(tx.date).toLocaleDateString()} • {tx.bank_name}
                                      </p>
                                    </div>
                                    <div className="ml-4 flex-shrink-0">
                                      <p className={`text-sm font-semibold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Month-by-Month Details */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Monthly Breakdown</h3>
                <div className="space-y-3">
                  {monthlyHistory.slice().reverse().map((month) => (
                    <div key={month.label} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-100">{month.label}</h4>
                        <span className={`text-sm font-medium ${(month.data.net_savings || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {(month.data.net_savings || 0) >= 0 ? '+' : ''}{formatCurrency(month.data.net_savings || 0)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Income</p>
                          <p className="text-green-400 font-medium">{formatCurrency(month.data.total_income || 0)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Expenses</p>
                          <p className="text-red-400 font-medium">{formatCurrency(month.data.total_expenses || 0)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Transactions</p>
                          <p className="text-gray-200 font-medium">{(month.data.total_transactions || 0)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No monthly data available yet.</p>
              <p className="text-gray-500 text-sm mt-2">Start adding transactions to see your monthly summaries!</p>
            </div>
          )}
        </div>
        {/* Profile Information Form */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-100 mb-6">Personal Information</h2>
          
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Full Name</span>
                </div>
              </label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </div>
              </label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Preferred Currency</span>
                </div>
              </label>
              <select
                name="currency"
                value={profileData.currency}
                onChange={handleChange}
                className="input-field"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">Change Password</h3>
              <p className="text-sm text-gray-300 mb-4">
                Leave blank if you don't want to change your password
              </p>

              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    <div className="flex items-center space-x-2">
                      <Lock className="w-4 h-4" />
                      <span>Current Password</span>
                    </div>
                  </label>
                  <input
                    type="password"
                    name="current_password"
                    value={profileData.current_password}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter current password"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="new_password"
                    value={profileData.new_password}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter new password (min 6 characters)"
                    minLength={6}
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={profileData.confirm_password}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="card border-2 border-red-200">
          <h2 className="text-xl font-bold text-red-700 mb-4">Danger Zone</h2>
          <p className="text-gray-300 mb-4">
            Once you logout, you'll need to login again with your credentials.
          </p>
          <button
            onClick={handleLogout}
            className="btn-danger flex items-center space-x-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Profile;
