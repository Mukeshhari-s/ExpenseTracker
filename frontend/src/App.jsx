import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';
import Login from './components/Login';
const Dashboard = lazy(() => import('./components/Dashboard'));
const BankManagement = lazy(() => import('./components/BankManagement'));
const Portfolio = lazy(() => import('./components/Portfolio'));
const Profile = lazy(() => import('./components/Profile'));
import './App.css';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

// Public Route wrapper (redirect to dashboard if already logged in)
function PublicRoute({ children }) {
  return !isAuthenticated() ? children : <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <Router>
      <Suspense fallback={<div className="loading"><div className="spinner"></div></div>}>
        <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/banks"
          element={
            <ProtectedRoute>
              <BankManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portfolio"
          element={
            <ProtectedRoute>
              <Portfolio />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
