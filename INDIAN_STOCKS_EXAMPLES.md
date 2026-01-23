# 🎯 Indian Stocks Integration - Example Usage

Complete examples for integrating stock search and live prices into your expense tracker.

---

## 1️⃣ Update Investment Form (Add Stock Search)

**File:** `src/components/Portfolio.jsx` - Update the investment add modal

```javascript
import { useState } from 'react';
import StockSearch from './StockSearch';
import { investmentAPI, dematAPI } from '../services/api';

function Portfolio() {
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [showStockSearch, setShowStockSearch] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [formData, setFormData] = useState({
    demat_account_id: '',
    quantity: '',
    buy_price: '',
    buy_date: new Date().toISOString().split('T')[0]
  });
  const [dematAccounts, setDematAccounts] = useState([]);

  // Load demat accounts on mount
  useEffect(() => {
    loadDematAccounts();
  }, []);

  const loadDematAccounts = async () => {
    try {
      const response = await dematAPI.getAll();
      setDematAccounts(response.data);
    } catch (error) {
      console.error('Error loading demat accounts:', error);
    }
  };

  const handleStockSelected = (stock) => {
    setSelectedStock(stock);
    // Pre-fill buy price with current market price
    setFormData(prev => ({
      ...prev,
      buy_price: stock.price?.toFixed(2) || ''
    }));
    setShowStockSearch(false);
  };

  const handleAddInvestment = async (e) => {
    e.preventDefault();
    
    if (!selectedStock) {
      alert('Please select a stock');
      return;
    }

    if (!formData.demat_account_id || !formData.quantity) {
      alert('Please fill all fields');
      return;
    }

    try {
      const payload = {
        demat_account_id: formData.demat_account_id,
        stock_symbol: selectedStock.symbol,
        stock_name: selectedStock.name,
        quantity: parseFloat(formData.quantity),
        buy_price: parseFloat(formData.buy_price),
        buy_date: formData.buy_date
      };

      await investmentAPI.add(payload);
      alert('Investment added successfully!');
      
      // Reset form
      setSelectedStock(null);
      setFormData({ demat_account_id: '', quantity: '', buy_price: '', buy_date: new Date().toISOString().split('T')[0] });
      setShowInvestmentModal(false);
      
      // Refresh data
      // await fetchInvestments();
    } catch (error) {
      console.error('Error adding investment:', error);
      alert('Failed to add investment');
    }
  };

  return (
    <>
      {/* Investment Modal */}
      {showInvestmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Add Investment</h2>

            {/* Stock Search Section */}
            <div className="mb-6">
              {!selectedStock ? (
                <button
                  type="button"
                  onClick={() => setShowStockSearch(true)}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  🔍 Search Stock (NSE/BSE)
                </button>
              ) : (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{selectedStock.symbol}</h3>
                      <p className="text-sm text-gray-600">{selectedStock.name}</p>
                      {selectedStock.price && (
                        <p className="text-sm text-gray-600 mt-1">
                          Current Price: ₹{selectedStock.price.toFixed(2)}
                          {selectedStock.dayChange && (
                            <span className={selectedStock.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {' '}({selectedStock.dayChange > 0 ? '+' : ''}{selectedStock.dayChange.toFixed(2)})
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStock(null);
                        setFormData(prev => ({ ...prev, buy_price: '' }));
                      }}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Stock Search Modal */}
            {showStockSearch && (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <StockSearch 
                  onSelect={handleStockSelected}
                  showPrice={true}
                />
              </div>
            )}

            {/* Form */}
            {selectedStock && (
              <form onSubmit={handleAddInvestment} className="space-y-4">
                {/* Demat Account */}
                <div>
                  <label className="block text-sm font-medium mb-1">Demat Account</label>
                  <select
                    value={formData.demat_account_id}
                    onChange={(e) => setFormData({ ...formData, demat_account_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select demat account</option>
                    {dematAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.broker_name} ({acc.account_number})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1.00"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Buy Price */}
                <div>
                  <label className="block text-sm font-medium mb-1">Buy Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.buy_price}
                    onChange={(e) => setFormData({ ...formData, buy_price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Buy Date */}
                <div>
                  <label className="block text-sm font-medium mb-1">Buy Date</label>
                  <input
                    type="date"
                    value={formData.buy_date}
                    onChange={(e) => setFormData({ ...formData, buy_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInvestmentModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Investment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
```

---

## 2️⃣ Quick Add Button with Stock Search

**Simplified version for quick investment entry:**

```javascript
function QuickAddInvestment() {
  const [showModal, setShowModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  const handleQuickAdd = async () => {
    if (!selectedStock) return;

    // Quick add with minimum fields
    const investmentData = {
      demat_account_id: 1, // Use first demat account
      stock_symbol: selectedStock.symbol,
      stock_name: selectedStock.name,
      quantity: 1,
      buy_price: selectedStock.price,
      buy_date: new Date().toISOString().split('T')[0]
    };

    try {
      await investmentAPI.add(investmentData);
      alert(`Added 1 unit of ${selectedStock.symbol} at ₹${selectedStock.price}`);
      setSelectedStock(null);
      setShowModal(false);
    } catch (error) {
      alert('Failed to add investment');
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        ⚡ Quick Add Stock
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Quick Add Investment</h2>
            
            <StockSearch 
              onSelect={(stock) => {
                setSelectedStock(stock);
              }}
              showPrice={true}
            />

            {selectedStock && (
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleQuickAdd}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add 1 Unit @ ₹{selectedStock.price}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 3️⃣ Stock Price Monitor

**Real-time stock price display in Portfolio:**

```javascript
import { useEffect, useState } from 'react';
import { stockAPI } from '../services/api';
import { TrendingUp, TrendingDown, RotateCw } from 'lucide-react';

function StockPriceMonitor({ investments }) {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (investments.length > 0) {
      fetchPrices();
      // Refresh every 5 minutes
      const interval = setInterval(fetchPrices, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [investments]);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const symbols = [...new Set(investments.map(i => i.stock_symbol))];
      const response = await stockAPI.getMultipleMarketPrices(symbols);
      
      const priceMap = {};
      response.data.data.forEach(p => {
        priceMap[p.symbol] = p;
      });
      
      setPrices(priceMap);
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Live Stock Prices</h3>
        <button
          onClick={fetchPrices}
          disabled={loading}
          className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
        >
          <RotateCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {investments.map(investment => {
          const price = prices[investment.stock_symbol];
          const currentValue = investment.quantity * (price?.price || investment.buy_price);
          const invested = investment.quantity * investment.buy_price;
          const profitLoss = currentValue - invested;
          const profitLossPercent = (profitLoss / invested) * 100;

          return (
            <div key={investment.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-lg">{investment.stock_symbol}</h4>
                  <p className="text-sm text-gray-600">{investment.stock_name}</p>
                </div>
                {profitLoss >= 0 ? (
                  <TrendingUp className="text-green-600" size={20} />
                ) : (
                  <TrendingDown className="text-red-600" size={20} />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Current Price:</span>
                  <p className="font-semibold">
                    ₹{price?.price.toFixed(2) || investment.buy_price.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Day Change:</span>
                  <p className={`font-semibold ${price?.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {price?.dayChange >= 0 ? '+' : ''}{price?.dayChange?.toFixed(2) || 0} ({price?.percentChange?.toFixed(2) || 0}%)
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Invested:</span>
                  <p className="font-semibold">₹{invested.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Current Value:</span>
                  <p className="font-semibold">₹{currentValue.toFixed(2)}</p>
                </div>
              </div>

              <div className={`mt-3 p-2 rounded text-center font-bold ${
                profitLoss >= 0 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)} ({profitLossPercent >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%)
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## 4️⃣ Stock Search Modal (Standalone)

**Reusable modal for stock search:**

```javascript
function StockSearchModal({ isOpen, onClose, onSelect }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Search Indian Stocks</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <StockSearch 
            onSelect={(stock) => {
              onSelect(stock);
              onClose();
            }}
            showPrice={true}
          />
        </div>
      </div>
    </div>
  );
}
```

---

## 5️⃣ API Testing Script

**Test Indian stocks integration locally:**

```javascript
// Save as: test-indian-stocks.js

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
const TOKEN = 'your_token_here'; // Replace with actual token

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Authorization': `Bearer ${TOKEN}` }
});

async function testIndianStocks() {
  try {
    console.log('🧪 Testing Indian Stocks Integration...\n');

    // Test 1: Get single stock price
    console.log('1️⃣  Single Stock Price (INFY.NS):');
    const price1 = await api.get('/stocks/market/price/INFY.NS');
    console.log(JSON.stringify(price1.data.data, null, 2));
    console.log('\n');

    // Test 2: Multiple stock prices
    console.log('2️⃣  Multiple Stock Prices:');
    const prices = await api.get('/stocks/market/price?symbols=INFY.NS,TCS.NS,WIPRO.NS');
    console.log(`${prices.data.count} stocks fetched`);
    prices.data.data.forEach(p => {
      console.log(`  ${p.symbol}: ₹${p.price} (${p.dayChange > 0 ? '+' : ''}${p.dayChange}%)`);
    });
    console.log('\n');

    // Test 3: Search stocks
    console.log('3️⃣  Search Stocks (query: INFY):');
    const search = await api.get('/stocks/list?search=INFY');
    console.log(`Found ${search.data.count} results:`);
    search.data.data.forEach(s => {
      console.log(`  ${s.symbol} - ${s.name}`);
    });
    console.log('\n');

    // Test 4: Get by exchange
    console.log('4️⃣  NSE Stocks (first 5):');
    const nse = await api.get('/stocks/list?exchange=NSE&page=1&pageSize=5');
    console.log(`Total NSE stocks: ${nse.data.total}`);
    nse.data.stocks.forEach(s => {
      console.log(`  ${s.symbol} - ${s.name}`);
    });
    console.log('\n');

    // Test 5: Autocomplete
    console.log('5️⃣  Autocomplete (query: inf):');
    const autocomplete = await api.get('/stocks/search/autocomplete?q=inf');
    autocomplete.data.results.forEach(r => {
      console.log(`  ${r.symbol} - ${r.name}`);
    });
    console.log('\n');

    // Test 6: Market stats
    console.log('6️⃣  Market Stats:');
    const stats = await api.get('/stocks/market/stats');
    console.log(`  Cached symbols: ${stats.data.cache.cachedSymbols}`);
    console.log(`  Total stocks: ${stats.data.stocks.totalStocks}`);
    console.log(`  NSE: ${stats.data.stocks.nseStocks}, BSE: ${stats.data.stocks.bseStocks}`);

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testIndianStocks();
```

**Run with:**
```bash
node test-indian-stocks.js
```

---

## 🎓 Summary

**What you now have:**

✅ Near-real-time Indian stock prices (15-30 sec delay)  
✅ NSE & BSE support with proper symbol formatting  
✅ Complete stock master list with 2000+ stocks  
✅ Smart caching (1-5 minutes) to minimize API calls  
✅ Autocomplete search with recent searches  
✅ Live market data (price, day change, % change)  
✅ Easy integration into Portfolio/Investment forms  
✅ Production-ready error handling & validation  
✅ Comprehensive documentation & examples  

**Next steps:**
1. Add StockSearch component to Investment form
2. Test with sample stocks (INFY.NS, TCS.NS, WIPRO.NS)
3. Monitor cache hits in `/api/stocks/market/stats`
4. Customize cache duration based on your needs
5. Deploy to production with environment variables

---

**Happy tracking! 📈**
