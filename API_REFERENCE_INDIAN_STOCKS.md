# 📡 Indian Stocks API Reference

Complete API endpoint reference for Indian stock integration.

---

## 🔗 Base URL
```
http://localhost:5000/api/stocks
```

All endpoints require `Authorization: Bearer {token}` header.

---

## 📊 Market Price Endpoints

### Get Single Stock Price
```http
GET /market/price/:symbol

Example:
GET /market/price/INFY.NS
```

**Response:**
```json
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

### Get Multiple Stock Prices
```http
GET /market/price?symbols=INFY.NS,TCS.NS,WIPRO.NS

Query Parameters:
- symbols (required): Comma-separated list (max 20)
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "symbol": "INFY.NS",
      "price": 1845.50,
      "dayChange": 12.50,
      "percentChange": 0.68,
      "timestamp": 1674556800000,
      "source": "yahoo_finance"
    },
    {
      "symbol": "TCS.NS",
      "price": 3542.00,
      "dayChange": -15.25,
      "percentChange": -0.43,
      "timestamp": 1674556800000,
      "source": "yahoo_finance"
    },
    {
      "symbol": "WIPRO.NS",
      "price": 648.75,
      "dayChange": 5.10,
      "percentChange": 0.79,
      "timestamp": 1674556800000,
      "source": "yahoo_finance"
    }
  ]
}
```

---

## 🔍 Stock List & Search

### Get All Stocks (Paginated)
```http
GET /list?page=1&pageSize=50

Query Parameters:
- page (optional): Page number (default: 1)
- pageSize (optional): Results per page (default: 50, max: 100)
```

**Response:**
```json
{
  "success": true,
  "type": "all",
  "total": 2000,
  "page": 1,
  "pageSize": 50,
  "stocks": [
    {
      "symbol": "INFY.NS",
      "name": "Infosys Limited",
      "exchange": "NSE",
      "isinCode": "INE009A01021",
      "sector": "IT"
    }
  ]
}
```

### Search Stocks
```http
GET /list?search=INFY

Query Parameters:
- search (required): Search term (min: 1 char)
```

**Response:**
```json
{
  "success": true,
  "type": "search",
  "query": "INFY",
  "count": 2,
  "data": [
    {
      "symbol": "INFY.NS",
      "name": "Infosys Limited",
      "exchange": "NSE",
      "sector": "IT"
    },
    {
      "symbol": "INFY.BO",
      "name": "Infosys Limited",
      "exchange": "BSE",
      "sector": "IT"
    }
  ]
}
```

### Search by Exchange
```http
GET /list?exchange=NSE&page=1&pageSize=50

Query Parameters:
- exchange (required): "NSE" or "BSE"
- page (optional): Page number
- pageSize (optional): Results per page
```

**Response:**
```json
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

---

## 🔤 Autocomplete & Search

### Autocomplete/Typeahead
```http
GET /search/autocomplete?q=inf

Query Parameters:
- q (optional): Search query (min: 1 char)
- Returns max 20 results
```

**Response:**
```json
{
  "success": true,
  "query": "inf",
  "count": 5,
  "results": [
    {
      "symbol": "INFY.NS",
      "name": "Infosys Limited",
      "exchange": "NSE",
      "sector": "IT"
    },
    {
      "symbol": "INFY.BO",
      "name": "Infosys Limited",
      "exchange": "BSE",
      "sector": "IT"
    }
  ]
}
```

### Get Stock Details
```http
GET /:symbol

Example:
GET /INFY.NS
```

**Response:**
```json
{
  "success": true,
  "stock": {
    "symbol": "INFY.NS",
    "name": "Infosys Limited",
    "exchange": "NSE",
    "isinCode": "INE009A01021",
    "sector": "IT"
  },
  "price": {
    "symbol": "INFY.NS",
    "price": 1845.50,
    "dayChange": 12.50,
    "percentChange": 0.68,
    "timestamp": 1674556800000,
    "source": "yahoo_finance"
  }
}
```

---

## 📈 Statistics

### Get Market & Cache Statistics
```http
GET /market/stats
```

**Response:**
```json
{
  "success": true,
  "cache": {
    "cachedSymbols": 15,
    "cacheDuration": "300 seconds",
    "cached": [
      {
        "symbol": "INFY.NS",
        "price": 1845.50,
        "age": "45s"
      },
      {
        "symbol": "TCS.NS",
        "price": 3542.00,
        "age": "120s"
      }
    ]
  },
  "stocks": {
    "loaded": true,
    "totalStocks": 2000,
    "nseStocks": 1500,
    "bseStocks": 500,
    "lastLoadTime": "2024-01-21T10:30:00.000Z",
    "sources": [
      "NSE Bhavcopy (preferred)",
      "Local JSON (fallback)",
      "Default hardcoded list"
    ]
  },
  "timestamp": "2024-01-21T11:45:30.000Z"
}
```

---

## 🔧 Admin Endpoints

### Initialize/Reload Stock Master
```http
POST /admin/init

Note: Can be called anytime to refresh stock list
```

**Response:**
```json
{
  "success": true,
  "message": "Stock master reloaded",
  "stocksLoaded": 2000
}
```

---

## 🔄 Legacy Endpoints (Backward Compatibility)

### Get Live Stock Price (Legacy)
```http
GET /:symbol

Same as /market/price/:symbol
```

### Get Multiple Stock Prices (Legacy)
```http
POST /bulk

Body: { "symbols": ["INFY.NS", "TCS.NS"] }

Returns format: { prices: { "INFY.NS": {...}, ... } }
```

---

## ⚠️ Error Responses

### Invalid Symbol
```json
{
  "error": "Invalid symbol format. Use INFY.NS (NSE) or INFY.BO (BSE)",
  "symbol": "INFY",
  "example": "INFY.NS or TCS.NS"
}
```

### Symbol Not Found
```json
{
  "error": "Could not fetch price for INVALID.NS. Check symbol or try again later.",
  "symbol": "INVALID.NS"
}
```

### Missing Parameters
```json
{
  "error": "Symbols parameter required",
  "example": "/api/market/price?symbols=INFY.NS,TCS.NS"
}
```

### Too Many Symbols
```json
{
  "error": "Provide 1-20 symbols (use comma separation)"
}
```

### Server Error
```json
{
  "error": "Server error fetching market price"
}
```

---

## 🧪 cURL Examples

### Get INFY.NS Price
```bash
curl -X GET "http://localhost:5000/api/stocks/market/price/INFY.NS" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Multiple Prices
```bash
curl -X GET "http://localhost:5000/api/stocks/market/price?symbols=INFY.NS,TCS.NS,WIPRO.NS" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Search Stocks
```bash
curl -X GET "http://localhost:5000/api/stocks/list?search=INFY" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get NSE Stocks
```bash
curl -X GET "http://localhost:5000/api/stocks/list?exchange=NSE&page=1&pageSize=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Autocomplete
```bash
curl -X GET "http://localhost:5000/api/stocks/search/autocomplete?q=inf" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Stock Details
```bash
curl -X GET "http://localhost:5000/api/stocks/INFY.NS" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Stats
```bash
curl -X GET "http://localhost:5000/api/stocks/market/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Reload Stock Master
```bash
curl -X POST "http://localhost:5000/api/stocks/admin/init" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 JavaScript Examples

```javascript
import { stockAPI } from './services/api';

// Get single price
const price = await stockAPI.getMarketPrice('INFY.NS');
console.log(price.data.data);
// Output: { symbol: 'INFY.NS', price: 1845.50, dayChange: 12.50, ... }

// Get multiple prices
const prices = await stockAPI.getMultipleMarketPrices(['INFY.NS', 'TCS.NS']);
console.log(prices.data.data);
// Output: Array of price objects

// Search stocks
const results = await stockAPI.searchStocks('INFY');
console.log(results.data.data);
// Output: Array of matching stocks

// Get by exchange
const nseStocks = await stockAPI.getStockList(1, 50, 'NSE');
console.log(nseStocks.data);
// Output: { total: 1500, stocks: [...] }

// Autocomplete
const suggestions = await stockAPI.searchAutocomplete('inf');
console.log(suggestions.data.results);
// Output: Array of 20 matching stocks

// Get stock details
const details = await stockAPI.getStockDetails('INFY.NS');
console.log(details.data);
// Output: { stock: {...}, price: {...} }

// Get statistics
const stats = await stockAPI.getMarketStats();
console.log(stats.data.cache.cachedSymbols);
// Output: 15 (number of cached symbols)
```

---

## 🎯 Popular Stock Symbols

### IT Sector
```
INFY.NS  Infosys
TCS.NS   Tata Consultancy Services
WIPRO.NS Wipro
HCLTECH.NS HCL Technologies
TECHM.NS Tech Mahindra
LTIM.NS  LTIMindtree
```

### Finance
```
HDFC.NS      HDFC Bank
ICICIBANK.NS ICICI Bank
SBIN.NS      State Bank of India
HDFCBANK.NS  HDFC Bank
AXIS.NS      Axis Bank
KOTAK.NS     Kotak Mahindra Bank
```

### Energy
```
RELIANCE.NS Reliance Industries
GAIL.NS     GAIL India
POWERGRID.NS Power Grid
```

### Pharma
```
SUNPHARMA.NS Sun Pharmaceutical
CIPLA.NS     Cipla
APOLLOHOSP.NS Apollo Hospitals
```

---

## 📊 Response Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Stock data returned |
| 400 | Bad Request | Missing/invalid parameters |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Token expired |
| 404 | Not Found | Symbol not found |
| 500 | Server Error | API unavailable |

---

## ⏱️ Performance

| Operation | Time |
|-----------|------|
| Get cached price | <10ms |
| Get fresh price | <2s |
| Search 2000 stocks | <100ms |
| Autocomplete | <50ms (with debounce) |
| Batch 20 prices | <2s |

---

## 🔐 Rate Limiting (Production)

Recommended limits:
```
- /market/price: 60 req/min per user
- /list: 30 req/min per user
- /search: 30 req/min per user
- /admin/*: 5 req/min (admin only)
```

---

## 📚 Related Documentation

- [INDIAN_STOCKS_GUIDE.md](INDIAN_STOCKS_GUIDE.md) - Complete guide
- [INDIAN_STOCKS_EXAMPLES.md](INDIAN_STOCKS_EXAMPLES.md) - Integration examples
- [INDIAN_STOCKS_COMPLETE.md](INDIAN_STOCKS_COMPLETE.md) - Completion summary

---

*Last Updated: 2024-01-21*  
*API Version: 1.0.0*
