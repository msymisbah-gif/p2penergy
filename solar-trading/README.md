# نظام محاكاة تداول فائض الطاقة الشمسية — P2P Solar Energy Trading

> Graduation thesis project — Department of Computer Engineering, Ajdabiya University, Libya.

A full-stack web simulation platform that lets virtual homes **sell and buy surplus solar energy** on a peer-to-peer market using digital wallets priced in Libyan Dinar (د.ل). Built entirely with React and Firebase — no backend server required.

---

## Features

| Module | Description |
|--------|-------------|
| **Dashboard** | Real-time energy balance, wallet balance, live buy offers, area chart of daily stats |
| **Sell Energy** | Post a sell offer with kWh amount and LYD price per unit |
| **Buy Energy** | Browse open offers, buy partial or full amounts atomically |
| **Transaction History** | Immutable ledger of all trades (buyer + seller views) |
| **Profile** | Edit name / mobile / meter reference, view system specs |
| **Wallet Top-Up** | Add virtual LYD credit with quick-pick (50/100/200/500) or custom amount |
| **Solar Simulation** | One-click daily production model (PV formula, Ajdabiya climate) |
| **Admin Dashboard** | See all homes, balances, and network-wide trading statistics |
| **Self Registration** | Any user can create a new home account with auto-generated meter code |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 19, React Router v7, Tailwind CSS v3, Recharts |
| Icons | React Icons (Font Awesome) |
| Backend | Firebase Auth (email/password) |
| Database | Cloud Firestore (real-time `onSnapshot`) |
| Atomic trades | Firestore `writeBatch` (8-step all-or-nothing) |
| Seed / Admin | Firebase Admin SDK (`scripts/seedFirestore.js`) |
| Deployment | Firebase Hosting or Vercel |

---

## Solar Production Model

Each home runs a mathematical PV simulation:

```
P(t) = P_peak × η × I(t) / I_STC
```

| Constant | Value | Description |
|----------|-------|-------------|
| `P_peak` | 3.0 kWp | Installed panel capacity per home |
| `η` | 80% | System efficiency |
| `I_STC` | 1.0 kW/m² | Standard test condition irradiance |
| Sunrise | 06:00 | Ajdabiya, Libya (lat ≈ 30.75°N) |
| Sunset | 18:00 | |
| Seasonal swing | ±20% | Peaks on summer solstice (DOY 172) |

Daily consumption is randomised between 5–15 kWh/day. Surplus = production − consumption and is added to the home's kWh balance.

---

## Project Structure

```
solar-trading/
├── public/
├── scripts/
│   └── seedFirestore.js       # One-time demo data seed (firebase-admin)
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # Sidebar (desktop) + bottom nav (mobile)
│   │   ├── EnergyChart.jsx     # Recharts area chart
│   │   ├── StatsCard.jsx       # Reusable stat widget
│   │   └── ...
│   ├── context/
│   │   └── AuthContext.jsx     # Firebase Auth + Firestore onSnapshot
│   ├── hooks/
│   │   ├── useBalance.js
│   │   └── useOffers.js
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── SellEnergy.jsx
│   │   ├── BuyEnergy.jsx
│   │   ├── TransactionHistory.jsx
│   │   ├── Profile.jsx
│   │   ├── AdminPage.jsx       # isAdmin-protected
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── services/
│   │   ├── tradeService.js     # Atomic 8-step energy trade engine
│   │   ├── homeService.js      # Registration, profile update, wallet top-up
│   │   └── productionService.js # PV simulation model
│   └── utils/
│       ├── format.js           # LYD/kWh formatters, avatar color, date helpers
│       └── meter.js            # Meter code generator, Libyan mobile validator
├── firestore.rules
├── firebase.json
├── vercel.json
├── launch.sh                   # One-command local setup script
└── .env                        # Firebase config — NEVER commit this file
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- A Firebase project (Spark plan is enough)

### 1 — Clone and enter the app folder

```bash
git clone https://github.com/msymisbah-gif/p2penergy.git
cd p2penergy/solar-trading
```

### 2 — Install dependencies

```bash
npm install
```

### 3 — Create `.env` with your Firebase config

```bash
# solar-trading/.env
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

> **Security:** `.env` is listed in `.gitignore` and must **never** be committed to GitHub.

### 4 — (Optional) Seed demo data

Download a service account key from Firebase Console → Project Settings → Service Accounts, save it as `scripts/serviceAccountKey.json`, then run:

```bash
node scripts/seedFirestore.js
```

This creates 5 demo homes in Firebase Auth + Firestore. Safe to re-run — existing users are skipped.

> `scripts/serviceAccountKey.json` is also in `.gitignore` — never commit it.

### 5 — Start the app

```bash
npm start
```

Opens at http://localhost:3000

---

## Demo Accounts

All five demo homes share the password **`Solar@2024`**.

| Email | Home Name | Role |
|-------|-----------|------|
| `home1@solar.ly` | منزل الشمس — أجدابيا | **Admin** |
| `home2@solar.ly` | منزل النور — بنغازي | User |
| `home3@solar.ly` | منزل الأمل — طبرق | User |
| `home4@solar.ly` | منزل الفجر — درنة | User |
| `home5@solar.ly` | منزل السلام — الكفرة | User |

`home1@solar.ly` has `isAdmin: true` — it can access the admin dashboard at `/admin`.

---

## Firestore Security Rules

| Collection | Read | Create | Update | Delete |
|------------|------|--------|--------|--------|
| `/homes/{uid}` | Any auth user | Owner only | Any auth user* | Never |
| `/homes/{uid}/dailyStats` | Any auth user | Owner only | Owner only | Never |
| `/offers/{offerId}` | Any auth user | Auth (own UID) | Any auth user* | Never |
| `/transactions/{txId}` | Buyer or seller | Buyer or seller | Never | Never |

\* Required for the atomic trade engine — the buyer's session must update the seller's home balance and mark the offer complete within a single `writeBatch`.

Transactions form an **immutable audit ledger** — once written they can never be modified or deleted.

---

## Deployment

### Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

### Vercel

Push to GitHub — Vercel auto-deploys. The `vercel.json` file already configures SPA rewrites so deep links work.

---

## Acceptance Tests Covered

1. User registration with Libyan mobile number validation
2. Solar production simulation (PV formula, seasonal factors)
3. Posting a sell offer with price in د.ل
4. Buying energy (partial and full fill)
5. Atomic trade — all-or-nothing Firestore batch
6. Real-time balance update after trade
7. Transaction history (immutable ledger)
8. Wallet top-up (virtual LYD credit)
9. Profile editing (name, mobile, meter reference)
10. Admin view of all homes and network stats

---

## Author

Graduation Project — Computer Engineering Department, Ajdabiya University, Libya  
Academic Year 2025–2026
