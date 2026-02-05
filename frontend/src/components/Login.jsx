import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { setToken, setUser } from '../utils/auth';
import { LogIn, UserPlus, DollarSign } from 'lucide-react';

function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    currency: 'USD',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = isLogin
        ? await authAPI.login({ email: formData.email, password: formData.password })
        : await authAPI.register(formData);

      const { token, user } = response.data;
      
      setToken(token);
      setUser(user);
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md p-8 border border-white/10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mb-6 shadow-lg pulse-glow">
            <DollarSign className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-3">
            Finance Tracker
          </h1>
          <p className="text-gray-300 text-lg">
            Your personal expense & investment manager
          </p>
        </div>

        {/* Toggle Login/Register */}
        <div className="flex bg-gray-800/50 backdrop-blur-sm rounded-2xl p-1 mb-8">
          <button
            type="button"
            className={`flex-1 py-3 px-4 text-center font-semibold rounded-xl transition-all duration-300 ${
              isLogin
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
          >
            <LogIn className="w-5 h-5 inline mr-2" />
            Login
          </button>
          <button
            type="button"
            className={`flex-1 py-3 px-4 text-center font-semibold rounded-xl transition-all duration-300 ${
              !isLogin
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
          >
            <UserPlus className="w-5 h-5 inline mr-2" />
            Register
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-400 rounded-2xl text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                required={!isLogin}
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              required
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Preferred Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
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
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="spinner mr-3 w-6 h-6 border-2"></div>
                Processing...
              </span>
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-300">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Register here
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Login here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
