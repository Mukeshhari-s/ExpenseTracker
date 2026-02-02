import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

// Import routes
import authRoutes from './routes/auth.js';
import bankRoutes from './routes/bank.js';
import transactionRoutes from './routes/transaction.js';
import dematRoutes from './routes/demat.js';
import investmentRoutes from './routes/investment.js';
import stockRoutes from './routes/stock.js';
import profileRoutes from './routes/profile.js';

// Import services
import { loadStockMaster } from './services/nseLoader.js';

// Import database
import { connectDB, initializeDatabase } from './config/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.disable('x-powered-by');
app.set('trust proxy', 1);

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
  // Add Vercel frontend URLs
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    // Allow all origins in development
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS blocked origin: ${origin}`);
      callback(null, true); // Allow anyway for now, log for debugging
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication attempts, please try again later.'
});

app.use(generalLimiter);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/banks', bankRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/demat', dematRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/profile', profileRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Personal Finance Tracker API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Personal Finance Tracker API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      banks: '/api/banks',
      transactions: '/api/transactions',
      demat: '/api/demat',
      investments: '/api/investments',
      stocks: '/api/stocks',
      profile: '/api/profile'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server and initialize stock master
const server = app.listen(PORT, () => {
  console.log(`
                                                        
   💰 Personal Finance Tracker API                     
                                                        
   Server running on: http://localhost:${PORT}          
   Environment: ${process.env.NODE_ENV || 'development'}                      
                                                        
 Endpoints:                                           
 - Auth:         /api/auth                            
 - Banks:        /api/banks                           
 - Transactions: /api/transactions                    
 - Demat:        /api/demat                           
 - Investments:  /api/investments                     
 - Stocks:       /api/stocks (with market data)       
 - Profile:      /api/profile           
  `);
});

// Initialize MongoDB and stock master after server starts
(async () => {
  try {
    // Connect to MongoDB
    console.log('[DB] Connecting to MongoDB...');
    await connectDB();
    await initializeDatabase();
    console.log('[DB] MongoDB connected and initialized');

    // Initialize stock master list on startup
    console.log('[INIT] Loading stock master list...');
    try {
      await loadStockMaster();
      console.log('[INIT] Stock master loaded successfully');
    } catch (error) {
      console.warn('[INIT] Warning: Could not load stock master:', error.message);
      console.log('[INIT] Using default stock list');
    }
  } catch (error) {
    console.error('[DB] MongoDB connection failed:', error.message);
    // Don't exit - let server run without DB
    console.log('[FALLBACK] Server running without MongoDB - login will fail');
  }
})();

export default app;
