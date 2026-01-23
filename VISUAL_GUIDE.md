# 📸 Visual Guide - Personal Finance Tracker

## 🎯 Application Flow

### 1️⃣ Login/Registration Page

**What you'll see:**
- Beautiful gradient background
- Toggle between Login and Register
- Simple, clean form
- Currency selection (USD, EUR, GBP, INR, JPY)

**Actions:**
- Register with name, email, password
- Or login with existing credentials
- Automatic redirect to dashboard after login

---

### 2️⃣ Dashboard (Home Page)

**Statistics Cards Display:**

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│ Monthly Expenses    │  │ Net Savings         │  │ Bank Balance        │  │ Portfolio Value     │
│                     │  │                     │  │                     │  │                     │
│  $1,234.56         │  │  $500.00           │  │  $10,000.00        │  │  $25,000.00        │
│  Income: $1,734.56 │  │  This month        │  │  Across all accounts│  │  +$2,500 (11.1%)   │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

**Recent Transactions:**
```
🔴 Food & Dining          -$45.50    Chase Bank • Jan 20, 2026
🟢 Salary                 +$3,000.00 Wells Fargo • Jan 15, 2026
🔴 Transportation         -$25.00    Chase Bank • Jan 18, 2026
```

**Quick Actions:**
- Manage Banks
- View Portfolio

---

### 3️⃣ Banks & Transactions Page

**Bank Accounts Section:**

```
╔═══════════════════════════╗  ╔═══════════════════════════╗
║ 💳 Savings                ║  ║ 💳 Current                ║
║ Chase Bank                ║  ║ Wells Fargo               ║
║                           ║  ║                           ║
║ ****1234                  ║  ║ ****5678                  ║
║ $5,000.00                 ║  ║ $3,500.00                 ║
╚═══════════════════════════╝  ╚═══════════════════════════╝
```

**Filters:**
- All Types / Income / Expense
- All Banks / Specific Bank
- All Categories / Specific Category

**Transactions List:**
```
┌──────────────────────────────────────────────────────────────────┐
│ 🔴 Food & Dining                          -$45.50    ✏️  🗑️      │
│    Chase Bank • Jan 20, 2026                                     │
│    Note: Dinner with friends                                     │
├──────────────────────────────────────────────────────────────────┤
│ 🟢 Freelance Income                       +$500.00   ✏️  🗑️      │
│    Wells Fargo • Jan 18, 2026                                    │
└──────────────────────────────────────────────────────────────────┘
```

**Add Transaction Form:**
- Select Bank Account
- Type: Income or Expense
- Amount
- Category (for expense) or Source (for income)
- Date
- Notes (optional)

---

### 4️⃣ Portfolio Page (Angel One Inspired)

**Demat Accounts:**

```
╔═══════════════════════════╗  ╔═══════════════════════════╗
║ 📊 Demat Account          ║  ║ 📊 Demat Account          ║
║ Zerodha                   ║  ║ Upstox                    ║
║                           ║  ║                           ║
║ ****9876                  ║  ║ ****5432                  ║
╚═══════════════════════════╝  ╚═══════════════════════════╝
```

**Portfolio Summary (Large Card):**

```
╔════════════════════════════════════════════════════════════════════╗
║  Total Invested         Current Value          Total Profit/Loss   ║
║                                                                    ║
║  $20,000.00            $25,000.00             🔼 +$5,000.00       ║
║                                                  +25.00%           ║
╚════════════════════════════════════════════════════════════════════╝
```

**Holdings Table:**

```
┌─────────┬────────┬───────────┬─────────┬──────────┬──────────┬────────────┬─────────┐
│ Stock   │ Qty    │ Avg Price │ LTP     │ Invested │ Current  │ P&L        │ Actions │
├─────────┼────────┼───────────┼─────────┼──────────┼──────────┼────────────┼─────────┤
│ AAPL    │ 10     │ $150.00   │ $175.00 │ $1,500   │ $1,750   │ +$250.00   │ 🗑️      │
│ Apple   │        │           │         │          │          │ +16.67%    │         │
├─────────┼────────┼───────────┼─────────┼──────────┼──────────┼────────────┼─────────┤
│ GOOGL   │ 5      │ $2,800.00 │ $2,950.00│$14,000  │ $14,750  │ +$750.00   │ 🗑️      │
│ Alphabet│        │           │         │          │          │ +5.36%     │         │
└─────────┴────────┴───────────┴─────────┴──────────┴──────────┴────────────┴─────────┘
```

- 🟢 Green = Profit
- 🔴 Red = Loss
- Live prices updated from Yahoo Finance

**Add Investment Form:**
- Select Demat Account
- Stock Symbol (e.g., AAPL, GOOGL)
- Stock Name
- Quantity
- Buy Price
- Buy Date

---

### 5️⃣ Profile & Settings Page

**Profile Photo Section:**
```
┌─────────────────────┐
│                     │
│    👤 or 📷         │  Your Name
│   Profile Pic       │  your@email.com
│                     │
│  Click 📷 to change │
└─────────────────────┘
```

**Personal Information Form:**
- Full Name
- Email
- Preferred Currency

**Change Password Section:**
- Current Password
- New Password
- Confirm New Password

**Danger Zone:**
- 🚪 Logout Button

---

## 🎨 Color Scheme

```
Primary Blue:    #0ea5e9 (buttons, highlights)
Green (Profit):  #10b981
Red (Loss):      #ef4444
Gray (Text):     #1f2937
Background:      #f8fafc
Card White:      #ffffff
```

---

## 📱 Responsive Design

### Desktop (1920px)
- Full layout with sidebar navigation
- 4-column statistics grid
- Wide tables

### Tablet (768px)
- 2-column statistics grid
- Scrollable tables
- Hamburger menu

### Mobile (375px)
- Single column layout
- Stacked statistics cards
- Mobile-optimized forms
- Bottom navigation

---

## 🖱️ User Interactions

### Buttons
- **Primary (Blue)**: Main actions (Add, Save)
- **Secondary (Gray)**: Cancel, Back
- **Danger (Red)**: Delete, Logout

### Modals
- Smooth fade-in animation
- Click outside to close
- Form validation before submit

### Loading States
- Spinner animation
- Disabled buttons during operations
- Success/Error messages

### Forms
- Real-time validation
- Clear error messages
- Auto-focus on first field

---

## 💡 Tips for Best Experience

1. **Add banks first** before adding transactions
2. **Add demat accounts first** before adding investments
3. Use **correct stock symbols** (AAPL, GOOGL, RELIANCE.NS)
4. **Categories** are auto-suggested from previous entries
5. **Portfolio refreshes** automatically when you navigate to it
6. Use **Refresh button** to update live stock prices
7. **Currency** affects how amounts are displayed across the app

---

## 🎯 Common User Flows

### Adding Your First Expense
1. Login → Navigate to "Banks"
2. Click "Add Bank" → Fill details → Save
3. Click "Add Transaction"
4. Select bank, Type: Expense
5. Enter amount, category (e.g., "Food"), date
6. Save → See updated bank balance

### Tracking Your Portfolio
1. Navigate to "Portfolio"
2. Click "Add Demat Account" → Fill details → Save
3. Click "Add Investment"
4. Enter stock symbol (e.g., AAPL), quantity, buy price
5. Save → See live profit/loss calculation

### Viewing Monthly Summary
1. Navigate to "Dashboard"
2. See current month statistics automatically
3. Or go to "Banks" → View detailed transactions
4. Filter by date range if needed

---

This visual guide helps you understand what to expect at each step of using the application!
