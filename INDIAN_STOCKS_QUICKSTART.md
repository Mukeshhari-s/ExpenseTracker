# ⚡ Indian Stocks Integration - Quick Start

Get started with Indian stock prices in 5 minutes!

---

## 🚀 Step 1: Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Expected output:
```
💰 Personal Finance Tracker API
Server running on: http://localhost:5000
[INIT] Loading stock master list...
[INIT] Stock master loaded successfully
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.4.21  ready in 281 ms
➜  Local:   http://localhost:3000/
```

---

## ✅ Step 2: Test Stock Prices

### Quick Test in Browser
1. Open DevTools console (F12)
2. Copy & paste:
```javascript
import { stockAPI } from './services/api.js';
await stockAPI.getMarketPrice('INFY.NS');
```

Expected result:
```json
{
  "symbol": "INFY.NS",
  "price": 1845.50,
  "dayChange": 12.50,
  "percentChange": 0.68,
  "timestamp": 1674556800000
}
```

### Test Popular Stocks
```javascript
// Try these symbols:
await stockAPI.getMarketPrice('TCS.NS');     // Tata Consultancy
await stockAPI.getMarketPrice('HDFC.NS');    // HDFC Bank
await stockAPI.getMarketPrice('RELIANCE.NS'); // Reliance
```

---

## 📊 Step 3: Test Search

### Search in Console
```javascript
// Search for Infosys
const results = await stockAPI.searchStocks('INFY');
console.log(results.data.data);

// Should return both NSE and BSE symbols
```

### Autocomplete
```javascript
// Try autocomplete
const suggestions = await stockAPI.searchAutocomplete('inf');
console.log(suggestions.data.results);
```

---

## 💼 Step 4: Use in Your App

### Add Investment with Stock Search

```javascript
// In your Portfolio component
import StockSearch from './StockSearch';
import { investmentAPI } from '../services/api';

function AddInvestmentForm() {
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');

  const handleStockSelected = (stock) => {
    setSelectedStock(stock);
    setBuyPrice(stock.price.toFixed(2)); // Pre-fill with live price
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    await investmentAPI.add({
      demat_account_id: 1,
      stock_symbol: selectedStock.symbol,
      stock_name: selectedStock.name,
      quantity: parseFloat(quantity),
      buy_price: parseFloat(buyPrice),
      buy_date: new Date().toISOString().split('T')[0]
    });
    
    alert('Investment added!');
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Stock Search Component */}
      <StockSearch 
        onSelect={handleStockSelected}
        showPrice={true}
      />

      {selectedStock && (
        <>
          {/* Input Fields */}
          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Buy Price"
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
            required
          />

          <button type="submit">Add Investment</button>
        </>
      )}
    </form>
  );
}
```

---

## 📝 Step 5: Verify API Endpoints

### Check All Endpoints Working
```bash
# Get single price
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/stocks/market/price/INFY.NS"

# Get multiple prices
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/stocks/market/price?symbols=INFY.NS,TCS.NS,WIPRO.NS"

# Search
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/stocks/list?search=INFY"

# Get NSE stocks
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/stocks/list?exchange=NSE&page=1&pageSize=10"

# Check stats
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/stocks/market/stats"
```

---

## 🎯 Popular Stocks to Test

### IT Sector
- `INFY.NS` - Infosys
- `TCS.NS` - Tata Consultancy Services
- `WIPRO.NS` - Wipro

### Finance
- `HDFC.NS` - HDFC Bank
- `ICICIBANK.NS` - ICICI Bank
- `SBIN.NS` - State Bank of India

### Energy
- `RELIANCE.NS` - Reliance Industries

### Mixed
- `SUNPHARMA.NS` - Sun Pharma
- `MARUTI.NS` - Maruti Suzuki
- `LT.NS` - Larsen & Toubro

---

## 🔧 Configuration

### Change Cache Duration (optional)
Edit `backend/services/stockService.js`:
```javascript
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
// Change to 1, 3, 10 minutes as needed
```

Restart backend:
```bash
npm run dev
```

### Add Alpha Vantage Fallback (optional)
1. Get free API key: https://www.alphavantage.co/api/
2. Add to `.env`:
```env
STOCK_API_KEY=your_alpha_vantage_api_key
```

---

## ✨ Features Now Available

| Feature | Status | How to Use |
|---------|--------|-----------|
| Get live price | ✅ | `stockAPI.getMarketPrice('INFY.NS')` |
| Day change | ✅ | Returns dayChange + percentChange |
| Search stocks | ✅ | `stockAPI.searchStocks('INFY')` |
| Autocomplete | ✅ | `stockAPI.searchAutocomplete('inf')` |
| Batch prices | ✅ | `stockAPI.getMultipleMarketPrices(['INFY.NS', 'TCS.NS'])` |
| Stock list | ✅ | `stockAPI.getStockList(1, 50, 'NSE')` |

---

## 🐛 Troubleshooting

### Issue: "Cannot find module nseLoader"
**Solution:** 
```bash
# Restart backend
npm run dev
```

### Issue: "Stock prices not working"
**Solution:**
1. Check internet connection
2. Verify token in Authorization header
3. Check `/api/stocks/market/stats` for cache info

### Issue: "Autocomplete slow"
**Solution:** Already debounced at 300ms, just network latency

### Issue: Hardcoded stocks showing (NSE fetch failed)
**Solution:** Normal, fallback working. Manual reload:
```javascript
await stockAPI.initStockMaster();
```

---

## 📚 Learn More

For detailed information:
- **Architecture:** See `INDIAN_STOCKS_GUIDE.md`
- **Examples:** See `INDIAN_STOCKS_EXAMPLES.md`
- **API Docs:** See `API_REFERENCE_INDIAN_STOCKS.md`
- **Full Summary:** See `INTEGRATION_SUMMARY.md`

---

## 🎉 You're Ready!

Your expense tracker now has:
- ✅ Real-time Indian stock prices
- ✅ 2000+ stocks (NSE & BSE)
- ✅ Live day change tracking
- ✅ Smart search & autocomplete
- ✅ Production-ready integration

**Next:** Add StockSearch component to your investment form!

---

## 💡 Tips & Tricks

### Use in Portfolio Page
```javascript
// Get live prices for all holdings
const holdings = await investmentAPI.getPortfolioSummary();
// Then fetch live prices
const priceUpdates = await stockAPI.getMultipleMarketPrices(
  holdings.map(h => h.stock_symbol)
);
```

### Display Price Change
```javascript
const price = await stockAPI.getMarketPrice('INFY.NS');
const color = price.data.data.dayChange >= 0 ? 'green' : 'red';
console.log(`${price.data.data.symbol}: ${color} ${price.data.data.dayChange}%`);
```

### Handle Errors Gracefully
```javascript
try {
  const price = await stockAPI.getMarketPrice('INFY.NS');
  console.log(price.data.data);
} catch (error) {
  console.error('Could not fetch price:', error.message);
  // Use fallback or cached price
}
```

---

**🚀 Happy tracking! Start using Indian stocks now!**

---

*Quick Start Guide v1.0*  
*Last Updated: 2024-01-21*
