import { getStockPrice, getMultipleStockPrices as getMultiplePrices, getCacheStats } from '../services/stockService.js';
import { 
  searchStocks, 
  getStockBySymbol, 
  getAllStocks, 
  getStocksByExchange, 
  getStockMasterStats,
  loadStockMaster 
} from '../services/nseLoader.js';

/**
 * GET /api/market/price/:symbol
 * Get live market price with day change and percentage change
 * Returns: { symbol, price, dayChange, percentChange, timestamp, source }
 */
export const getMarketPrice = async (req, res) => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      return res.status(400).json({ 
        error: 'Symbol is required',
        example: 'INFY.NS or TCS.NS'
      });
    }

    // Validate symbol format (should have .NS or .BO)
    const normalizedSymbol = symbol.toUpperCase();
    if (!normalizedSymbol.includes('.')) {
      return res.status(400).json({ 
        error: 'Invalid symbol format. Use INFY.NS (NSE) or INFY.BO (BSE)',
        example: 'INFY.NS or TCS.NS'
      });
    }

    const priceData = await getStockPrice(normalizedSymbol);

    if (!priceData) {
      return res.status(404).json({ 
        error: `Could not fetch price for ${normalizedSymbol}. Check symbol or try again later.`,
        symbol: normalizedSymbol
      });
    }

    res.json({
      success: true,
      data: priceData
    });
  } catch (error) {
    console.error('Market price error:', error);
    res.status(500).json({ error: 'Server error fetching market price' });
  }
};

/**
 * GET /api/market/price
 * Get multiple stock prices at once
 * Query: ?symbols=INFY.NS,TCS.NS,WIPRO.NS
 */
export const getMultipleMarketPrices = async (req, res) => {
  try {
    const { symbols } = req.query;

    if (!symbols) {
      return res.status(400).json({ 
        error: 'Symbols parameter required',
        example: '/api/market/price?symbols=INFY.NS,TCS.NS,WIPRO.NS'
      });
    }

    const symbolArray = symbols.split(',').map(s => s.trim().toUpperCase());

    if (symbolArray.length === 0 || symbolArray.length > 20) {
      return res.status(400).json({ 
        error: 'Provide 1-20 symbols (use comma separation)'
      });
    }

    const priceData = await getMultiplePrices(symbolArray);

    res.json({
      success: true,
      count: priceData.length,
      data: priceData
    });
  } catch (error) {
    console.error('Multiple market prices error:', error);
    res.status(500).json({ error: 'Server error fetching market prices' });
  }
};

/**
 * GET /api/stocks/list
 * Get all stocks with pagination
 * Query: ?page=1&pageSize=50&exchange=NSE
 */
export const getStockList = async (req, res) => {
  try {
    const { page = 1, pageSize = 50, search, exchange } = req.query;

    // If search query provided, search for it
    if (search) {
      const results = await searchStocks(search);
      return res.json({
        success: true,
        type: 'search',
        query: search,
        count: results.length,
        data: results
      });
    }

    // If exchange filter, get by exchange
    if (exchange && ['NSE', 'BSE'].includes(exchange.toUpperCase())) {
      const result = await getStocksByExchange(exchange.toUpperCase(), parseInt(page), parseInt(pageSize));
      return res.json({
        success: true,
        type: 'exchange',
        ...result
      });
    }

    // Default: get all stocks paginated
    const result = await getAllStocks(parseInt(page), parseInt(pageSize));
    res.json({
      success: true,
      type: 'all',
      ...result
    });
  } catch (error) {
    console.error('Stock list error:', error);
    res.status(500).json({ error: 'Server error fetching stock list' });
  }
};

/**
 * GET /api/stocks/:symbol
 * Get specific stock details
 */
export const getStockDetails = async (req, res) => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    const stock = await getStockBySymbol(symbol.toUpperCase());

    if (!stock) {
      return res.status(404).json({ 
        error: `Stock not found: ${symbol}`,
        suggestion: 'Try searching with /api/stocks/list?search=INFY'
      });
    }

    // Fetch live price for the stock
    const priceData = await getStockPrice(symbol.toUpperCase());

    res.json({
      success: true,
      stock,
      price: priceData || { error: 'Price data unavailable' }
    });
  } catch (error) {
    console.error('Stock details error:', error);
    res.status(500).json({ error: 'Server error fetching stock details' });
  }
};

/**
 * GET /api/stocks/search/autocomplete
 * Search stocks for autocomplete/typeahead
 * Query: ?q=inf (returns Infosys, INFY, etc.)
 */
export const searchStockAutocomplete = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 1) {
      return res.json({
        success: true,
        results: []
      });
    }

    const results = await searchStocks(q);

    res.json({
      success: true,
      query: q,
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/market/stats
 * Get market and cache statistics
 */
export const getMarketStats = async (req, res) => {
  try {
    const cacheStats = getCacheStats();
    const stockStats = getStockMasterStats();

    res.json({
      success: true,
      cache: cacheStats,
      stocks: stockStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/market/init (admin only - optional)
 * Initialize/reload stock master list
 */
export const initializeStockMaster = async (req, res) => {
  try {
    console.log('[ADMIN] Reloading stock master...');
    const stocks = await loadStockMaster();

    res.json({
      success: true,
      message: 'Stock master reloaded',
      stocksLoaded: stocks.length
    });
  } catch (error) {
    console.error('Init stock master error:', error);
    res.status(500).json({ error: 'Server error initializing stock master' });
  }
};

// Legacy functions (backward compatibility)
export const getLiveStockPrice = getMarketPrice;
export const getMultipleStockPrices = async (req, res) => {
  try {
    const { symbols } = req.body;

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of stock symbols' });
    }

    const prices = await getMultiplePrices(symbols);

    res.json({
      success: true,
      prices: prices.reduce((acc, p) => { acc[p.symbol] = p; return acc; }, {}),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get multiple stock prices error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
