import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUser, logout } from '../utils/auth';
import { 
  Home, 
  CreditCard, 
  TrendingUp, 
  User, 
  LogOut, 
  DollarSign,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const apiRootUrl = apiBaseUrl.replace(/\/api\/?$/, '');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/banks', icon: CreditCard, label: 'Banks' },
    { path: '/portfolio', icon: TrendingUp, label: 'Portfolio' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gray-800/80 backdrop-blur-md shadow-2xl sticky top-0 z-50 border-b border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent hidden sm:block">
              Finance Tracker
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Profile & Logout */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/profile"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                isActive('/profile')
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {user?.profilePhoto ? (
                <img
                  src={`${apiRootUrl}${user.profilePhoto}`}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/30"
                />
              ) : (
                <User className="w-5 h-5" />
              )}
              <span className="font-medium">{user?.name || 'Profile'}</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl hover:bg-white/5 transition-all duration-200"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-300" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700/50 bg-gray-800/50 backdrop-blur-sm rounded-b-2xl">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 mb-1 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}

            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 mb-1 ${
                isActive('/profile')
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </Link>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
