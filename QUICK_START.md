# 🚀 Quick Start Commands

## Installation & Setup

### One-Time Setup

```bash
# 1. Install Backend Dependencies
cd backend
npm install

# 2. Install Frontend Dependencies
cd ../frontend
npm install
```

### Running the Application

**Start Backend (Terminal 1):**
```bash
cd backend
npm run dev
```
✅ Backend running on http://localhost:5000

**Start Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```
✅ Frontend running on http://localhost:3000

### First Time Usage

1. Open http://localhost:3000
2. Click "Register" → Create account
3. Login automatically redirects to Dashboard
4. Add Bank Account (Profile or Banks page)
5. Start adding transactions
6. Add Demat Account for investments
7. Track your portfolio!

---

## Test the Backend

```bash
cd backend
node test-server.js
```

Expected output: ✅ Health check passed

---

## File Structure

```
expense/
├── backend/
│   ├── config/
│   │   └── database.js              # Database connection
│   ├── controllers/
│   │   ├── authController.js        # Login/Register
│   │   ├── bankController.js        # Bank CRUD
│   │   ├── transactionController.js # Transaction CRUD
│   │   ├── dematController.js       # Demat CRUD
│   │   ├── investmentController.js  # Investment CRUD
│   │   ├── stockController.js       # Stock prices
│   │   └── profileController.js     # Profile management
│   ├── middleware/
│   │   └── auth.js                  # JWT authentication
│   ├── models/
│   │   └── schema.sql               # Database schema
│   ├── routes/
│   │   ├── auth.js                  # Auth routes
│   │   ├── bank.js                  # Bank routes
│   │   ├── transaction.js           # Transaction routes
│   │   ├── demat.js                 # Demat routes
│   │   ├── investment.js            # Investment routes
│   │   ├── stock.js                 # Stock routes
│   │   └── profile.js               # Profile routes
│   ├── services/
│   │   └── stockService.js          # Stock price fetching
│   ├── uploads/                     # Profile photos
│   ├── .env                         # Environment variables
│   ├── package.json
│   ├── server.js                    # Main server file
│   └── test-server.js               # Health check test
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx            # Login/Register page
│   │   │   ├── Dashboard.jsx        # Home dashboard
│   │   │   ├── BankManagement.jsx   # Banks & transactions
│   │   │   ├── Portfolio.jsx        # Investment portfolio
│   │   │   ├── Profile.jsx          # Profile & settings
│   │   │   └── Navbar.jsx           # Navigation bar
│   │   ├── services/
│   │   │   └── api.js               # API client
│   │   ├── utils/
│   │   │   └── auth.js              # Auth helpers
│   │   ├── App.jsx                  # Main app component
│   │   ├── App.css                  # Global styles
│   │   └── main.jsx                 # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # Tailwind CSS config
│   └── postcss.config.js            # PostCSS config
│
├── README.md                        # Main documentation
├── SETUP_GUIDE.md                   # Setup instructions
├── ARCHITECTURE.md                  # Technical architecture
├── VISUAL_GUIDE.md                  # Visual walkthrough
├── API_TESTING.md                   # API testing examples
└── .gitignore                       # Git ignore rules
```

---

## Common Commands

### Backend

```bash
# Development mode (auto-restart)
npm run dev

# Production mode
npm start

# Test server health
node test-server.js
```

### Frontend

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Environment Variables

Create `backend/.env` file:

```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this
STOCK_API_KEY=optional_alpha_vantage_key
NODE_ENV=development
```

⚠️ **Important**: Change `JWT_SECRET` to a strong random string!

---

## Default Credentials (After Registration)

You create your own credentials during registration:
- Name: Your choice
- Email: Your choice
- Password: Minimum 6 characters
- Currency: USD, EUR, GBP, INR, or JPY

---

## Frequently Asked Questions

**Q: Do I need an API key for stock prices?**
A: No! Yahoo Finance API works without a key. Alpha Vantage is optional.

**Q: Can I use this commercially?**
A: No, this is for personal use only.

**Q: How do I backup my data?**
A: Copy `backend/database.db` file.

**Q: Can I change the port?**
A: Yes, edit `PORT` in `backend/.env` and update `vite.config.js`.

**Q: Stock symbols not working?**
A: Use correct format (AAPL for US stocks, RELIANCE.NS for Indian stocks).

**Q: How do I reset everything?**
A: Delete `backend/database.db` and restart backend.

---

## Need Help?

1. Read [SETUP_GUIDE.md](SETUP_GUIDE.md)
2. Check [ARCHITECTURE.md](ARCHITECTURE.md)
3. Review [API_TESTING.md](API_TESTING.md)
4. Look at console errors
5. Verify both servers are running

---

**Ready to start tracking your finances!** 🎉💰
