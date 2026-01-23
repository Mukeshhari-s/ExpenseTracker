import express from 'express';
import { 
  getMarketPrice, 
  getMultipleMarketPrices,
  getStockList,
  getStockDetails,
  searchStockAutocomplete,
  getMarketStats,
  initializeStockMaster,
  getLiveStockPrice, 
  getMultipleStockPrices 
} from '../controllers/stockController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Market price endpoints
router.get('/market/price/:symbol', getMarketPrice);          // GET /api/stocks/market/price/INFY.NS
router.get('/market/price', getMultipleMarketPrices);         // GET /api/stocks/market/price?symbols=INFY.NS,TCS.NS
router.get('/market/stats', getMarketStats);                  // GET /api/stocks/market/stats

// Stock list & search endpoints
router.get('/list', getStockList);                            // GET /api/stocks/list?page=1&search=INFY&exchange=NSE
router.get('/search/autocomplete', searchStockAutocomplete);  // GET /api/stocks/search/autocomplete?q=inf
router.get('/:symbol', getStockDetails);                      // GET /api/stocks/INFY.NS

// Admin endpoint (optional)
router.post('/admin/init', initializeStockMaster);            // POST /api/stocks/admin/init

// Legacy endpoints (backward compatibility)
router.post('/bulk', getMultipleStockPrices);                 // POST /api/stocks/bulk

export default router;
