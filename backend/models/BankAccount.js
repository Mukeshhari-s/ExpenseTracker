import mongoose from 'mongoose';

const bankAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a user ID'],
    },
    bankName: {
      type: String,
      required: [true, 'Please add a bank name'],
      trim: true,
    },
    accountNumber: {
      type: String,
      required: [true, 'Please add an account number'],
      trim: true,
    },
    accountType: {
      type: String,
      default: 'Savings',
      enum: ['Savings', 'Current', 'Money Market'],
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('BankAccount', bankAccountSchema);
