# 🧪 API Testing Examples

This document provides sample API calls you can use to test the backend with tools like Postman, curl, or any HTTP client.

---

## 🔐 Authentication APIs

### Register New User

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "currency": "USD"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "currency": "USD"
  }
}
```

### Login

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "profile_photo": null,
    "currency": "USD"
  }
}
```

### Get Current User

```bash
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 🏦 Bank Account APIs

### Get All Bank Accounts

```bash
GET http://localhost:5000/api/banks
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**
```json
{
  "accounts": [
    {
      "id": 1,
      "user_id": 1,
      "bank_name": "Chase Bank",
      "account_number": "1234567890",
      "account_type": "Savings",
      "balance": 5000.00,
      "created_at": "2026-01-21T10:00:00.000Z"
    }
  ]
}
```

### Add Bank Account

```bash
POST http://localhost:5000/api/banks
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "bank_name": "Wells Fargo",
  "account_number": "9876543210",
  "account_type": "Checking",
  "balance": 3000.00
}
```

### Update Bank Account

```bash
PUT http://localhost:5000/api/banks/1
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "bank_name": "Chase Bank",
  "account_number": "1234567890",
  "account_type": "Savings",
  "balance": 5500.00
}
```

### Delete Bank Account

```bash
DELETE http://localhost:5000/api/banks/1
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Account Summary

```bash
GET http://localhost:5000/api/banks/summary
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**
```json
{
  "total_accounts": 2,
  "total_balance": 8500.00
}
```

---

## 💸 Transaction APIs

### Get All Transactions

```bash
GET http://localhost:5000/api/transactions
Authorization: Bearer YOUR_TOKEN_HERE
```

**With Filters:**
```bash
GET http://localhost:5000/api/transactions?type=expense&bank_account_id=1&start_date=2026-01-01&end_date=2026-01-31
Authorization: Bearer YOUR_TOKEN_HERE
```

### Add Transaction (Expense)

```bash
POST http://localhost:5000/api/transactions
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "bank_account_id": 1,
  "type": "expense",
  "amount": 50.00,
  "category": "Food & Dining",
  "notes": "Lunch with team",
  "date": "2026-01-21"
}
```

### Add Transaction (Income)

```bash
POST http://localhost:5000/api/transactions
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "bank_account_id": 1,
  "type": "income",
  "amount": 3000.00,
  "source": "Salary",
  "notes": "Monthly salary",
  "date": "2026-01-15"
}
```

### Update Transaction

```bash
PUT http://localhost:5000/api/transactions/1
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "amount": 55.00,
  "category": "Food & Dining",
  "notes": "Updated note"
}
```

### Delete Transaction

```bash
DELETE http://localhost:5000/api/transactions/1
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Monthly Summary

```bash
GET http://localhost:5000/api/transactions/summary/monthly
Authorization: Bearer YOUR_TOKEN_HERE
```

**With specific month:**
```bash
GET http://localhost:5000/api/transactions/summary/monthly?month=1&year=2026
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**
```json
{
  "period": {
    "start": "2026-01-01",
    "end": "2026-01-31"
  },
  "total_income": 3000.00,
  "total_expenses": 450.00,
  "net_savings": 2550.00,
  "expenses_by_category": [
    {
      "category": "Food & Dining",
      "total": 200.00,
      "count": 4
    },
    {
      "category": "Transportation",
      "total": 150.00,
      "count": 6
    }
  ],
  "expenses_by_bank": [
    {
      "bank_name": "Chase Bank",
      "total": 300.00,
      "count": 8
    }
  ]
}
```

### Get Categories

```bash
GET http://localhost:5000/api/transactions/categories
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 📊 Demat Account APIs

### Get All Demat Accounts

```bash
GET http://localhost:5000/api/demat
Authorization: Bearer YOUR_TOKEN_HERE
```

### Add Demat Account

```bash
POST http://localhost:5000/api/demat
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "broker_name": "Zerodha",
  "account_number": "ZD1234567890"
}
```

### Update Demat Account

```bash
PUT http://localhost:5000/api/demat/1
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "broker_name": "Zerodha",
  "account_number": "ZD9876543210"
}
```

### Delete Demat Account

```bash
DELETE http://localhost:5000/api/demat/1
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 📈 Investment APIs

### Get All Investments

```bash
GET http://localhost:5000/api/investments
Authorization: Bearer YOUR_TOKEN_HERE
```

**Filter by demat account:**
```bash
GET http://localhost:5000/api/investments?demat_account_id=1
Authorization: Bearer YOUR_TOKEN_HERE
```

### Add Investment

```bash
POST http://localhost:5000/api/investments
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "demat_account_id": 1,
  "stock_symbol": "AAPL",
  "stock_name": "Apple Inc.",
  "quantity": 10,
  "buy_price": 150.00,
  "buy_date": "2026-01-15"
}
```

**Indian Stock Example:**
```bash
POST http://localhost:5000/api/investments
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "demat_account_id": 1,
  "stock_symbol": "RELIANCE.NS",
  "stock_name": "Reliance Industries",
  "quantity": 50,
  "buy_price": 2500.00,
  "buy_date": "2026-01-10"
}
```

### Update Investment

```bash
PUT http://localhost:5000/api/investments/1
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "quantity": 15,
  "buy_price": 145.00
}
```

### Delete Investment

```bash
DELETE http://localhost:5000/api/investments/1
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Portfolio Summary (with live prices)

```bash
GET http://localhost:5000/api/investments/portfolio/summary
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**
```json
{
  "total_invested": 20000.00,
  "current_value": 25000.00,
  "total_profit_loss": 5000.00,
  "profit_loss_percentage": 25.00,
  "holdings": [
    {
      "stock_symbol": "AAPL",
      "stock_name": "Apple Inc.",
      "quantity": 10,
      "avg_buy_price": 150.00,
      "current_price": 175.00,
      "invested_amount": 1500.00,
      "current_value": 1750.00,
      "profit_loss": 250.00,
      "profit_loss_percentage": 16.67,
      "investments": [...]
    }
  ]
}
```

---

## 💹 Stock Price APIs

### Get Single Stock Price

```bash
GET http://localhost:5000/api/stocks/AAPL
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**
```json
{
  "symbol": "AAPL",
  "price": 175.25,
  "timestamp": "2026-01-21T10:30:00.000Z"
}
```

**Indian Stock:**
```bash
GET http://localhost:5000/api/stocks/RELIANCE.NS
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Multiple Stock Prices

```bash
POST http://localhost:5000/api/stocks/bulk
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "symbols": ["AAPL", "GOOGL", "MSFT", "RELIANCE.NS"]
}
```

**Response:**
```json
{
  "prices": {
    "AAPL": 175.25,
    "GOOGL": 2950.50,
    "MSFT": 380.75,
    "RELIANCE.NS": 2650.00
  },
  "timestamp": "2026-01-21T10:30:00.000Z"
}
```

---

## 👤 Profile APIs

### Get Profile

```bash
GET http://localhost:5000/api/profile
Authorization: Bearer YOUR_TOKEN_HERE
```

### Update Profile

```bash
PUT http://localhost:5000/api/profile
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "currency": "EUR"
}
```

**Update with Password Change:**
```bash
PUT http://localhost:5000/api/profile
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "currency": "EUR",
  "current_password": "password123",
  "new_password": "newpassword456"
}
```

### Upload Profile Photo

```bash
POST http://localhost:5000/api/profile/photo
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: multipart/form-data

profile_photo: [FILE]
```

---

## 🧪 Testing Workflow

### Complete Testing Sequence

1. **Register User**
```bash
POST /api/auth/register
```

2. **Login** (save the token)
```bash
POST /api/auth/login
```

3. **Add Bank Account**
```bash
POST /api/banks
Authorization: Bearer TOKEN
```

4. **Add Income Transaction**
```bash
POST /api/transactions
Authorization: Bearer TOKEN
```

5. **Add Expense Transaction**
```bash
POST /api/transactions
Authorization: Bearer TOKEN
```

6. **Get Monthly Summary**
```bash
GET /api/transactions/summary/monthly
Authorization: Bearer TOKEN
```

7. **Add Demat Account**
```bash
POST /api/demat
Authorization: Bearer TOKEN
```

8. **Add Investment**
```bash
POST /api/investments
Authorization: Bearer TOKEN
```

9. **Get Portfolio Summary**
```bash
GET /api/investments/portfolio/summary
Authorization: Bearer TOKEN
```

10. **Update Profile**
```bash
PUT /api/profile
Authorization: Bearer TOKEN
```

---

## 🔍 Error Responses

### 400 Bad Request
```json
{
  "error": "Please provide all required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "error": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Server Error
```json
{
  "error": "Server error"
}
```

---

## 💡 Tips for Testing

1. **Save the token** after login/register
2. **Include Authorization header** in all protected routes
3. **Test error cases** (missing fields, invalid IDs)
4. **Verify database updates** after each operation
5. **Test stock symbols** that exist (AAPL, GOOGL, etc.)
6. **Use .NS suffix** for Indian stocks (RELIANCE.NS)
7. **Test file uploads** with images < 5MB

---

Happy Testing! 🚀
