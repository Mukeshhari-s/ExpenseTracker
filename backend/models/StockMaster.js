import mongoose from 'mongoose';

const stockMasterSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: [true, 'Please add a stock symbol'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a stock name'],
    },
    exchange: {
      type: String,
      required: [true, 'Please specify exchange'],
      enum: ['NSE', 'BSE'],
      uppercase: true,
    },
    isinCode: {
      type: String,
      default: null,
    },
    sector: {
      type: String,
      default: 'Others',
    },
    status: {
      type: String,
      default: 'Active',
      enum: ['Active', 'Inactive', 'Suspended'],
    },
  },
  { timestamps: true }
);

// Create indexes for better query performance
stockMasterSchema.index({ symbol: 1 });
stockMasterSchema.index({ exchange: 1 });
stockMasterSchema.index({ sector: 1 });

export default mongoose.model('StockMaster', stockMasterSchema);
