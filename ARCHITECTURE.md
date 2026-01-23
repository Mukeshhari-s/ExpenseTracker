# 🏗️ Technical Architecture Documentation

## System Overview

This is a full-stack personal finance tracker built with modern web technologies, designed for tracking expenses, banking, and investment portfolios.

---

## 🎨 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Login   │  │Dashboard │  │  Banks   │  │Portfolio │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐                                               │
│  │ Profile  │      React 18 + Vite + Tailwind CSS          │
│  └──────────┘                                               │
└────────────┬────────────────────────────────────────────────┘
             │
             │ REST API (Axios)
             │ JWT Authentication Header
             │
┌────────────┴────────────────────────────────────────────────┐
│                      Backend Layer                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Express.js REST API Server                  │  │
│  │                                                        │  │
│  │  Auth    Bank   Transaction   Demat   Investment     │  │
│  │  Routes  Routes  Routes       Routes   Routes        │  │
│  └────┬──────┬────────┬──────────┬────────┬─────────────┘  │
│       │      │        │          │        │                 │
│  ┌────▼──────▼────────▼──────────▼────────▼─────────────┐  │
│  │              Controllers Layer                        │  │
│  │  - authController    - transactionController         │  │
│  │  - bankController    - investmentController          │  │
│  │  - dematController   - stockController               │  │
│  └────┬──────────────────────────────────────────────────┘  │
│       │                                                      │
│  ┌────▼──────────────────────────────────────────────────┐  │
│  │              Services Layer                            │  │
│  │  - Stock Price Service (Yahoo Finance API)            │  │
│  │  - JWT Token Generator                                │  │
│  └────┬──────────────────────────────────────────────────┘  │
│       │                                                      │
│  ┌────▼──────────────────────────────────────────────────┐  │
│  │          Database Access Layer (Promisified)          │  │
│  │  - run()  - get()  - all()                           │  │
│  └────┬──────────────────────────────────────────────────┘  │
└───────┴──────────────────────────────────────────────────────┘
        │
┌───────▼──────────────────────────────────────────────────────┐
│                    Database Layer                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │               SQLite Database                          │ │
│  │                                                        │ │
│  │  Tables:                                              │ │
│  │  - users                                              │ │
│  │  - bank_accounts                                      │ │
│  │  - transactions                                       │ │
│  │  - demat_accounts                                     │ │
│  │  - investments                                        │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema Design

### Entity Relationship Diagram

```
┌──────────────┐
│    users     │
├──────────────┤
│ id (PK)      │──┐
│ name         │  │
│ email        │  │
│ password     │  │
│ profile_photo│  │
│ currency     │  │
│ created_at   │  │
└──────────────┘  │
                  │ 1:N
                  │
        ┌─────────┴──────────────┬──────────────┬──────────────┐
        │                        │              │              │
┌───────▼────────┐    ┌──────────▼─────┐  ┌────▼──────────┐  │
│ bank_accounts  │    │ demat_accounts │  │ transactions  │  │
├────────────────┤    ├────────────────┤  ├───────────────┤  │
│ id (PK)        │    │ id (PK)        │  │ id (PK)       │  │
│ user_id (FK)   │──┐ │ user_id (FK)   │  │ user_id (FK)  │  │
│ bank_name      │  │ │ broker_name    │  │ bank_acc (FK) │──┘
│ account_number │  │ │ account_number │  │ type          │
│ account_type   │  │ │ created_at     │  │ amount        │
│ balance        │  │ └────────┬───────┘  │ category      │
│ created_at     │  │          │          │ source        │
└────────────────┘  │          │ 1:N      │ notes         │
                    │ 1:N      │          │ date          │
                    │    ┌─────▼─────────┐│ created_at    │
                    │    │ investments   ││               │
                    │    ├───────────────┤│               │
                    │    │ id (PK)       ││               │
                    │    │ user_id (FK)  ││               │
                    │    │ demat_acc(FK) ││               │
                    │    │ stock_symbol  ││               │
                    │    │ stock_name    ││               │
                    │    │ quantity      ││               │
                    │    │ buy_price     ││               │
                    │    │ buy_date      ││               │
                    │    │ created_at    ││               │
                    │    └───────────────┘│               │
                    └─────────────────────┴───────────────┘
```

### Database Indexes

For optimal query performance:

```sql
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX idx_demat_accounts_user_id ON demat_accounts(user_id);
CREATE INDEX idx_investments_user_id ON investments(user_id);
```

---

## 🔐 Authentication Flow

### Registration Flow

```
User                    Frontend               Backend              Database
 │                         │                      │                    │
 │ Fill Registration Form  │                      │                    │
 ├────────────────────────►│                      │                    │
 │                         │ POST /api/auth/register                   │
 │                         ├─────────────────────►│                    │
 │                         │ {name, email, pass}  │                    │
 │                         │                      │ Hash Password      │
 │                         │                      │ (bcryptjs)         │
 │                         │                      │                    │
 │                         │                      │ INSERT INTO users  │
 │                         │                      ├───────────────────►│
 │                         │                      │                    │
 │                         │                      │◄───────────────────┤
 │                         │                      │ User Created       │
 │                         │                      │                    │
 │                         │                      │ Generate JWT Token │
 │                         │                      │ (NO EXPIRATION)    │
 │                         │                      │                    │
 │                         │◄─────────────────────┤                    │
 │                         │ {token, user}        │                    │
 │                         │                      │                    │
 │◄────────────────────────┤ Store Token in       │                    │
 │ Redirect to Dashboard   │ localStorage         │                    │
```

### Login Flow

```
User                    Frontend               Backend              Database
 │                         │                      │                    │
 │ Enter Credentials       │                      │                    │
 ├────────────────────────►│                      │                    │
 │                         │ POST /api/auth/login │                    │
 │                         ├─────────────────────►│                    │
 │                         │ {email, password}    │                    │
 │                         │                      │ SELECT user        │
 │                         │                      ├───────────────────►│
 │                         │                      │◄───────────────────┤
 │                         │                      │ User data          │
 │                         │                      │                    │
 │                         │                      │ Verify Password    │
 │                         │                      │ bcrypt.compare()   │
 │                         │                      │                    │
 │                         │                      │ Generate JWT Token │
 │                         │                      │ (NO EXPIRATION)    │
 │                         │                      │                    │
 │                         │◄─────────────────────┤                    │
 │                         │ {token, user}        │                    │
 │◄────────────────────────┤                      │                    │
 │ Redirect to Dashboard   │ Store in localStorage│                    │
```

### Authenticated Request Flow

```
Frontend                 Middleware              Backend              Database
 │                         │                      │                    │
 │ API Request             │                      │                    │
 ├────────────────────────►│                      │                    │
 │ Authorization: Bearer   │ Verify JWT Token     │                    │
 │ <token>                 │ jwt.verify()         │                    │
 │                         │                      │                    │
 │                         │ Token Valid?         │                    │
 │                         │ ─────┐               │                    │
 │                         │      │ Yes           │                    │
 │                         │ ◄────┘               │                    │
 │                         │                      │                    │
 │                         │ Attach user info     │                    │
 │                         │ req.user = decoded   │                    │
 │                         │                      │                    │
 │                         ├─────────────────────►│                    │
 │                         │ Continue to handler  │                    │
 │                         │                      ├───────────────────►│
 │                         │                      │ Execute Query      │
 │◄────────────────────────┴──────────────────────┤                    │
 │ Response Data                                  │                    │
```

---

## 💾 Data Flow Examples

### Adding a Transaction

```
1. User fills transaction form (amount, type, category, date)
2. Frontend validates input
3. POST /api/transactions with transaction data + JWT token
4. Backend middleware verifies JWT token
5. Controller validates transaction data
6. Controller verifies bank account belongs to user
7. INSERT transaction into transactions table
8. UPDATE bank account balance based on transaction type
   - Income: balance = balance + amount
   - Expense: balance = balance - amount
9. Return transaction object to frontend
10. Frontend refreshes transaction list and bank balance
```

### Fetching Portfolio Summary

```
1. User navigates to Portfolio page
2. GET /api/investments/portfolio/summary with JWT token
3. Backend middleware verifies token
4. Controller fetches all user investments
5. Controller groups investments by stock symbol
6. For each unique stock:
   a. Calculate total quantity
   b. Calculate average buy price
   c. Fetch live stock price from Yahoo Finance API
   d. Calculate current value (quantity × current price)
   e. Calculate profit/loss (current value - invested amount)
7. Aggregate all holdings:
   - Total invested amount
   - Total current value
   - Total profit/loss
   - Profit/loss percentage
8. Return portfolio summary with holdings array
9. Frontend displays in Angel One inspired UI
```

---

## 🌐 API Design Patterns

### RESTful Principles

```
Resource: Bank Accounts

GET    /api/banks           - List all (Read Collection)
POST   /api/banks           - Create new (Create)
GET    /api/banks/:id       - Get single (Read Single)
PUT    /api/banks/:id       - Update (Update)
DELETE /api/banks/:id       - Delete (Delete)
GET    /api/banks/summary   - Custom endpoint (Summary)
```

### Request/Response Format

**Request Example:**
```json
POST /api/transactions
Headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
Body: {
  "bank_account_id": 1,
  "type": "expense",
  "amount": 50.00,
  "category": "Food",
  "date": "2026-01-21"
}
```

**Response Example:**
```json
{
  "message": "Transaction added successfully",
  "transaction": {
    "id": 1,
    "user_id": 1,
    "bank_account_id": 1,
    "type": "expense",
    "amount": 50.00,
    "category": "Food",
    "date": "2026-01-21",
    "created_at": "2026-01-21T10:30:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "error": "Bank account not found"
}
```

---

## 📈 Stock Price Integration

### Yahoo Finance API (Free, No Key Required)

```javascript
// Endpoint Format
GET https://query1.finance.yahoo.com/v8/finance/chart/{SYMBOL}

// Examples
AAPL         - Apple Inc. (US)
GOOGL        - Alphabet Inc. (US)
RELIANCE.NS  - Reliance Industries (India)
TCS.NS       - TCS (India)
```

### Alpha Vantage API (Fallback, Requires Free Key)

```javascript
// Endpoint Format
GET https://www.alphavantage.co/query
?function=GLOBAL_QUOTE
&symbol={SYMBOL}
&apikey={API_KEY}
```

### Price Caching Strategy

```javascript
// Cache Structure
{
  'AAPL': {
    price: 150.25,
    timestamp: 1705838400000
  }
}

// Cache Duration: 5 minutes
// Reduces API calls and improves performance
```

---

## 🎨 Frontend Architecture

### Component Hierarchy

```
App.jsx (Router)
│
├── Login.jsx (Public Route)
│
└── Protected Routes
    ├── Dashboard.jsx
    │   └── Navbar.jsx
    │
    ├── BankManagement.jsx
    │   ├── Navbar.jsx
    │   ├── BankCard
    │   ├── BankModal
    │   ├── TransactionList
    │   └── TransactionModal
    │
    ├── Portfolio.jsx
    │   ├── Navbar.jsx
    │   ├── DematCard
    │   ├── DematModal
    │   ├── PortfolioSummary
    │   ├── HoldingsTable
    │   └── InvestmentModal
    │
    └── Profile.jsx
        ├── Navbar.jsx
        ├── ProfilePhoto
        ├── ProfileForm
        └── PasswordChange
```

### State Management Strategy

```javascript
// Local Component State (useState)
- Form inputs
- Modal visibility
- Loading states
- Error messages

// LocalStorage (Persistent)
- JWT Token
- User object

// API State (Fetched on mount)
- Banks, Transactions
- Demat, Investments
- Portfolio summary
```

---

## 🔒 Security Measures

### Implemented

1. **Password Hashing**: bcryptjs with salt rounds
2. **JWT Authentication**: Tokens for all protected routes
3. **Input Validation**: Both frontend and backend
4. **SQL Injection Prevention**: Parameterized queries
5. **CORS Configuration**: Controlled origin access
6. **File Upload Validation**: Size & type restrictions

### Limitations (Personal Use Only)

⚠️ **Not implemented for personal use:**
- Rate limiting
- CSRF protection
- XSS sanitization
- Session management
- Password reset
- Email verification
- Two-factor authentication

---

## 📦 Technology Stack

### Backend
```
- Node.js v16+
- Express.js 4.18
- SQLite3 5.1
- JWT 9.0
- bcryptjs 2.4
- Axios 1.6 (stock API)
- Multer 1.4 (file uploads)
```

### Frontend
```
- React 18.2
- Vite 5.0
- React Router 6.20
- Axios 1.6
- Tailwind CSS 3.3
- Lucide React (icons)
```

---

## 🚀 Performance Optimizations

1. **Database Indexes**: Fast queries on user_id and date
2. **Stock Price Caching**: 5-minute cache reduces API calls
3. **Lazy Loading**: Route-based code splitting
4. **Optimistic Updates**: Immediate UI feedback
5. **Efficient Queries**: JOINs to reduce round trips

---

## 📝 Testing Recommendations

### Backend Testing
```bash
# Test with curl or Postman
POST http://localhost:5000/api/auth/register
POST http://localhost:5000/api/auth/login
GET http://localhost:5000/api/banks
```

### Frontend Testing
```bash
# Manual testing checklist
1. Registration flow
2. Login/logout
3. Add/edit/delete banks
4. Add/edit/delete transactions
5. Portfolio calculations
6. Stock price fetching
7. Profile updates
8. Photo upload
```

---

## 🔮 Future Enhancements

1. Data Export (CSV/PDF)
2. Budget Goals
3. Expense Charts (Chart.js)
4. Recurring Transactions
5. Multi-currency Support
6. Email Notifications
7. Data Backup/Restore
8. Dark Mode
9. Mobile App (React Native)
10. Investment Recommendations

---

This documentation provides a comprehensive technical overview for developers working with or extending this application.
