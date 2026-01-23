import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';

// Connect to MongoDB
export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    return mongoose.connection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// Initialize database (collections/indexes)
export const initializeDatabase = async () => {
  try {
    console.log('✅ MongoDB collections ready');
  } catch (error) {
    console.error('Error initializing database:', error.message);
  }
};

// Get database connection
export const getDB = () => {
  return mongoose.connection.db;
};

// Export mongoose for model definitions
export default mongoose;
