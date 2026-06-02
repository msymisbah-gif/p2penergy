# PROJECT CONTEXT — P2P Solar Energy Trading Platform
### (Paste this file into Claude at the start of any new session to resume work)

---

## 1. What This Project Is

A **full-stack web simulation platform** for a university graduation thesis at **Ajdabiya University, Libya — Department of Computer Engineering**. It simulates peer-to-peer trading of surplus solar energy between virtual homes. All prices are in **Libyan Dinar (د.ل)**. Numbers displayed use **Western Arabic numerals (1, 2, 3)** — NOT Eastern Arabic (١, ٢, ٣) — which is the Libyan/Maghreb convention.

The entire UI is in **Arabic, right-to-left (RTL)**. There is no backend server — Firebase handles everything.

**GitHub repository:** `https://github.com/msymisbah-gif/p2penergy`  
**Active development branch:** `claude/bold-gates-DeDRF`  
**App folder:** `p2penergy/solar-trading/` (the React app lives here, not the repo root)

---

## 2. Tech Stack

| Layer | Library / Service | Version |
|-------|-------------------|---------|
| UI framework | React | 19 |
| Routing | React Router | v7 |
| Styling | Tailwind CSS | v3 |
| Charts | Recharts | v3 |
| Icons | React Icons (Font Awesome) | v5 |
| Auth | Firebase Authentication (email/password) | v12 |
| Database | Cloud Firestore (real-time `onSnapshot`) | v12 |
| Atomic trades | Firestore `writeBatch` | — |
| Seed script | Firebase Admin SDK | v13 |
| Deployment | Firebase Hosting OR Vercel | — |

---

## 3. Folder Structure

```
p2penergy/                          ← git repo root
└── solar-trading/                  ← React app (ALL commands run from here)
    ├── .env                        ← Firebase keys — NEVER COMMIT TO GITHUB
    ├── firestore.rules
    ├── firebase.json
    ├── vercel.json                 ← SPA rewrite rules for Vercel
    ├── launch.sh                   ← One-command local setup
    ├── tailwind.config.js
    ├── package.json
    ├── scripts/
    │   ├── seedFirestore.js        ← Creates 5 demo Auth users + Firestore docs
    │   └── serviceAccountKey.json  ← NEVER COMMIT — firebase-admin key
    ├── public/
    └── src/
        ├── App.js                  ← Route definitions
        ├── firebase.js             ← Firebase init (reads from .env)
        ├── index.css               ← Tailwind directives + custom CSS classes
        ├── components/
        │   ├── Layout.jsx          ← Sidebar (desktop ≥lg) + bottom nav (mobile <lg)
        │   ├── EnergyChart.jsx     ← Recharts AreaChart for daily stats
        │   ├── StatsCard.jsx       ← Reusable stat widget with trend indicator
        │   ├── RecentTransactions.jsx
        │   ├── PaymentModal.jsx
        │   ├── PrivateRoute.jsx    ← Redirects to /login if not authenticated
        │   └── LoadingScreen.jsx
        ├── context/
        │   └── AuthContext.jsx     ← Firebase Auth listener + Firestore onSnapshot
        ├── hooks/
        │   ├── useBalance.js
        │   └── useOffers.js
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx    ← Self sign-up: name, email, mobile, password
        │   ├── Dashboard.jsx       ← Home screen with stats, chart, live offers
        │   ├── SellEnergy.jsx      ← Post a sell offer
        │   ├── BuyEnergy.jsx       ← Browse + buy open offers
        │   ├── TransactionHistory.jsx
        │   ├── Profile.jsx         ← Edit profile, wallet top-up, solar simulation
        │   ├── AdminPage.jsx       ← isAdmin-protected: all homes overview
        │   └── NotFound.jsx
        ├── services/
        │   ├── tradeService.js     ← 8-step atomic trade engine
        │   ├── homeService.js      ← registerHome, updateHomeProfile, topUpWallet
        │   └── productionService.js ← PV solar simulation model
        └── utils/
            ├── format.js           ← formatLYD, formatKwh, formatDate, getAvatarColor, getInitial
            └── meter.js            ← generateMeterRef, isValidLibyanMobile, normalizeMobile
```

---

## 4. Firestore Collections & Document Schemas

### `/homes/{uid}`
One document per user, `uid` matches Firebase Auth UID.

```js
{
  name:           string,    // "منزل الشمس — أجدابيا"
  ownerEmail:     string,    // "home1@solar.ly"
  mobile:         string,    // "0912345001" (normalised, no spaces)
  meterRef:       string,    // "MTR-AJ-10001" (auto-generated, user-editable)
  balance:        number,    // kWh balance (energy available to sell)
  walletBalance:  number,    // LYD balance (money for buying energy)
  totalProduced:  number,    // lifetime kWh produced
  totalConsumed:  number,    // lifetime kWh consumed
  totalSold:      number,    // lifetime kWh sold
  totalPurchased: number,    // lifetime kWh purchased
  joinedAt:       Timestamp,
  updatedAt:      Timestamp, // set on profile edits / top-ups
  lastSimulation: Timestamp, // set when production simulation runs
  isActive:       boolean,
  isAdmin:        boolean,   // true only for home1@solar.ly (admin account)
}
```

### `/homes/{uid}/dailyStats/{YYYY-MM-DD}`
Written by the solar simulation button in Profile.

```js
{
  date:        Timestamp,
  production:  number,   // kWh produced that day
  consumption: number,   // kWh consumed that day
  surplus:     number,   // kWh surplus (added to home balance)
  simulatedAt: Timestamp,
}
```

### `/offers/{offerId}`
Sell offers on the open market.

```js
{
  sellerUid:    string,
  sellerName:   string,
  amount:       number,      // kWh remaining (decrements on partial buys)
  pricePerKwh:  number,      // LYD per kWh
  status:       'open' | 'completed' | 'cancelled',
  createdAt:    Timestamp,
  // On completion:
  buyerUid:     string,
  buyerName:    string,
  completedAt:  Timestamp,
  // On cancellation:
  cancelledAt:  Timestamp,
}
```

### `/transactions/{txId}`  — IMMUTABLE LEDGER
Never update or delete. Written atomically during a trade.

```js
{
  paymentReference: string,   // "PAY-XXXXX-YYYYY" unique ref
  offerId:          string,
  sellerUid:        string,
  sellerName:       string,
  buyerUid:         string,
  buyerName:        string,
  kwh:              number,
  pricePerKwh:      number,
  total:            number,   // LYD = kwh × pricePerKwh
  currency:         'LYD',
  status:           'completed',
  timestamp:        Timestamp,
}
```

---

## 5. Firebase Config (.env)

The app reads these from environment variables. File lives at `solar-trading/.env`.  
**⚠ NEVER commit `.env` to GitHub — it is in `.gitignore`.**

```
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

---

## 6. Firestore Security Rules (firestore.rules)

```
/homes/{uid}
  read:   any authenticated user (needed for market / admin view)
  create: owner only (uid == auth.uid)
  update: any authenticated user  ← required for atomic trade engine
  delete: never

/homes/{uid}/dailyStats/{statId}
  read:   any authenticated user
  write:  owner only

/offers/{offerId}
  read:   any authenticated user
  create: authenticated, sellerUid == auth.uid, status == 'open'
  update: any authenticated user  ← buyer must mark offer completed
  delete: never

/transactions/{txId}  — IMMUTABLE
  read:   buyer or seller only
  create: buyer or seller only
  update: never
  delete: never
```

---

## 7. AuthContext (how auth + data flows)

`src/context/AuthContext.jsx` does two things in one `useEffect`:

1. Subscribes to `onAuthStateChanged` — sets `currentUser`
2. When a user logs in, opens a `onSnapshot` listener on `/homes/{uid}` — sets `homeData`

Every component that needs the logged-in user or their home data calls:

```js
const { currentUser, homeData, signOut } = useAuth();
```

`homeData` updates in real-time whenever Firestore changes (e.g. after a trade, balance updates instantly without a page refresh).

`homeData.isAdmin === true` → admin features are shown (admin nav link, admin page access).

---

## 8. Atomic Trade Engine (8 steps)

`src/services/tradeService.js` — `executeEnergyTrade({ offerId, buyerUid, amount })`

1. Validate inputs (amount > 0, valid offerId, buyerUid)
2. Fetch offer document, verify status === 'open'
3. Fetch seller and buyer home documents
4. Verify seller has enough kWh; verify buyer has enough LYD
5. `writeBatch` — deduct kWh from seller, add to buyer; transfer LYD from buyer to seller
6. Update offer: if fully consumed → status='completed', else reduce `amount` (partial fill)
7. Write immutable transaction document to `/transactions`
8. `batch.commit()` — all-or-nothing

---

## 9. Solar Production Model

`src/services/productionService.js`

**Formula:** `P(t) = P_peak × η × I(t) / I_STC`

| Constant | Value |
|----------|-------|
| P_peak | 3.0 kWp |
| η (eta) | 0.80 (80%) |
| I_STC | 1.0 kW/m² |
| Sunrise | 06:00 |
| Sunset | 18:00 |
| Seasonal base | 0.95 |
| Seasonal amplitude | ±0.20 (peaks on summer solstice DOY 172) |
| I(t) range | 0.65 – 0.95 (random per sample) |

Daily simulation: samples each hour with midpoint irradiance (power kW × 1h = kWh).  
Daily consumption: randomised 5–15 kWh/day.  
Surplus = max(0, production − consumption) → added to home's kWh balance.

---

## 10. Custom Tailwind Classes

Defined in `src/index.css`. Use these everywhere — don't invent new ones:

| Class | What it styles |
|-------|----------------|
| `.card` | Dark glassmorphism card (`bg-dark-800 border border-dark-700 rounded-2xl p-5`) |
| `.btn-primary` | Amber/solar gradient button |
| `.btn-secondary` | Dark outline button |
| `.input-field` | Dark input with border, focus ring |
| `.sidebar-link` | Desktop nav item (icon + label, hover state) |
| `.sidebar-link.active` | Active nav item with solar accent |
| `.text-gradient` | Solar amber gradient text |
| `.glow-solar` | Box shadow glow effect |
| `.animate-pulse-glow` | Keyframe glow pulse animation |

**Custom Tailwind colors:**
- `solar-400/500` → amber (#fbbf24 / #f59e0b) — primary accent
- `dark-700/800/850/900/950` → dark slate shades for backgrounds
- Font: `Cairo` / `Tajawal` (Arabic-optimised Google Fonts)

---

## 11. Key Utility Functions

### `src/utils/format.js`
```js
formatLYD(n, digits=2)        // "120.50 د.ل"
formatKwh(n, digits=1)        // "14.5 kWh"
formatDateTime(ts)             // "12 يناير 2026 • 14:30"
formatDate(ts)                 // "12 يناير 2026"
formatRelativeTime(ts)         // "منذ 5 دقيقة"
getAvatarColor(name)           // deterministic hex color from name string
getInitial(name)               // first character of name
```

### `src/utils/meter.js`
```js
generateMeterRef(regionCode='AJ')   // "MTR-AJ-04821"
isValidLibyanMobile(value)           // true for 09XXXXXXXX or +2189XXXXXXXX
normalizeMobile(value)               // strips spaces and dashes
```

---

## 12. Demo Accounts

All created by `node scripts/seedFirestore.js`. Shared password: **`Solar@2024`**

| Email | Home Name | Special |
|-------|-----------|---------|
| `home1@solar.ly` | منزل الشمس — أجدابيا | **isAdmin: true** |
| `home2@solar.ly` | منزل النور — بنغازي | — |
| `home3@solar.ly` | منزل الأمل — طبرق | — |
| `home4@solar.ly` | منزل الفجر — درنة | — |
| `home5@solar.ly` | منزل السلام — الكفرة | — |

Seed script is safe to re-run — existing Auth users are skipped (merged), Firestore docs are merged.

---

## 13. Routes

```
/login          Public
/register       Public (self sign-up)
/dashboard      Private — main home screen
/sell           Private — post sell offer
/buy            Private — browse + buy offers
/history        Private — transaction history
/profile        Private — edit profile, wallet top-up, solar simulation
/admin          Private + isAdmin — all homes overview
*               → NotFound (404)
/ → redirects to /dashboard
```

---

## 14. Layout (Responsive)

- **Desktop (≥ lg = 1024px):** Right-side sidebar (RTL), fixed width 256px, with home name avatar, kWh + LYD balance widgets, nav links. Admin link appears in purple if `homeData.isAdmin`.
- **Mobile (< lg):** Compact top header (avatar + home name + balance badges) + fixed bottom 5-tab navigation. Main content has `pb-20` to clear the bottom nav.
- Avatar: colored circle with first character of home name. Color is deterministic from name via hash → 8-color palette.

---

## 15. Profile Page Features

1. **Avatar + name header** — large colored initial circle, email, admin badge if applicable
2. **Account info card** — name, email (read-only), mobile, meterRef, join date, active status — with inline edit mode
3. **Stats grid** — 6 stat boxes (kWh balance, total produced, consumed, sold, purchased, wallet LYD)
4. **Technical specs** — P_peak, η, I_STC, location
5. **Wallet top-up card** — quick pick 50/100/200/500 LYD + custom amount input → calls `topUpWallet()`
6. **Admin panel link card** — only shown if `homeData.isAdmin` (mobile shortcut to /admin)
7. **Solar simulation card** — runs daily PV model, writes dailyStats, increments balance
8. **Sign out button** — Firebase `signOut()`

---

## 16. Admin Page (/admin)

- Protected: redirects to /dashboard if `!homeData.isAdmin`
- Fetches all `/homes` docs with `getDocs()` (sorted client-side by `joinedAt`)
- Summary cards: total homes, active homes, total energy produced, total wallets LYD
- Trading summary: total sold / purchased / consumed across all homes
- Desktop: full table (avatar, name, email, kWh balance, wallet, sold, purchased, status)
- Mobile: card list with same data
- Admin user row has a purple shield icon

---

## 17. Registration Flow

`RegisterPage.jsx` → `registerHome()` in `homeService.js`:

1. Validate: name required, email format, Libyan mobile (`/^09\d{8}$/`), password ≥ 6 chars, passwords match
2. `createUserWithEmailAndPassword()` → Firebase Auth signs them in immediately
3. `setDoc(homes/{uid})` with `walletBalance: 100` LYD starting credit, `balance: 0` kWh, auto-generated `meterRef`
4. `AuthContext` picks up via `onSnapshot` → redirected to `/dashboard`

---

## 18. Important Constraints (Must Always Follow)

1. **NEVER commit `.env` to GitHub** — Firebase API keys must stay private
2. **NEVER commit `scripts/serviceAccountKey.json`** — Firebase Admin private key
3. **Western Arabic numerals only** (1, 2, 3) — never Eastern Arabic (١, ٢, ٣)
4. **All UI text in Arabic, RTL layout**
5. **Currency always displayed as `X.XX د.ل`** using `formatLYD()`
6. **Transactions are immutable** — never update or delete `/transactions` documents
7. **Always run commands from inside `solar-trading/`**, not the repo root
8. **Development branch:** `claude/bold-gates-DeDRF`

---

## 19. How to Run Locally

```bash
# 1. Enter the app folder (NOT the repo root)
cd ~/Desktop/p2penergy/solar-trading

# 2. Install dependencies (first time only)
npm install

# 3. Start dev server
npm start
# → opens http://localhost:3000

# 4. Stop the server
# Ctrl + C

# 5. Re-seed demo data (after pulling updates)
node scripts/seedFirestore.js

# 6. Production build
npm run build
```

---

## 20. Features Already Built (Complete)

- [x] Firebase Auth (login, logout, session persistence)
- [x] Self sign-up with Libyan mobile validation + auto meter code
- [x] Dashboard with real-time stats, energy area chart, recent transactions
- [x] Sell energy (post offer)
- [x] Buy energy (atomic 8-step trade, partial fills supported)
- [x] Transaction history (immutable ledger view)
- [x] Profile editing (name, mobile, meterRef inline)
- [x] Solar production simulation (PV formula, Ajdabiya seasonal model)
- [x] Wallet top-up (virtual LYD credit)
- [x] Admin dashboard (all homes, network stats)
- [x] Initials-based avatar (deterministic color per home name)
- [x] Mobile-responsive layout (bottom nav + top header)
- [x] Firestore security rules
- [x] Firebase Hosting + Vercel deployment configs
- [x] Demo seed script (5 homes, 1 admin)

---

## 21. Possible Future Features (Not Yet Built)

- Profile photo upload (Firebase Storage)
- Admin ability to top-up any home's wallet
- Admin toggle to activate/deactivate a home
- Push notifications when a buy offer is filled
- Password reset flow (`sendPasswordResetEmail`)
- Export transaction history as PDF/CSV
- Multi-language support (Arabic + English toggle)
- Real-time offer notifications (Firestore listener on offers)
- Energy price chart / market history
