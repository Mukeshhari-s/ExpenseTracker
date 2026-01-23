# 🚀 Setup Guide - Personal Finance Tracker

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation Steps

#### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# The server will automatically:
# - Create database.db file
# - Initialize database schema
# - Be ready to accept connections

# Start the backend server
npm run dev
```

Backend will run on: **http://localhost:5000**

#### 2. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

Frontend will run on: **http://localhost:3000**

### 3. Access the Application

Open your browser and go to: **http://localhost:3000**

---

## 📝 First Time Setup

### Step 1: Register Account
1. Open http://localhost:3000
2. Click on "Register" tab
3. Fill in:
   - Full Name
   - Email
   - Password (min 6 characters)
   - Preferred Currency
4. Click "Register"

### Step 2: Add Bank Accounts
1. Go to Profile (top-right icon)
2. OR go to "Banks" page
3. Click "Add Bank"
4. Fill in:
   - Bank Name (e.g., Chase, Bank of America)
   - Account Number
   - Account Type (Savings/Current/Checking)
   - Initial Balance
5. Click "Save"

### Step 3: Add Transactions
1. Go to "Banks" page
2. Click "Add Transaction"
3. Select bank account
4. Choose type (Income or Expense)
5. Enter amount, category/source, date, and notes
6. Click "Save"

### Step 4: Add Demat Accounts (for investments)
1. Go to "Portfolio" page
2. Click "Add Demat Account"
3. Fill in:
   - Broker Name (e.g., Zerodha, Upstox, Angel One)
   - Account Number
4. Click "Save"

### Step 5: Add Investments
1. Go to "Portfolio" page
2. Click "Add Investment"
3. Fill in:
   - Select Demat Account
   - Stock Symbol (e.g., AAPL, GOOGL, RELIANCE.NS)
   - Stock Name
   - Quantity
   - Buy Price
   - Buy Date
4. Click "Save"

---

## 🔑 Key Features

### ✅ Authentication
- Persistent login (token never expires)
- Stays logged in unless explicitly logged out
- Secure password hashing

### 💰 Banking & Transactions
- Multiple bank account support
- Track income and expenses
- Filter by date, category, bank
- Monthly summaries
- Auto-update bank balances

### 📈 Investment Portfolio
- Multiple demat account support
- Real-time stock prices (via Yahoo Finance API)
- Auto-calculated profit/loss
- Portfolio performance metrics
- Angel One inspired UI

### 👤 Profile Management
- Update personal details
- Change password
- Upload profile photo
- Change currency preference

---

## 🌐 API Endpoints

### Authentication
```
POST /api/auth/register - Register new user
POST /api/auth/login - Login
POST /api/auth/logout - Logout
GET /api/auth/me - Get current user
```

### Bank Accounts
```
GET /api/banks - Get all bank accounts
POST /api/banks - Add bank account
PUT /api/banks/:id - Update bank account
DELETE /api/banks/:id - Delete bank account
GET /api/banks/summary - Get account summary
```

### Transactions
```
GET /api/transactions - Get all transactions (with filters)
POST /api/transactions - Add transaction
PUT /api/transactions/:id - Update transaction
DELETE /api/transactions/:id - Delete transaction
GET /api/transactions/summary/monthly - Monthly summary
GET /api/transactions/categories - Get expense categories
```

### Demat Accounts
```
GET /api/demat - Get all demat accounts
POST /api/demat - Add demat account
PUT /api/demat/:id - Update demat account
DELETE /api/demat/:id - Delete demat account
```

### Investments
```
GET /api/investments - Get all investments
POST /api/investments - Add investment
PUT /api/investments/:id - Update investment
DELETE /api/investments/:id - Delete investment
GET /api/investments/portfolio/summary - Portfolio summary with live prices
```

### Stock Prices
```
GET /api/stocks/:symbol - Get live stock price
POST /api/stocks/bulk - Get multiple stock prices
```

### Profile
```
GET /api/profile - Get user profile
PUT /api/profile - Update profile
POST /api/profile/photo - Upload profile photo
```

---

## 🔧 Configuration

### Environment Variables (.env)

```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
STOCK_API_KEY=your_alpha_vantage_api_key  # Optional - Yahoo Finance is used by default
NODE_ENV=development
```

**Important**: 
- Change `JWT_SECRET` to a strong random string
- Stock prices work without API key (uses free Yahoo Finance)
- For Alpha Vantage API, get free key from: https://www.alphavantage.co/support/#api-key

---

## 📊 Sample Data

### Sample Stock Symbols

**US Stocks (Yahoo Finance)**
- AAPL - Apple Inc.
- GOOGL - Alphabet Inc.
- MSFT - Microsoft Corporation
- AMZN - Amazon.com Inc.
- TSLA - Tesla Inc.
- META - Meta Platforms Inc.

**Indian Stocks (Yahoo Finance)**
- RELIANCE.NS - Reliance Industries
- TCS.NS - Tata Consultancy Services
- INFY.NS - Infosys Limited
- HDFCBANK.NS - HDFC Bank
- ICICIBANK.NS - ICICI Bank

### Expense Categories Examples
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Education
- Travel
- Groceries
- Rent

### Income Sources Examples
- Salary
- Freelance
- Business
- Investments
- Bonus
- Gift

---

## 🛠 Troubleshooting

### Backend won't start
```bash
# Delete database and restart
cd backend
rm database.db
npm run dev
```

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check CORS is enabled
- Verify proxy settings in vite.config.js

### Stock prices not loading
- Yahoo Finance API is free and doesn't require API key
- Some stocks may not be available
- Check stock symbol format (e.g., RELIANCE.NS for Indian stocks)
- Wait a few seconds for API response

### Database errors
```bash
# Reinitialize database
cd backend
rm database.db
npm run dev
```

---

## 📱 Mobile Responsive

The application is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1280px)
- Tablet (768px)
- Mobile (375px)

---

## 🔒 Security Notes

⚠️ **This application is for PERSONAL USE only**

- Passwords are hashed using bcryptjs
- JWT tokens stored in localStorage
- No token expiration (persistent login)
- All API endpoints require authentication
- **Not production-ready for commercial use**
- **Change JWT_SECRET before deployment**

---

## 🎯 Next Steps

1. Customize currency symbols
2. Add more expense categories
3. Export data to CSV/PDF
4. Add data visualization charts
5. Implement budget goals
6. Add transaction search
7. Email notifications

---

## 📞 Support

For issues or questions:
- Check README.md
- Review API documentation
- Check console for errors
- Verify .env configuration

---

## 📄 License

MIT License - Personal Use Only

Built with ❤️ for personal finance management
