import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Cache for stock prices with full data (to avoid hitting API limits)
const priceCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (adjustable 1-5 min)

/**
 * Fetch live stock price from Yahoo Finance (free, no API key needed)
 * Supports NSE (.NS) and BSE (.BO) Indian stocks
 * Returns: { price, dayChange, percentChange, symbol, timestamp }
 */
export const getStockPrice = async (symbol) => {
  try {
    // Validate and normalize symbol
    if (!symbol) {
      throw new Error('Symbol is required');
    }

    // Check cache first
    const cached = priceCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`[CACHE HIT] ${symbol}`);
      return cached;
    }

    console.log(`[CACHE MISS] Fetching ${symbol}...`);

    // Method 1: Yahoo Finance API (free, no key needed)
    // Supports: INFY.NS (NSE), INFY.BO (BSE), AAPL (US stocks)
    try {
      const response = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
        { 
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );

      const result = response.data?.chart?.result?.[0];
      if (result?.meta) {
        const meta = result.meta;
        const price = meta.regularMarketPrice || 0;
        const prevClose = meta.previousClose || 0;
        const dayChange = parseFloat((price - prevClose).toFixed(2));
        const percentChange = prevClose ? parseFloat(((dayChange / prevClose) * 100).toFixed(2)) : 0;

        const priceData = {
          symbol,
          price: parseFloat(price.toFixed(2)),
          dayChange,
          percentChange,
          timestamp: Date.now(),
          source: 'yahoo_finance'
        };

        // Cache the price data
        priceCache.set(symbol, priceData);
        console.log(`[FETCHED] ${symbol}: ₹${price} (${dayChange > 0 ? '+' : ''}${dayChange})`);

        return priceData;
      }
    } catch (yahooError) {
      console.log(`[YAHOO ERROR] ${symbol}: ${yahooError.message}`);
    }

    // Method 2: Alpha Vantage (requires API key - fallback)
    if (process.env.STOCK_API_KEY && process.env.STOCK_API_KEY !== 'your_alpha_vantage_api_key') {
      try {
        const response = await axios.get(
          `https://www.alphavantage.co/query`,
          {
            params: {
              function: 'GLOBAL_QUOTE',
              symbol: symbol,
              apikey: process.env.STOCK_API_KEY
            },
            timeout: 5000
          }
        );

        const quote = response.data?.['Global Quote'];
        if (quote?.['05. price']) {
          const price = parseFloat(quote['05. price']);
          const dayChange = parseFloat(quote['09. change'] || 0);
          const percentChange = parseFloat(quote['10. change percent']?.replace('%', '') || 0);

          const priceData = {
            symbol,
            price: parseFloat(price.toFixed(2)),
            dayChange: parseFloat(dayChange.toFixed(2)),
            percentChange: parseFloat(percentChange.toFixed(2)),
            timestamp: Date.now(),
            source: 'alpha_vantage'
          };

          priceCache.set(symbol, priceData);
          console.log(`[FETCHED] ${symbol}: ${price} (${dayChange > 0 ? '+' : ''}${dayChange})`);

          return priceData;
        }
      } catch (alphaError) {
        console.log(`[ALPHA ERROR] ${symbol}: ${alphaError.message}`);
      }
    }

    // No data found
    console.warn(`[NOT FOUND] Unable to fetch price for ${symbol}`);
    return null;
  } catch (error) {
    console.error(`[ERROR] Get stock price ${symbol}:`, error.message);
    return null;
  }
};

/**
 * Fetch multiple stock prices in parallel
 */
export const getMultipleStockPrices = async (symbols) => {
  try {
    if (!Array.isArray(symbols) || symbols.length === 0) {
      throw new Error('Symbols must be a non-empty array');
    }

    const promises = symbols.map(symbol => getStockPrice(symbol));
    const results = await Promise.all(promises);
    
    // Filter out null results
    return results.filter(r => r !== null);
  } catch (error) {
    console.error('Get multiple stock prices error:', error.message);
    return [];
  }
};

/**
 * Clear price cache (can be called periodically or on demand)
 */
export const clearPriceCache = () => {
  console.log(`[CACHE CLEAR] Cleared ${priceCache.size} cached symbols`);
  priceCache.clear();
};

/**
 * Get cached price if available
 */
export const getCachedPrice = (symbol) => {
  const cached = priceCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached;
  }
  return null;
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  return {
    cachedSymbols: priceCache.size,
    cacheDuration: CACHE_DURATION / 1000 + ' seconds',
    cached: Array.from(priceCache.entries()).map(([symbol, data]) => ({
      symbol,
      price: data.price,
      age: Math.round((Date.now() - data.timestamp) / 1000) + 's'
    }))
  };
};
