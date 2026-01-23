import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a user ID'],
    },
    dematAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DematAccount',
      required: [true, 'Please add a demat account ID'],
    },
    stockSymbol: {
      type: String,
      required: [true, 'Please add a stock symbol'],
      uppercase: true,
      trim: true,
    },
    stockName: {
      type: String,
      required: [true, 'Please add a stock name'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please add a quantity'],
      min: [0, 'Quantity must be positive'],
    },
    buyPrice: {
      type: Number,
      required: [true, 'Please add a buy price'],
      min: [0, 'Price must be positive'],
    },
    buyDate: {
      type: Date,
      required: [true, 'Please add a buy date'],
    },
  },
  { timestamps: true }
);

export default mongoose.model('Investment', investmentSchema);
