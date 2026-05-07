# 🧠 Neural Core Advisor

AI-powered investment insights platform with live market data, technical analysis, and a RAG-powered chat advisor.

## Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + Recharts + Framer Motion
- **Backend**: Node.js + Express + MongoDB + Groq (Llama 3.3 70B) + Yahoo Finance
- **Auth**: JWT + bcrypt

---

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- [Groq API Key](https://console.groq.com) (free)

---

### Step 1 — Backend

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5002
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/neural_advisor
JWT_SECRET=change_this_to_a_random_long_string
GROQ_API_KEY=gsk_your_key_here
```

Start:
```bash
npm run dev
# ✅ Connected to MongoDB
# 🚀 Neural Core Server running on port 5002
```

---

### Step 2 — Frontend

```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

> The Vite proxy forwards `/api` requests to `http://localhost:5002`, so no CORS issues.

---

## 📂 Project Structure

```
neural-core-advisor/
├── backend/
│   ├── middleware/auth.js      # JWT verification
│   ├── models/
│   │   ├── User.js             # User schema + risk profile
│   │   └── Portfolio.js        # Portfolio schema
│   ├── routes/auth.js          # Register / Login endpoints
│   ├── index.js                # Main server + RAG engine + market APIs
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard.jsx   # Live market dashboard + charts
    │   │   ├── AdvisorPage.jsx # AI chat with RAG + chart injection
    │   │   ├── Portfolio.jsx   # Holdings tracker with live P&L
    │   │   ├── ProfileForm.jsx # Risk profile onboarding
    │   │   └── Sidebar.jsx     # Navigation
    │   ├── context/
    │   │   └── AuthContext.jsx # Auth state management
    │   ├── pages/
    │   │   └── AuthPage.jsx    # Login / Register
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js          # Proxy: /api → localhost:5002
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env.example
    └── package.json
```

---

## 🔌 API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login, get JWT |
| GET | `/api/profile` | ✅ | Get risk profile |
| POST | `/api/profile` | ✅ | Update risk profile |
| GET | `/api/portfolio` | ✅ | Get portfolio (live prices) |
| POST | `/api/portfolio` | ✅ | Add asset |
| DELETE | `/api/portfolio/:id` | ✅ | Remove asset |
| GET | `/api/market/:symbol` | — | Live quote |
| GET | `/api/market/:symbol/history` | — | 40-day chart data |
| POST | `/api/chat` | — | AI RAG chat |

---

## 🤖 How the AI Works

1. **Symbol Extraction** — Llama 3.3 extracts tickers from natural language (handles Indian stocks with `.NS`)
2. **Live Data Fetch** — Yahoo Finance fetches real-time quotes and market caps
3. **Technical Analysis** — RSI (14-day) + MACD (12/26-day MAs) computed server-side
4. **Generation** — Full context (live data + user risk profile + technicals) sent to Llama 3.3
5. **Chart Injection** — Trend charts embedded inline in chat responses

---

## 💡 Example Queries
- `"Technical audit of AAPL"` → RSI, MACD, BUY/SELL signal
- `"30-day trend for NVDA"` → Inline chart rendered in chat
- `"Compare MSFT vs GOOGL"` → Side-by-side table with live metrics
- `"Based on my risk profile, should I buy RELIANCE.NS?"` → Personalized advice
