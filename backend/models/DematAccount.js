import mongoose from 'mongoose';

const dematAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a user ID'],
    },
    brokerName: {
      type: String,
      required: [true, 'Please add a broker name'],
      trim: true,
    },
    accountNumber: {
      type: String,
      required: [true, 'Please add an account number'],
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('DematAccount', dematAccountSchema);
