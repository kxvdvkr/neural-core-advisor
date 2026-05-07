# 🧠 Neural Core Advisor

> An AI-powered investment insights platform that combines live market data, technical analysis, and a RAG-based chat advisor — built for both Indian and US markets.

![Stack](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![Stack](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js)
![Stack](https://img.shields.io/badge/AI-Llama%203.3%2070B-orange?style=flat)
![Stack](https://img.shields.io/badge/DB-MongoDB-47A248?style=flat&logo=mongodb)
![Stack](https://img.shields.io/badge/License-MIT-blue?style=flat)

---

## 📌 Overview

Neural Core Advisor is a full-stack financial AI application that helps users make smarter investment decisions. It pulls **live stock prices** from Yahoo Finance, computes **RSI and MACD signals** server-side, and feeds the combined context into **Groq's Llama 3.3 70B** model to generate grounded, real-time financial advice — eliminating hallucinations about "not having access to current data."

Users can track a personal portfolio with live P&L, set a detailed investor risk profile, and receive personalized AI recommendations all in one interface.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 AI Chat Advisor | RAG pipeline — Llama 3.3 answers with live market context injected |
| 📊 Technical Analysis | Server-side RSI (14-day) + MACD (12/26 MA) with BUY/SELL/NEUTRAL signals |
| 📈 Live Market Data | Real-time quotes, P/E ratios, market cap, and % change via Yahoo Finance |
| 📉 Trend Charts | 30-day inline price charts rendered directly inside chat responses |
| 💼 Portfolio Tracker | Add/remove holdings with live P&L and sector tagging |
| 👤 Investor Profile | Risk tolerance, income range, net worth, and primary objective settings |
| 🔐 Authentication | JWT-based register/login with bcrypt password hashing (7-day tokens) |
| 🌏 Multi-market | Supports NSE Indian stocks (`.NS`) and all US/global Yahoo Finance tickers |

---

## 🗂️ Project Structure

```
neural-core-advisor/
├── backend/
│   ├── index.js                  # Express server, RAG pipeline, all API routes
│   ├── middleware/
│   │   └── auth.js               # JWT verification middleware
│   ├── models/
│   │   ├── User.js               # User schema with full risk profile fields
│   │   └── Portfolio.js          # Portfolio holdings schema
│   ├── routes/
│   │   └── auth.js               # POST /register and POST /login
│   ├── .env.example              # Environment variable template
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AdvisorPage.jsx   # AI chat UI with markdown + chart rendering
    │   │   ├── Dashboard.jsx     # Live market overview with price charts
    │   │   ├── Portfolio.jsx     # Holdings table with live P&L calculations
    │   │   ├── ProfileForm.jsx   # Investor profile onboarding form
    │   │   └── Sidebar.jsx       # App navigation
    │   ├── context/
    │   │   └── AuthContext.jsx   # Global auth state (token + user)
    │   ├── pages/
    │   │   └── AuthPage.jsx      # Login / Register page
    │   ├── App.jsx               # Route definitions
    │   ├── main.jsx
    │   └── index.css             # Tailwind base styles
    ├── index.html
    ├── vite.config.js            # Dev proxy: /api → localhost:5002
    ├── tailwind.config.js
    ├── .env.example
    └── package.json
```

---

## 🛠️ Tech Stack

### Frontend
| Package | Version | Purpose |
|---|---|---|
| React | 18.2 | UI framework |
| Vite | 5.0 | Build tool & dev server |
| Tailwind CSS | 3.4 | Utility-first styling |
| Recharts | 2.10 | Price trend charts |
| Framer Motion | 10.16 | UI animations |
| React Markdown | 9.0 | Renders AI responses as formatted markdown |
| Axios | 1.6 | HTTP client |
| Lucide React | 0.303 | Icon library |

### Backend
| Package | Version | Purpose |
|---|---|---|
| Express | 4.18 | HTTP server & routing |
| Mongoose | 8.0 | MongoDB ODM |
| Groq SDK | 0.3 | Llama 3.3 70B AI completions |
| Yahoo Finance 2 | 2.11 | Live market data & historical prices |
| jsonwebtoken | 9.0 | JWT auth tokens |
| bcryptjs | 2.4 | Password hashing |
| dotenv | 16.3 | Environment variable loading |
| nodemon | 3.0 | Dev server auto-restart |
| cors | 2.8 | Cross-origin request handling |

---

## 🤖 How the AI Works (RAG Pipeline)

The chat endpoint at `POST /api/chat` runs a 4-step Retrieval-Augmented Generation pipeline:

```
User Message
     │
     ▼
[Step 1] Symbol Extraction
  Llama 3.3 extracts ticker symbols from natural language.
  Indian companies auto-get .NS suffix (e.g., RELIANCE → RELIANCE.NS)
     │
     ▼
[Step 2] Live Data Retrieval
  Yahoo Finance fetches real-time quotes:
  price, P/E ratio, market cap, daily % change
     │
     ▼  (if "audit / why / recommend" detected)
[Step 3] Technical Analysis
  Server computes RSI (14-day) + MACD (12/26 MA crossover)
  Generates BULLISH BUY / BEARISH SELL / NEUTRAL signal
     │
     ▼
[Step 4] Grounded Generation
  Full context (live data + technicals + last 4 chat turns)
  injected into Llama 3.3 system prompt → structured markdown response
     │
     ▼  (if "trend / graph / 30-day" detected)
[Step 5] Chart Injection
  30-day historical data appended as [CHART_DATA:...] token
  Frontend parses it and renders an inline Recharts line chart
```

The system prompt strictly constrains the model to finance topics only — non-finance queries receive the fixed response: *"I can't help you with that."*

---

## 🗃️ Data Models

### User
```
name             String   (required)
email            String   (required, unique)
password         String   (required, bcrypt hashed)
incomeRange      String
netWorth         String
liquidityRatio   String
sourceOfWealth   String
riskTolerance    String
primaryObjective String
tradingAutonomy  String
timestamps       (createdAt, updatedAt)
```

### Portfolio
```
user       ObjectId → User   (required)
symbol     String            (required, stored uppercase)
name       String            (required)
qty        Number            (required)
avgCost    Number            (required)
sector     String            (default: "Trading")
timestamps (createdAt, updatedAt)
```

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password }` | `{ token, user }` |
| POST | `/api/auth/login` | `{ email, password }` | `{ token, user }` |

### AI Chat
| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/api/chat` | `{ message, history[] }` | `{ reply }` |

### Market Data
| Method | Endpoint | Auth | Response |
|---|---|---|---|
| GET | `/api/market/:symbol` | No | `{ symbol, price, change, currency }` |
| GET | `/api/market/:symbol/history` | No | `[{ name, value }]` — last 20 days |

### Portfolio (JWT Required)
| Method | Endpoint | Body | Response |
|---|---|---|---|
| GET | `/api/portfolio` | — | Array of holdings with live prices |
| POST | `/api/portfolio` | `{ symbol, name, qty, avgCost, sector }` | `{ success, item }` |
| DELETE | `/api/portfolio/:id` | — | `{ success }` |

### Profile (JWT Required)
| Method | Endpoint | Body | Response |
|---|---|---|---|
| GET | `/api/profile` | — | User object (password excluded) |
| POST | `/api/profile` | `{ incomeRange, netWorth, riskTolerance, ... }` | `{ success }` |

> **Authentication**: Protected endpoints require the header `Authorization: Bearer <token>`

---

## 💬 Example Chat Queries

```
"What is the current price of TCS?"
→ Live NSE quote with P/E and market cap

"Technical audit of AAPL — should I buy?"
→ RSI value, MACD momentum, BUY/SELL/NEUTRAL signal + reasoning

"Show me the 30-day trend for RELIANCE.NS"
→ Text analysis + inline line chart rendered in chat

"Compare INFY.NS and WIPRO.NS"
→ Side-by-side markdown table with live metrics

"Based on my risk profile, is NVDA a good investment?"
→ Personalized advice factoring user's stored risk tolerance
```

---

## 🌏 Supported Markets

The app uses Yahoo Finance tickers directly:

| Market | Format | Examples |
|---|---|---|
| NSE India | `TICKER.NS` | `RELIANCE.NS`, `TCS.NS`, `ZOMATO.NS`, `INFY.NS` |
| BSE India | `TICKER.BO` | `RELIANCE.BO` |
| US Markets | `TICKER` | `AAPL`, `NVDA`, `MSFT`, `GOOGL` |
| Other Global | Yahoo format | `BABA`, `TSM`, `NIO` |

The AI model automatically appends `.NS` for well-known Indian company names mentioned in natural language.

---

## 🔐 Security

- Passwords are hashed using **bcryptjs** with a cost factor of 12
- JWT tokens expire after **7 days**
- Protected routes validate the token on every request via the `auth` middleware
- The `JWT_SECRET` in `.env` should be a long, random string — never commit the actual value
- MongoDB credentials should use a restricted database user with only read/write access to the `neural_advisor` database

---

## 📄 Environment Variables

```env
# backend/.env

PORT=5002
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/neural_advisor
JWT_SECRET=your_super_secret_random_string_min_32_chars
GROQ_API_KEY=gsk_your_groq_api_key_here
```

```env
# frontend/.env

VITE_API_URL=http://localhost:5002
```

---

## 📁 .gitignore Recommendations

Ensure these are excluded from version control:

```
node_modules/
.env
frontend/dist/
.DS_Store
Thumbs.db
```

---

## 🙌 Acknowledgements

- [Groq](https://groq.com) — Ultra-fast inference for Llama 3.3 70B
- [Yahoo Finance 2](https://github.com/gadicc/node-yahoo-finance2) — Real-time and historical market data
- [Recharts](https://recharts.org) — Composable chart library for React
- [Framer Motion](https://www.framer.com/motion/) — Production-ready animation library

---

## 📝 License

This project is licensed under the MIT License.
