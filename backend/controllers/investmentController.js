import Investment from '../models/Investment.js';
import DematAccount from '../models/DematAccount.js';
import { getStockPrice } from '../services/stockService.js';

// Get all investments
export const getInvestments = async (req, res) => {
  try {
    const { dematAccountId } = req.query;

    let query = { userId: req.user.userId };
    if (dematAccountId) query.dematAccountId = dematAccountId;

    const investments = await Investment.find(query)
      .populate('dematAccountId', 'brokerName')
      .sort({ createdAt: -1 });

    res.json({ investments });
  } catch (error) {
    console.error('Get investments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add investment
export const addInvestment = async (req, res) => {
  try {
    const { dematAccountId, stockSymbol, stockName, quantity, buyPrice, buyDate } = req.body;

    if (!dematAccountId || !stockSymbol || !stockName || !quantity || !buyPrice || !buyDate) {
      return res.status(400).json({ 
        error: 'Please provide all required fields' 
      });
    }

    // Verify demat account belongs to user
    const dematAccount = await DematAccount.findOne({ 
      _id: dematAccountId, 
      userId: req.user.userId 
    });

    if (!dematAccount) {
      return res.status(404).json({ error: 'Demat account not found' });
    }

    const investment = await Investment.create({
      userId: req.user.userId,
      dematAccountId,
      stockSymbol: stockSymbol.toUpperCase(),
      stockName,
      quantity,
      buyPrice,
      buyDate: new Date(buyDate)
    });

    res.status(201).json({
      message: 'Investment added successfully',
      investment
    });
  } catch (error) {
    console.error('Add investment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update investment
export const updateInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const { dematAccountId, stockSymbol, stockName, quantity, buyPrice, buyDate } = req.body;

    const investment = await Investment.findOne({ 
      _id: id, 
      userId: req.user.userId 
    });

    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    const updatedInvestment = await Investment.findByIdAndUpdate(
      id,
      {
        dematAccountId: dematAccountId || investment.dematAccountId,
        stockSymbol: stockSymbol ? stockSymbol.toUpperCase() : investment.stockSymbol,
        stockName: stockName || investment.stockName,
        quantity: quantity !== undefined ? quantity : investment.quantity,
        buyPrice: buyPrice !== undefined ? buyPrice : investment.buyPrice,
        buyDate: buyDate ? new Date(buyDate) : investment.buyDate
      },
      { new: true }
    );

    res.json({
      message: 'Investment updated successfully',
      investment: updatedInvestment
    });
  } catch (error) {
    console.error('Update investment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete investment
export const deleteInvestment = async (req, res) => {
  try {
    const { id } = req.params;

    const investment = await Investment.findOne({ 
      _id: id, 
      userId: req.user.userId 
    });

    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    await Investment.findByIdAndDelete(id);

    res.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    console.error('Delete investment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get portfolio summary with live prices
export const getPortfolioSummary = async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user.userId });

    if (investments.length === 0) {
      return res.json({
        totalInvested: 0,
        currentValue: 0,
        totalProfitLoss: 0,
        profitLossPercentage: 0,
        holdings: []
      });
    }

    // Group investments by stock symbol
    const holdings = {};

    for (const inv of investments) {
      const symbol = inv.stock_symbol;
      
      if (!holdings[symbol]) {
        holdings[symbol] = {
          stock_symbol: symbol,
          stock_name: inv.stock_name,
          total_quantity: 0,
          total_invested: 0,
          investments: []
        };
      }

      holdings[symbol].total_quantity += parseFloat(inv.quantity);
      holdings[symbol].total_invested += parseFloat(inv.quantity) * parseFloat(inv.buy_price);
      holdings[symbol].investments.push(inv);
    }

    // Get live prices for all stocks
    const holdingsArray = [];
    let totalInvested = 0;
    let totalCurrentValue = 0;

    for (const symbol in holdings) {
      const holding = holdings[symbol];
      const avgBuyPrice = holding.total_invested / holding.total_quantity;

      // Fetch live price
      let currentPrice = avgBuyPrice; // Default to buy price
      try {
        const livePrice = await getStockPrice(symbol);
        if (livePrice) {
          currentPrice = livePrice;
        }
      } catch (error) {
        console.log(`Could not fetch live price for ${symbol}, using average buy price`);
      }

      const currentValue = holding.total_quantity * currentPrice;
      const profitLoss = currentValue - holding.total_invested;
      const profitLossPercentage = (profitLoss / holding.total_invested) * 100;

      totalInvested += holding.total_invested;
      totalCurrentValue += currentValue;

      holdingsArray.push({
        stock_symbol: symbol,
        stock_name: holding.stock_name,
        quantity: holding.total_quantity,
        avg_buy_price: avgBuyPrice,
        current_price: currentPrice,
        invested_amount: holding.total_invested,
        current_value: currentValue,
        profit_loss: profitLoss,
        profit_loss_percentage: profitLossPercentage,
        investments: holding.investments
      });
    }

    const totalProfitLoss = totalCurrentValue - totalInvested;
    const totalProfitLossPercentage = totalInvested > 0 
      ? (totalProfitLoss / totalInvested) * 100 
      : 0;

    res.json({
      total_invested: totalInvested,
      current_value: totalCurrentValue,
      total_profit_loss: totalProfitLoss,
      profit_loss_percentage: totalProfitLossPercentage,
      holdings: holdingsArray
    });
  } catch (error) {
    console.error('Get portfolio summary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
