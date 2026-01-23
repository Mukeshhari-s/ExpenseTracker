import axios from 'axios';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// In-memory stock cache (loads once on startup)
let stockMaster = null;
let lastLoadTime = null;

// Primary and backup NSE Bhavcopy endpoints (same data, different hosts)
const NSE_BHAVCOPY_URLS = [
  'https://archives.nseindia.com/content/equities/EQUITY_L.csv',
  'https://www1.nseindia.com/content/equities/EQUITY_L.csv'
];

const NSE_REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  'Accept': 'text/csv,text/plain,*/*',
  'Referer': 'https://www.nseindia.com'
};

/**
 * NSE Stock Master List from Bhavcopy
 * Official source: NSE website (we use a local JSON fallback)
 * 
 * Format: { symbol, name, exchange, isinCode, sector }
 * Examples: 
 *   - INFY.NS (Infosys, NSE)
 *   - TCS.NS (Tata Consultancy Services, NSE)
 *   - RELIANCE.NS (Reliance Industries, NSE)
 */

const DEFAULT_STOCKS = [
  // Top 50 NSE stocks (NIFTY 50 + NIFTY NEXT 50)
  { symbol: 'INFY.NS', name: 'Infosys Limited', exchange: 'NSE', sector: 'IT' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', exchange: 'NSE', sector: 'IT' },
  { symbol: 'WIPRO.NS', name: 'Wipro Limited', exchange: 'NSE', sector: 'IT' },
  { symbol: 'HCLTECH.NS', name: 'HCL Technologies Limited', exchange: 'NSE', sector: 'IT' },
  { symbol: 'TECHM.NS', name: 'Tech Mahindra Limited', exchange: 'NSE', sector: 'IT' },
  { symbol: 'LTTS.NS', name: 'L&T Infotech', exchange: 'NSE', sector: 'IT' },
  
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', exchange: 'NSE', sector: 'Energy' },
  { symbol: 'JSWSTEEL.NS', name: 'JSW Steel Limited', exchange: 'NSE', sector: 'Steel' },
  { symbol: 'TATASTEEL.NS', name: 'Tata Steel Limited', exchange: 'NSE', sector: 'Steel' },
  { symbol: 'HINDALCO.NS', name: 'Hindalco Industries', exchange: 'NSE', sector: 'Metals' },
  
  { symbol: 'HDFC.NS', name: 'Housing Development Finance Corporation', exchange: 'NSE', sector: 'Finance' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Limited', exchange: 'NSE', sector: 'Finance' },
  { symbol: 'SBIN.NS', name: 'State Bank of India', exchange: 'NSE', sector: 'Finance' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Limited', exchange: 'NSE', sector: 'Finance' },
  { symbol: 'AXIS.NS', name: 'Axis Bank Limited', exchange: 'NSE', sector: 'Finance' },
  { symbol: 'KOTAK.NS', name: 'Kotak Mahindra Bank', exchange: 'NSE', sector: 'Finance' },
  
  { symbol: 'LT.NS', name: 'Larsen & Toubro', exchange: 'NSE', sector: 'Construction' },
  { symbol: 'MARUTI.NS', name: 'Maruti Suzuki India', exchange: 'NSE', sector: 'Auto' },
  { symbol: 'BAJAJFINSV.NS', name: 'Bajaj Finserv', exchange: 'NSE', sector: 'Finance' },
  { symbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical Industries', exchange: 'NSE', sector: 'Pharma' },
  
  { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel Limited', exchange: 'NSE', sector: 'Telecom' },
  { symbol: 'JIOTOWER.NS', name: 'Jio Tower Limited', exchange: 'NSE', sector: 'Telecom' },
  { symbol: 'GAIL.NS', name: 'GAIL (India) Limited', exchange: 'NSE', sector: 'Energy' },
  { symbol: 'POWERGRID.NS', name: 'Power Grid Corporation of India', exchange: 'NSE', sector: 'Energy' },
  
  { symbol: 'HDFCLIFE.NS', name: 'HDFC Life Insurance', exchange: 'NSE', sector: 'Insurance' },
  { symbol: 'ICICIPRULI.NS', name: 'ICICI Prudential Life Insurance', exchange: 'NSE', sector: 'Insurance' },
  { symbol: 'LTIM.NS', name: 'LTIMindtree', exchange: 'NSE', sector: 'IT' },
  { symbol: 'MINDTREE.NS', name: 'Mindtree Limited', exchange: 'NSE', sector: 'IT' },
  
  // Popular BSE stocks
  { symbol: 'RELIANCE.BO', name: 'Reliance Industries', exchange: 'BSE', sector: 'Energy' },
  { symbol: 'TCS.BO', name: 'Tata Consultancy Services', exchange: 'BSE', sector: 'IT' },
  { symbol: 'INFY.BO', name: 'Infosys Limited', exchange: 'BSE', sector: 'IT' },
  { symbol: 'SBIN.BO', name: 'State Bank of India', exchange: 'BSE', sector: 'Finance' },
  { symbol: 'HDFCBANK.BO', name: 'HDFC Bank Limited', exchange: 'BSE', sector: 'Finance' },
];

// Try to fetch the latest Bhavcopy from NSE (rotates through backup URLs)
const fetchNSEBhavcopy = async () => {
  for (const url of NSE_BHAVCOPY_URLS) {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: NSE_REQUEST_HEADERS
      });

      if (response?.data) {
        return { data: response.data, source: url };
      }
    } catch (error) {
      console.log(`[STOCK MASTER] NSE fetch failed from ${url}: ${error.message}`);
    }
  }

  return null;
};

/**
 * Load NSE stock master list (cached in memory)
 * Can load from:
 * 1. NSE Bhavcopy CSV (if URL accessible)
 * 2. Local JSON file (fallback)
 * 3. Default hardcoded list (always available)
 */
export const loadStockMaster = async (db = null) => {
  try {
    if (stockMaster && Array.isArray(stockMaster) && stockMaster.length > 0) {
      console.log(`[STOCK MASTER] Using cached list (${stockMaster.length} stocks)`);
      return stockMaster;
    }

    console.log('[STOCK MASTER] Loading stock list...');

    // Try Option 1: Fetch from NSE website (Bhavcopy format)
    const bhavcopy = await fetchNSEBhavcopy();
    if (bhavcopy?.data) {
      try {
        const stocks = parse(bhavcopy.data, {
          columns: true,
          skip_empty_lines: true
        }).map(row => ({
          symbol: `${row['SYMBOL']}.NS`,
          name: row['NAME OF COMPANY'] || row['SYMBOL'],
          exchange: 'NSE',
          isinCode: row['ISIN CODE'] || null,
          sector: row['INDUSTRY'] || 'Others'
        }));

        stockMaster = stocks;
        lastLoadTime = new Date();
        console.log(`[STOCK MASTER] Loaded ${stocks.length} stocks from NSE Bhavcopy (${bhavcopy.source})`);
        
        // Optionally persist to DB
        if (db) {
          await persistStocksToDB(db, stocks);
        }
        
        return stocks;
      } catch (parseError) {
        console.log('[STOCK MASTER] NSE Bhavcopy parse failed:', parseError.message);
      }
    }

    // Try Option 2: Load from local JSON file
    try {
      const stocksPath = path.join(__dirname, '../data/stocks.json');
      if (fs.existsSync(stocksPath)) {
        const fileData = fs.readFileSync(stocksPath, 'utf-8');
        stockMaster = JSON.parse(fileData);
        lastLoadTime = new Date();
        console.log(`[STOCK MASTER] Loaded ${stockMaster.length} stocks from local JSON`);
        return stockMaster;
      }
    } catch (fileError) {
      console.log('[STOCK MASTER] Local JSON load failed:', fileError.message);
    }

    // Fallback: Use default hardcoded list
    stockMaster = DEFAULT_STOCKS;
    lastLoadTime = new Date();
    console.log(`[STOCK MASTER] Using default stock list (${DEFAULT_STOCKS.length} stocks)`);
    
    return stockMaster;
  } catch (error) {
    console.error('[STOCK MASTER] Error loading:', error.message);
    stockMaster = DEFAULT_STOCKS;
    return DEFAULT_STOCKS;
  }
};

/**
 * Search stocks by symbol or name
 */
export const searchStocks = async (query) => {
  try {
    if (!stockMaster || stockMaster.length === 0) {
      await loadStockMaster();
    }

    if (!query) {
      return stockMaster.slice(0, 50); // Return top 50 if no query
    }

    const q = query.toLowerCase().trim();
    const filtered = stockMaster.filter(stock => 
      stock.symbol.toLowerCase().includes(q) ||
      stock.name.toLowerCase().includes(q)
    );

    return filtered.slice(0, 20); // Limit to 20 results
  } catch (error) {
    console.error('[STOCK SEARCH] Error:', error.message);
    return [];
  }
};

/**
 * Get stock by symbol
 */
export const getStockBySymbol = async (symbol) => {
  try {
    if (!stockMaster || stockMaster.length === 0) {
      await loadStockMaster();
    }

    return stockMaster.find(s => s.symbol.toUpperCase() === symbol.toUpperCase()) || null;
  } catch (error) {
    console.error('[STOCK GET] Error:', error.message);
    return null;
  }
};

/**
 * Get all stocks (paginated)
 */
export const getAllStocks = async (page = 1, pageSize = 50) => {
  try {
    if (!stockMaster || stockMaster.length === 0) {
      await loadStockMaster();
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      total: stockMaster.length,
      page,
      pageSize,
      stocks: stockMaster.slice(start, end)
    };
  } catch (error) {
    console.error('[STOCK LIST] Error:', error.message);
    return { total: 0, page, pageSize, stocks: [] };
  }
};

/**
 * Get stocks by exchange (NSE/BSE)
 */
export const getStocksByExchange = async (exchange = 'NSE', page = 1, pageSize = 50) => {
  try {
    if (!stockMaster || stockMaster.length === 0) {
      await loadStockMaster();
    }

    const filtered = stockMaster.filter(s => s.exchange.toUpperCase() === exchange.toUpperCase());
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      total: filtered.length,
      page,
      pageSize,
      exchange,
      stocks: filtered.slice(start, end)
    };
  } catch (error) {
    console.error('[STOCK BY EXCHANGE] Error:', error.message);
    return { total: 0, page, pageSize, exchange, stocks: [] };
  }
};

/**
 * Persist stocks to database
 */
export const persistStocksToDB = async (db, stocks) => {
  try {
    console.log('[STOCK DB] Persisting stocks to database...');
    
    for (const stock of stocks) {
      await db.run(
        `INSERT OR REPLACE INTO stock_master (symbol, name, exchange, isin_code, sector, status)
         VALUES (?, ?, ?, ?, ?, 'Active')`,
        [stock.symbol, stock.name, stock.exchange, stock.isinCode || null, stock.sector || 'Others']
      );
    }
    
    console.log(`[STOCK DB] Persisted ${stocks.length} stocks`);
  } catch (error) {
    console.error('[STOCK DB] Error persisting:', error.message);
  }
};

/**
 * Get load statistics
 */
export const getStockMasterStats = () => {
  const nseCount = stockMaster?.filter(s => s.exchange === 'NSE').length || 0;
  const bseCount = stockMaster?.filter(s => s.exchange === 'BSE').length || 0;

  return {
    loaded: stockMaster && stockMaster.length > 0,
    totalStocks: stockMaster?.length || 0,
    nseStocks: nseCount,
    bseStocks: bseCount,
    lastLoadTime: lastLoadTime,
    sources: ['NSE Bhavcopy (preferred)', 'Local JSON (fallback)', 'Default hardcoded list']
  };
};

/**
 * Force reload stock master (useful for admin operations)
 */
export const reloadStockMaster = async (db = null) => {
  console.log('[STOCK MASTER] Force reloading...');
  stockMaster = null;
  lastLoadTime = null;
  return loadStockMaster(db);
};
