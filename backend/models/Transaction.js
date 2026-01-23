import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a user ID'],
    },
    bankAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankAccount',
      required: [true, 'Please add a bank account ID'],
    },
    type: {
      type: String,
      required: [true, 'Please specify transaction type'],
      enum: ['income', 'expense'],
    },
    amount: {
      type: Number,
      required: [true, 'Please add an amount'],
      min: [0, 'Amount must be positive'],
    },
    category: {
      type: String,
      default: 'Other',
    },
    source: {
      type: String,
      default: 'Manual',
    },
    notes: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      required: [true, 'Please add a transaction date'],
    },
  },
  { timestamps: true }
);

export default mongoose.model('Transaction', transactionSchema);
