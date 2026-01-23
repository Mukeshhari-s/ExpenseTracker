import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import { stockAPI } from '../services/api';

/**
 * StockSearch Component
 * Features:
 * - Autocomplete/typeahead search
 * - Real-time stock price fetching
 * - NSE & BSE support
 * - Recent searches
 * - Click to select
 */
const StockSearch = ({ onSelect, onClose, showPrice = true }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchInputRef = useRef(null);
  const debounceTimer = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentStockSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  // Debounced search
  const handleSearch = async (searchQuery) => {
    setQuery(searchQuery);
    setError('');

    if (!searchQuery.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    clearTimeout(debounceTimer.current);
    setLoading(true);

    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await stockAPI.searchAutocomplete(searchQuery);
        setResults(response.data.results || []);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to search stocks');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce
  };

  // Handle stock selection
  const handleSelectStock = async (stock) => {
    try {
      setLoading(true);

      // Fetch live price
      let priceData = null;
      if (showPrice) {
        try {
          const priceResponse = await stockAPI.getMarketPrice(stock.symbol);
          priceData = priceResponse.data.data;
        } catch (err) {
          console.warn('Could not fetch price for', stock.symbol);
        }
      }

      const selectedData = {
        ...stock,
        ...priceData
      };

      setSelectedResult(selectedData);

      // Save to recent searches
      const updated = [stock, ...recentSearches.filter(s => s.symbol !== stock.symbol)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentStockSearches', JSON.stringify(updated));

      // Call parent callback
      if (onSelect) {
        onSelect(selectedData);
      }

      // Clear search
      setQuery('');
      setResults([]);
      setShowDropdown(false);
    } catch (err) {
      console.error('Selection error:', err);
      setError('Failed to select stock');
    } finally {
      setLoading(false);
    }
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div ref={searchInputRef} className="relative">
        <div className="flex items-center gap-2 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-900/20">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search stocks... (e.g., INFY, TCS, WIPRO)"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            className="flex-1 outline-none bg-transparent text-sm"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {/* Search Results Dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
            {/* Results */}
            {results.length > 0 ? (
              <div className="divide-y">
                {results.map((stock) => (
                  <div
                    key={stock.symbol}
                    onClick={() => handleSelectStock(stock)}
                    className="px-3 py-2 hover:bg-gray-700/50 cursor-pointer flex items-center justify-between transition"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-100">{stock.symbol}</div>
                      <div className="text-sm text-gray-400 truncate">{stock.name}</div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded whitespace-nowrap">
                        {stock.exchange}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : query ? (
              <div className="px-3 py-6 text-center text-gray-400 text-sm">
                No stocks found for "{query}"
              </div>
            ) : recentSearches.length > 0 ? (
              <div className="divide-y">
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-700">
                  Recent Searches
                </div>
                {recentSearches.map((stock) => (
                  <div
                    key={stock.symbol}
                    onClick={() => handleSelectStock(stock)}
                    className="px-3 py-2 hover:bg-gray-700/50 cursor-pointer flex items-center justify-between transition"
                  >
                    <div>
                      <div className="font-medium text-gray-100">{stock.symbol}</div>
                      <div className="text-xs text-gray-400">{stock.name}</div>
                    </div>
                    <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {stock.exchange}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-3 py-6 text-center text-gray-400 text-sm">
                Start typing to search stocks
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Stock Details */}
      {selectedResult && (
        <div className="mt-4 bg-gradient-to-r from-blue-900/20 to-blue-900/20 border border-blue-600 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-100">{selectedResult.symbol}</div>
              <div className="text-gray-300">{selectedResult.name}</div>
              <div className="mt-2 flex items-center gap-4">
                {selectedResult.price && (
                  <>
                    <div>
                      <div className="text-xs text-gray-400">Price</div>
                      <div className="text-lg font-semibold text-gray-100">
                        ₹{selectedResult.price.toFixed(2)}
                      </div>
                    </div>
                    {selectedResult.dayChange !== undefined && (
                      <div>
                        <div className="text-xs text-gray-400">Day Change</div>
                        <div className={`text-lg font-semibold flex items-center gap-1 ${
                          selectedResult.dayChange >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {selectedResult.dayChange >= 0 ? '+' : ''}{selectedResult.dayChange.toFixed(2)}
                          {selectedResult.percentChange !== undefined && (
                            <span className="text-sm">({selectedResult.percentChange.toFixed(2)}%)</span>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            {selectedResult.dayChange >= 0 ? (
              <TrendingUp className="text-green-600" size={24} />
            ) : (
              <TrendingUp className="text-red-600 transform rotate-180" size={24} />
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setSelectedResult(null)}
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 text-gray-200 rounded hover:bg-gray-700/50 transition"
            >
              Search Another
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StockSearch;
