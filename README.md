# 💰 Personal Finance Tracker

A comprehensive full-stack personal expense, banking, and investment tracker with authentication and real-time portfolio tracking.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)

> **Built for personal use** - A complete financial management solution to track your expenses, bank accounts, and investment portfolio with real-time stock prices.

---

## ✨ Features

### 🔐 Secure Authentication
- Persistent login with JWT (token never expires)
- Secure password hashing
- Stay logged in unless explicitly logged out

### 💳 Banking & Transactions
- Multiple bank account management
- Track income and expenses
- Auto-update bank balances
- Filter by date, category, and account
- Monthly summaries and analytics

### 📈 Investment Portfolio
- Multiple demat account support
- Real-time stock prices (Yahoo Finance API)
- Auto-calculated profit/loss
- Portfolio performance metrics
- Clean UI inspired by Angel One

### 👤 Profile Management
- Update personal details
- Change password securely
- Upload profile photo
- Multi-currency support

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone or download the project
cd expense

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server runs on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
App runs on http://localhost:3000

### First Time Setup

1. **Register**: Create your account at http://localhost:3000
2. **Add Banks**: Add your bank accounts in Profile or Banks page
3. **Add Transactions**: Start tracking income and expenses
4. **Add Demat Accounts**: Set up your investment accounts
5. **Add Investments**: Track your stock portfolio

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  - Login Page                                            │
│  - Dashboard (Home)                                      │
│  - Bank Management                                       │
│  - Investment Portfolio                                  │
│  - Profile & Settings                                    │
└────────────────┬────────────────────────────────────────┘
                 │ REST API (JWT Auth)
┌────────────────┴────────────────────────────────────────┐
│              Backend (Node.js + Express)                 │
│  - Authentication Service (JWT - No Expiry)              │
│  - Bank Service                                          │
│  - Transaction Service                                   │
│  - Investment Service                                    │
│  - Stock Price Service (Live API Integration)            │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────────────┐
│                 Database (SQLite)                        │
│  - users                                                 │
│  - bank_accounts                                         │
│  - transactions (income/expense)                         │
│  - demat_accounts                                        │
│  - investments                                           │
└─────────────────────────────────────────────────────────┘
```

## 📊 Database Schema

### Users Table
- id (PK)
- name
- email (unique)
- password (hashed)
- profile_photo
- currency (default: USD)
- created_at

### Bank Accounts Table
- id (PK)
- user_id (FK)
- bank_name
- account_number
- account_type
- balance
- created_at

### Transactions Table
- id (PK)
- user_id (FK)
- bank_account_id (FK)
- type (income/expense)
- amount
- category
- source
- notes
- date
- created_at

### Demat Accounts Table
- id (PK)
- user_id (FK)
- broker_name
- account_number
- created_at

### Investments Table
- id (PK)
- user_id (FK)
- demat_account_id (FK)
- stock_symbol
- stock_name
- quantity
- buy_price
- buy_date
- created_at

## 🔐 Authentication Flow

1. **Login**: User submits email & password
2. **Verification**: Backend validates credentials
3. **Token Generation**: JWT token created (no expiration)
4. **Token Storage**: Frontend stores token in localStorage
5. **Persistent Session**: Token sent with every API request
6. **Logout**: Token removed from localStorage

## 🚀 API Structure

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login
- POST /api/auth/logout - Logout
- GET /api/auth/me - Get current user

### Bank Management
- GET /api/banks - Get all bank accounts
- POST /api/banks - Add bank account
- PUT /api/banks/:id - Update bank account
- DELETE /api/banks/:id - Delete bank account

### Transactions
- GET /api/transactions - Get all transactions (with filters)
- POST /api/transactions - Add transaction
- PUT /api/transactions/:id - Update transaction
- DELETE /api/transactions/:id - Delete transaction
- GET /api/transactions/summary - Monthly summary

### Demat Accounts
- GET /api/demat - Get all demat accounts
- POST /api/demat - Add demat account
- PUT /api/demat/:id - Update demat account
- DELETE /api/demat/:id - Delete demat account

### Investments
- GET /api/investments - Get all investments
- POST /api/investments - Add investment
- PUT /api/investments/:id - Update investment
- DELETE /api/investments/:id - Delete investment
- GET /api/investments/portfolio - Portfolio summary

### Stock Prices
- GET /api/stocks/:symbol - Get live stock price

### User Profile
- GET /api/profile - Get user profile
- PUT /api/profile - Update profile
- POST /api/profile/photo - Upload profile photo

## 📁 Project Structure

```
expense/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bankController.js
│   │   ├── transactionController.js
│   │   ├── dematController.js
│   │   ├── investmentController.js
│   │   ├── stockController.js
│   │   └── profileController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   └── schema.sql
│   ├── routes/
│   │   ├── auth.js
│   │   ├── bank.js
│   │   ├── transaction.js
│   │   ├── demat.js
│   │   ├── investment.js
│   │   ├── stock.js
│   │   └── profile.js
│   ├── services/
│   │   └── stockService.js
│   ├── uploads/
│   ├── database.db
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── BankManagement.jsx
│   │   │   ├── TransactionForm.jsx
│   │   │   ├── Portfolio.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Navbar.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── auth.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🛠 Tech Stack

**Frontend:**
- React 18
- Vite
- Axios
- React Router
- Chart.js (for visualizations)
- Tailwind CSS

**Backend:**
- Node.js
- Express.js
- SQLite3
- bcryptjs (password hashing)
- jsonwebtoken (JWT)
- multer (file uploads)

**APIs:**
- Alpha Vantage / Yahoo Finance (stock prices)

## 📦 Installation & Setup

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔑 Key Features

✅ Persistent login (JWT without expiration)
✅ Multi-bank account support
✅ Income & Expense tracking
✅ Multi-demat account support
✅ Real-time stock portfolio tracking
✅ Live stock prices
✅ Auto-calculated profit/loss
✅ Monthly summaries
✅ Clean, responsive UI
✅ Profile management
✅ Secure authentication

## 📝 Sample Data

Will be provided after implementation.

## 🎯 Usage

1. Register/Login
2. Add bank accounts via Profile settings
3. Add demat accounts via Profile settings
4. Start adding transactions (income/expense)
5. Add investments (stocks)
6. View dashboard for complete overview
7. Track portfolio performance in real-time

## 🔒 Security Notes

- Passwords are hashed using bcryptjs
- JWT tokens stored in localStorage
- API endpoints protected with middleware
- Personal use only - not production-ready for commercial use
