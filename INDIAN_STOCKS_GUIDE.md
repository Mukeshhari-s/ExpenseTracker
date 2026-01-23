# 🇮🇳 Indian Stocks Integration Guide

Complete guide for near-real-time Indian stock prices and NSE master list integration.

---

## 📋 Overview

This integration provides:
- **Near real-time stock prices** via Yahoo Finance (15-30 sec delay)
- **NSE & BSE support** with proper symbol formatting (.NS, .BO)
- **Complete Indian stock master list** (NSE Bhavcopy)
- **Smart caching** (1-5 minutes) to minimize API calls
- **Autocomplete stock search** with recent searches
- **Live market data** including day change and % change

---

## 🔧 Backend Architecture

### Stock Service (`backend/services/stockService.js`)

Enhanced with Indian stock support:

```javascript
// Returns: { symbol, price, dayChange, percentChange, timestamp, source }
const priceData = await getStockPrice('INFY.NS');
// Result:
// {
//   symbol: 'INFY.NS',
//   price: 1845.50,
//   dayChange: 12.50,
//   percentChange: 0.68,
//   timestamp: 1674556800000,
//   source: 'yahoo_finance'
// }
```

**Features:**
- Yahoo Finance primary API (free, no key)
- Alpha Vantage fallback (optional, with API key)
- 5-minute cache per symbol (configurable)
- Graceful error handling
- Support for US stocks, NSE stocks (.NS), BSE stocks (.BO)

### NSE Loader Service (`backend/services/nseLoader.js`)

Manages Indian stock master list:

```javascript
// Load stock master (once on startup)
await loadStockMaster();

// Search stocks
const results = await searchStocks('INFY');
// Returns top 20 matching results

// Get specific stock
const stock = await getStockBySymbol('INFY.NS');
// Result: { symbol, name, exchange, isinCode, sector }

// Get paginated list
const page = await getAllStocks(1, 50);

// Get by exchange
const nseStocks = await getStocksByExchange('NSE', 1, 50);
```

**Data Sources (Priority Order):**
1. **NSE Bhavcopy CSV** - Official NSE equity list (preferred)
2. **Local JSON file** - Fallback `data/stocks.json`
3. **Hardcoded default** - 30+ popular stocks (always available)

---

## 🚀 API Endpoints

### Market Price Endpoints

**Get single stock price:**
```
GET /api/stocks/market/price/INFY.NS

Response:
{
  "success": true,
  "data": {
    "symbol": "INFY.NS",
    "price": 1845.50,
    "dayChange": 12.50,
    "percentChange": 0.68,
    "timestamp": 1674556800000,
    "source": "yahoo_finance"
  }
}
```

**Get multiple stock prices:**
```
GET /api/stocks/market/price?symbols=INFY.NS,TCS.NS,WIPRO.NS

Response:
{
  "success": true,
  "count": 3,
  "data": [
    { "symbol": "INFY.NS", "price": 1845.50, "dayChange": 12.50, ... },
    { "symbol": "TCS.NS", "price": 3542.00, "dayChange": -15.25, ... },
    { "symbol": "WIPRO.NS", "price": 648.75, "dayChange": 5.10, ... }
  ]
}
```

### Stock List Endpoints

**Get all stocks (paginated):**
```
GET /api/stocks/list?page=1&pageSize=50

Response:
{
  "success": true,
  "type": "all",
  "total": 2000,
  "page": 1,
  "pageSize": 50,
  "stocks": [
    { "symbol": "INFY.NS", "name": "Infosys Limited", "exchange": "NSE", ... },
    { "symbol": "TCS.NS", "name": "Tata Consultancy Services", "exchange": "NSE", ... }
  ]
}
```

**Search stocks:**
```
GET /api/stocks/list?search=INFY

Response:
{
  "success": true,
  "type": "search",
  "query": "INFY",
  "count": 3,
  "data": [
    { "symbol": "INFY.NS", "name": "Infosys Limited", "exchange": "NSE", ... },
    { "symbol": "INFY.BO", "name": "Infosys Limited", "exchange": "BSE", ... }
  ]
}
```

**Get by exchange:**
```
GET /api/stocks/list?exchange=NSE&page=1&pageSize=50

Response:
{
  "success": true,
  "type": "exchange",
  "exchange": "NSE",
  "total": 1500,
  "page": 1,
  "pageSize": 50,
  "stocks": [...]
}
```

**Autocomplete search:**
```
GET /api/stocks/search/autocomplete?q=inf

Response:
{
  "success": true,
  "query": "inf",
  "count": 5,
  "results": [
    { "symbol": "INFY.NS", "name": "Infosys Limited", "exchange": "NSE", ... }
  ]
}
```

**Get stock details with live price:**
```
GET /api/stocks/INFY.NS

Response:
{
  "success": true,
  "stock": {
    "symbol": "INFY.NS",
    "name": "Infosys Limited",
    "exchange": "NSE",
    "sector": "IT"
  },
  "price": {
    "symbol": "INFY.NS",
    "price": 1845.50,
    "dayChange": 12.50,
    "percentChange": 0.68,
    "timestamp": 1674556800000
  }
}
```

### Statistics & Admin

**Get market statistics:**
```
GET /api/stocks/market/stats

Response:
{
  "success": true,
  "cache": {
    "cachedSymbols": 15,
    "cacheDuration": "300 seconds",
    "cached": [
      { "symbol": "INFY.NS", "price": 1845.50, "age": "45s" }
    ]
  },
  "stocks": {
    "loaded": true,
    "totalStocks": 2000,
    "nseStocks": 1500,
    "bseStocks": 500,
    "lastLoadTime": "2024-01-21T10:30:00.000Z"
  }
}
```

**Admin: Reload stock master:**
```
POST /api/stocks/admin/init

Response:
{
  "success": true,
  "message": "Stock master reloaded",
  "stocksLoaded": 2000
}
```

---

## 💻 Frontend Integration

### API Service

Updated `src/services/api.js`:

```javascript
// New market price methods
await stockAPI.getMarketPrice('INFY.NS');
await stockAPI.getMultipleMarketPrices(['INFY.NS', 'TCS.NS']);

// New stock list methods
await stockAPI.getStockList(page, pageSize, exchange);
await stockAPI.searchStocks(query);
await stockAPI.searchAutocomplete(query);
await stockAPI.getStockDetails(symbol);
await stockAPI.getMarketStats();
```

### StockSearch Component

New component `src/components/StockSearch.jsx`:

```javascript
import StockSearch from '../components/StockSearch';

// In your JSX
<StockSearch 
  onSelect={(stock) => handleStockSelected(stock)}
  onClose={() => closeModal()}
  showPrice={true}
/>
```

**Features:**
- Debounced autocomplete search (300ms)
- Recent searches (cached in localStorage)
- Live price fetching on selection
- NSE & BSE filtering
- Responsive design
- Error handling

### Example: Add Investment with Stock Search

```javascript
const [showStockSearch, setShowStockSearch] = useState(false);
const [selectedStock, setSelectedStock] = useState(null);

const handleAddInvestment = async (formData) => {
  const payload = {
    ...formData,
    stock_symbol: selectedStock.symbol,
    stock_name: selectedStock.name,
    buy_price: selectedStock.price // Use live price
  };
  
  await investmentAPI.add(payload);
  // success
};

return (
  <>
    <button onClick={() => setShowStockSearch(true)}>
      Search Stock
    </button>
    
    {showStockSearch && (
      <StockSearch 
        onSelect={(stock) => {
          setSelectedStock(stock);
          setShowStockSearch(false);
        }}
      />
    )}
  </>
);
```

---

## 📊 Database Schema

**New `stock_master` table:**

```sql
CREATE TABLE stock_master (
  id INTEGER PRIMARY KEY,
  symbol TEXT UNIQUE NOT NULL,      -- 'INFY.NS' or 'INFY.BO'
  name TEXT NOT NULL,                -- 'Infosys Limited'
  exchange TEXT NOT NULL,            -- 'NSE' or 'BSE'
  isin_code TEXT,                    -- Optional ISIN code
  sector TEXT,                       -- 'IT', 'Finance', etc.
  status TEXT DEFAULT 'Active',      -- 'Active', 'Suspended'
  created_at DATETIME
);

-- Indexes for fast lookup
CREATE INDEX idx_stock_master_symbol ON stock_master(symbol);
CREATE INDEX idx_stock_master_exchange ON stock_master(exchange);
```

---

## 🔗 Stock Symbol Rules

### Format: `SYMBOL.EXCHANGE`

**NSE (National Stock Exchange):**
- Suffix: `.NS`
- Examples: `INFY.NS`, `TCS.NS`, `RELIANCE.NS`
- Most liquid stocks, highest trading volume

**BSE (Bombay Stock Exchange):**
- Suffix: `.BO`
- Examples: `INFY.BO`, `TCS.BO`, `RELIANCE.BO`
- Same companies, different exchange

### Popular Stocks

**IT Sector (NSE):**
- INFY.NS - Infosys
- TCS.NS - Tata Consultancy Services
- WIPRO.NS - Wipro
- HCLTECH.NS - HCL Technologies
- TECHM.NS - Tech Mahindra

**Finance Sector (NSE):**
- HDFC.NS - HDFC Bank
- ICICIBANK.NS - ICICI Bank
- SBIN.NS - State Bank of India
- HDFCBANK.NS - HDFC Bank
- AXIS.NS - Axis Bank

**Energy Sector (NSE):**
- RELIANCE.NS - Reliance Industries
- GAIL.NS - GAIL (India)
- POWERGRID.NS - Power Grid Corporation

**Pharma Sector (NSE):**
- SUNPHARMA.NS - Sun Pharmaceutical
- CIPLA.NS - Cipla
- APOLLOHOSP.NS - Apollo Hospitals

---

## ⚙️ Configuration

### Cache Duration

In `backend/services/stockService.js`:

```javascript
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (adjust as needed)
// 1 min:  1 * 60 * 1000
// 3 min:  3 * 60 * 1000
// 5 min:  5 * 60 * 1000 (default)
```

### API Keys (Optional)

In `.env`:

```env
# Yahoo Finance (free, no key needed)
STOCK_API_SOURCE=yahoo_finance

# Alpha Vantage (optional fallback, requires free API key)
STOCK_API_KEY=your_alpha_vantage_api_key
```

Get free Alpha Vantage key: https://www.alphavantage.co/api/

---

## 🧪 Testing

### Test API Endpoints

**Using cURL:**

```bash
# Test single stock price
curl -X GET "http://localhost:5000/api/stocks/market/price/INFY.NS" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test multiple prices
curl -X GET "http://localhost:5000/api/stocks/market/price?symbols=INFY.NS,TCS.NS" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Search stocks
curl -X GET "http://localhost:5000/api/stocks/list?search=INFY" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get NSE stocks only
curl -X GET "http://localhost:5000/api/stocks/list?exchange=NSE&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Autocomplete
curl -X GET "http://localhost:5000/api/stocks/search/autocomplete?q=inf" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Using Frontend API Service:**

```javascript
import { stockAPI } from './services/api';

// Test in browser console
await stockAPI.getMarketPrice('INFY.NS');
await stockAPI.searchAutocomplete('infy');
await stockAPI.getStockList(1, 50, 'NSE');
```

---

## 🐛 Troubleshooting

### Issue: "Symbol not found"

**Cause:** Invalid symbol format or stock doesn't exist
**Solution:** 
- Use format: `SYMBOL.NS` or `SYMBOL.BO`
- Search for stock first: `/api/stocks/list?search=INFY`
- Check symbol is in master list

### Issue: "Could not fetch price"

**Cause:** Yahoo Finance API timeout or rate limit
**Solution:**
- Check internet connection
- Wait a few seconds and retry
- Verify symbol exists
- Check cache: `/api/stocks/market/stats`

### Issue: "Stock master not loaded"

**Cause:** NSE Bhavcopy fetch failed during startup
**Solution:**
- Using default hardcoded stocks (30+ available)
- Manually reload: `POST /api/stocks/admin/init`
- Place local `backend/data/stocks.json` file as backup

### Issue: Slow autocomplete

**Cause:** Large result set or network lag
**Solution:**
- Increase debounce timer in StockSearch.jsx
- Limit results to top 20 (already done)
- Check network latency

---

## 📈 Performance Tips

1. **Cache properly:** Use 5 min cache to reduce API calls 10x
2. **Batch requests:** Use `/market/price?symbols=...` for multiple stocks
3. **Pagination:** Use page/pageSize when loading stock list
4. **Recent searches:** Cache locally in localStorage
5. **Monitor stats:** Check `/market/stats` to see cache hit rate

---

## 🔐 Security Notes

- All endpoints require JWT authentication
- Stock data is public (no sensitive info)
- Rate limiting recommended for production
- Validate symbol format on frontend & backend
- Don't expose API keys in client code

---

## 🚀 Production Deployment

### Database Setup

```sql
-- Run migration on production DB
CREATE TABLE IF NOT EXISTS stock_master (...);
CREATE INDEX idx_stock_master_symbol ON stock_master(symbol);

-- Load initial stock master
INSERT INTO stock_master (symbol, name, exchange, sector) 
SELECT symbol, name, exchange, sector FROM [source];
```

### Environment Variables

```env
# Production
NODE_ENV=production
STOCK_API_SOURCE=yahoo_finance
CACHE_DURATION=300000  # 5 minutes
```

### Monitoring

```javascript
// Log cache hit rate
const stats = await stockAPI.getMarketStats();
console.log(`Cache hit rate: ${stats.cache.cachedSymbols} symbols cached`);
```

---

## 📚 Example Integration Flow

```
User Flow:
1. User clicks "Add Investment" in Portfolio
2. Clicks "Search Stock" button
3. StockSearch component opens
4. User types "INFY" → autocomplete fires
5. API calls: /api/stocks/search/autocomplete?q=infy
6. Shows top results in dropdown
7. User clicks "INFY.NS - Infosys"
8. Component fetches: /api/stocks/market/price/INFY.NS
9. Shows live price ₹1845.50, day change, etc.
10. User confirms selection
11. Form pre-fills with stock details
12. User enters quantity, buy price, date
13. Form submits → investment created
```

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review API response errors
3. Check backend logs: `npm run dev` output
4. Check browser console for frontend errors
5. Verify network requests in DevTools

---

**Last Updated:** 2024-01-21  
**Version:** 1.0.0  
**Status:** Production Ready ✅
