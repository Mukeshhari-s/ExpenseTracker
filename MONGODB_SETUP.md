# MongoDB Setup Guide

## Overview
This project has been converted from SQLite to MongoDB. This guide helps you set up MongoDB for the application.

---

## Option 1: Local MongoDB Installation

### Windows
1. Download MongoDB Community Edition from https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Install MongoDB as a Service"
4. MongoDB will start automatically
5. Default connection: `mongodb://localhost:27017`

### macOS (Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux (Ubuntu)
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

---

## Option 2: MongoDB Atlas (Cloud - Recommended for Production)

### Steps:
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a new cluster (free tier available)
4. Set up database user and IP whitelist
5. Copy connection string

### Connection String Format:
```
mongodb+srv://username:password@cluster.mongodb.net/expense-tracker?retryWrites=true&w=majority
```

---

## Configuration

### Local Setup (.env)
```env
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your_jwt_secret_key_here
```

### Atlas Setup (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
```

---

## Verify MongoDB Connection

### Using MongoDB Compass (GUI)
1. Download from https://www.mongodb.com/products/compass
2. Connect with URI: `mongodb://localhost:27017`
3. View databases and collections

### Using mongo shell
```bash
mongosh "mongodb://localhost:27017"
show databases
use expense-tracker
show collections
```

---

## Install Dependencies

Update dependencies to include MongoDB driver:

```bash
cd backend
npm install
```

This will install:
- `mongoose` - MongoDB ODM (Object Data Modeling)
- All other required packages

---

## Start the Application

```bash
cd backend
npm run dev
```

You should see:
```
✅ Connected to MongoDB
✅ MongoDB collections ready
💰 Personal Finance Tracker API
Server running on: http://localhost:5000
```

---

## Database Collections

The application automatically creates these collections:

1. **users** - User accounts
   - name, email, password, profilePhoto, currency

2. **bankaccounts** - Bank accounts
   - userId, bankName, accountNumber, accountType, balance

3. **transactions** - Income/Expense records
   - userId, bankAccountId, type, amount, category, date

4. **demataccounts** - Stock trading accounts
   - userId, brokerName, accountNumber

5. **investments** - Stock investments
   - userId, dematAccountId, stockSymbol, quantity, buyPrice, buyDate

6. **stockmasters** - Indian stocks reference
   - symbol, name, exchange, sector, status

---

## Troubleshooting

### "Connection refused"
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- For local: Try `mongodb://localhost:27017`
- For Atlas: Verify IP whitelist includes your IP

### "Authentication failed"
- Double-check username/password in connection string
- Verify database user exists in MongoDB Atlas
- Check for special characters in password (URL encode if needed)

### "Database not found"
- MongoDB creates databases automatically when first document is inserted
- This is normal behavior

### "Mongoose version error"
```bash
npm install mongoose@latest
```

---

## Data Migration (from SQLite)

If you have existing SQLite data:

1. **Export from SQLite**:
   ```bash
   # Use MongoDB Compass or write custom migration script
   ```

2. **Create migration script** (optional - ask for help)

3. **Import to MongoDB**:
   ```bash
   mongoimport --uri "mongodb://localhost:27017/expense-tracker" --collection users --file users.json
   ```

---

## Performance Tips

1. **Indexes**: Already created on:
   - `stockmasters.symbol`
   - `stockmasters.exchange`
   - `transactions.userId`
   - `bankaccounts.userId`

2. **Connection Pooling**: Mongoose handles automatically

3. **Query Optimization**: Use lean() for read-only queries

---

## Production Deployment

### Using MongoDB Atlas

1. Create M0 (free) or M2 cluster
2. Configure Network Access (IP whitelist)
3. Create database user with strong password
4. Use connection string in production .env
5. Enable automatic backups

### Using Self-Hosted MongoDB

1. Install MongoDB on server
2. Configure authentication
3. Set up backups
4. Monitor performance
5. Use replica sets for high availability

---

## Useful Commands

```bash
# Connect locally
mongosh mongodb://localhost:27017

# View databases
show databases

# Switch database
use expense-tracker

# View collections
show collections

# View documents
db.users.find()
db.stockmasters.find().limit(5)

# Count documents
db.users.countDocuments()

# Drop collection
db.users.drop()

# Drop database
db.dropDatabase()
```

---

## Support

For MongoDB help:
- Official Docs: https://docs.mongodb.com/
- MongoDB University: https://university.mongodb.com/
- Community: https://www.mongodb.com/community/
