# WLSBet Frontend — React + TypeScript + Vite

A fully responsive sports betting and casino platform built with React 18, TypeScript, and Tailwind CSS. Includes real-time odds via WebSocket, full betting exchange, live sports data, casino, wallet with KYC gate, complete affiliate dashboard, gamification, and CMS content.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | React + TypeScript | 18.2 / 5.3 |
| Build Tool | Vite | 7.3 |
| Styling | Tailwind CSS + design tokens | 3.4 |
| State | Zustand | 5.0 |
| Routing | React Router v6 | 6.20 |
| HTTP Client | Axios | 1.13 |
| Real-time | socket.io-client | 4.8 |
| Server State | @tanstack/react-query | 5.90 |
| Icons | react-icons + lucide-react + @mdi/font | 5.0 / 0.563 / 7.4 |
| Sliders | Swiper | 12.1 |
| Utilities | clsx + tailwind-merge | 2.1 / 3.4 |

---

## Getting Started

### Prerequisites

- Node.js 18+ (or Bun)
- Access to the backend API

### Install & Run

```bash
npm install
npm run dev
```

The app runs at [http://localhost:5173](http://localhost:5173).

### Build

```bash
npm run build
```

Output goes to `dist/`.

### Preview Production Build

```bash
npm run preview
```

### Environment Variables

```env
VITE_API_URL=https://api.example.com/
VITE_SOCKET_URL=https://api.example.com/
VITE_BETTING_API_URL=https://api.example.com/demoapi/betting/
VITE_BETTING_SOCKET_URL=https://api.example.com   # no trailing slash
```

> `VITE_BETTING_SOCKET_URL` must not have a trailing slash — socket.io-client uses it to construct namespace URLs like `${WS_URL}/markets`.

---

## Project Structure

```
src/
├── api/
│   ├── client.ts            # Axios instance + all API modules
│   ├── bettingClient.ts     # Separate Axios instance for betting API
│   └── endpoints.ts         # All API endpoint constants + BETTING_SPORT_IDS
├── components/              # Feature-based UI components (27 folders, 120+ files)
│   ├── Affiliate/           # Complete affiliate program (9 components)
│   ├── Auth/                # Login, register, forgot password (8 components)
│   ├── BetRecords/          # Bet history, unsettled bets, P&L, casino history
│   ├── Betting/             # Full betting exchange layout & pages (10 components)
│   ├── BonusManager/        # Bonus management
│   ├── Casino/              # Casino iframe wrapper
│   ├── Common/              # Shared UI primitives (16 components)
│   ├── Content/             # CMS, blogs, news, contact (6 components)
│   ├── Cricket/             # Cricket page — real API, league grouping, back/lay odds
│   ├── Footer/              # Site footer
│   ├── Gamification/        # Spin & Win, Daily Rewards, VIP (3 components)
│   ├── Header/              # Header, profile dropdown, mobile submenu
│   ├── InPlay/              # In-play betting section
│   ├── LiveCasino/          # Live casino, Aura, Dream (6 components)
│   ├── MainContent/         # Landing page — sport cards, live games, casino
│   ├── MatchDetails/        # Match detail page with markets (5 components)
│   ├── Notifications/       # Notification page
│   ├── Profile/             # Account pages (7 components)
│   ├── Sidebar/             # Left & right sidebars
│   ├── Slots/               # Slots listing & card
│   ├── Sport/               # SportEventPage — generic reusable sport page
│   ├── Sports/              # Sports category listing
│   ├── Wallet/              # Deposit/withdraw with KYC gate
│   └── shared/              # Shared reusable components (3 components)
│       ├── EventMatchCard.tsx        # Top Games horizontal scroll card
│       ├── LeagueCompetitionCard.tsx # Top Competitions image card
│       └── EventListRow.tsx          # All Games/Events league-grouped list row
├── context/
│   ├── BettingDataContext.tsx  # App-level betting data provider (sports + live events)
│   └── ThemeContext.tsx        # Theme fetch, apply, and caching
├── data/
│   └── mockData.ts          # Development constants
├── hooks/
│   ├── useAuth.ts           # Auth logic hook
│   ├── useBalance.ts        # Balance management
│   ├── useMatchData.ts      # Match data fetching
│   └── usePolling.ts        # Interval polling utility
├── routes/
│   ├── AppRoutes.tsx        # All route definitions (40+ routes)
│   ├── PrivateRoute.tsx     # Auth guard
│   └── paths.ts             # Route path constants
├── services/
│   ├── bettingSocketService.ts  # WebSocket: /markets, /events, /user namespaces
│   ├── kycService.ts            # KYC helper functions
│   └── socketService.ts         # General WebSocket service
├── store/
│   ├── authStore.ts         # User session & token
│   ├── betStore.ts          # Bet slip state
│   ├── bettingStore.ts      # Betting exchange state (events, odds, markets)
│   ├── notificationStore.ts # Notification count & list
│   ├── sportsStore.ts       # Sports & event data
│   ├── themeStore.ts        # Active brand theme
│   ├── toastStore.ts        # Toast notification queue
│   └── uiStore.ts           # Modal & sidebar visibility
├── styles/
│   └── index.css            # CSS variables, Tailwind directives, component classes
├── types/
│   ├── affiliate.ts         # Affiliate program types
│   ├── auth.ts              # Auth types
│   ├── domain.ts            # Business domain types
│   ├── payment.ts           # Payment types
│   └── theme.ts             # BrandTheme interface
├── utils/
│   ├── applyTheme.ts        # CSS variable injection, DEFAULT_THEME
│   ├── formatters.ts        # Currency, date formatters
│   └── network.ts           # Network utilities
├── App.tsx                  # Root layout + ThemeProvider
└── index.tsx                # Entry point with early theme paint IIFE
```

---

## Implemented Features

### Authentication
- [x] Login modal with username/password
- [x] Register modal with full form validation
- [x] Referral code capture from `?ref=` URL param — auto-populated, uppercased, shows active indicator banner
- [x] Forgot password modal
- [x] Session expired modal with auto-redirect
- [x] Protected routes via `PrivateRoute` guard
- [x] Auth state in Zustand (`authStore`)

### Theme System
- [x] Dynamic brand theme loaded from `GET /app/theme`
- [x] CSS variable system — all colors, gradients, shadows are token-driven (no hardcoded hex values)
- [x] Dark / light mode toggle via `html.dark` class on `<html>`
- [x] Early-paint IIFE in `index.tsx` applies cached theme before React hydrates (prevents flash)
- [x] Theme persisted to `localStorage`, restored on next visit
- [x] Design-system utility classes: `.label-text`, `.amount-btn`, `.sidebar-menu-item`, `.tab-item`, `.clickable-row`

### Navigation & Layout
- [x] Sticky header with logo, balance display, auth buttons, theme toggle
- [x] Left sidebar with API-driven sport/casino navigation categories and live event counts
- [x] Right sidebar (bet slip + live score)
- [x] Mobile bottom navigation bar
- [x] Mobile account drawer menu
- [x] Account layout with sidebar for all account pages (desktop) and mobile drawer
- [x] Full responsive design (mobile, tablet, desktop, large desktop)
- [x] Code splitting — all non-critical routes use `React.lazy()` + `Suspense`

### Home Page (`/`)
- [x] Hero banner carousel (fetched from API)
- [x] Game categories strip
- [x] **Popular Sports cards** — dynamic from `bettingStore.sports`, sport-colored gradient cards with per-sport live event count, click → sport page
- [x] Upcoming events section
- [x] Sport events table — tabbed by sport, back/lay odds columns, click → `/betting/event/:id`
- [x] **Top Live Games** — horizontal scroll of `EventMatchCard`, sourced from `bettingStore.liveEvents` (zero extra API calls), only shown when live events exist
- [x] Casino game sections: Trending, Top, Recommended, New, All (from casino API)
- [x] Promo banner sections

### Sports Betting — Sport Pages

All sport pages share the same `SportEventPage` component and live data from `GET /demoapi/betting/sports/:id/events`.

| Route | Sport ID | Features |
|---|---|---|
| `/cricket` | 4 | `CricketPage` — format detection (T20/ODI/Test/T10), filter tabs, hero banner |
| `/football` | 1 | `SportEventPage` — league grouping, back/lay odds |
| `/soccer` | 1 | `SportEventPage` |
| `/tennis` | 2 | `SportEventPage` |
| `/hockey` | 7522 | `SportEventPage` |
| `/election` | 2378961 | `SportEventPage` |
| `/horse-racing` | 7 | `SportEventPage` |

**Each sport page includes:**
- [x] Hero banner carousel (from API)
- [x] Promo cards row (sport-specific CTAs)
- [x] **Top Events** — horizontal scroll of `EventMatchCard` with back/lay odds, live events prioritised
- [x] Welcome bonus promo banner slot
- [x] **Top Competitions** — `LeagueCompetitionCard` grid with image background, color tint, LIVE badge, event count — derived from API leagues
- [x] **All Events** — league-grouped list using `EventListRow`, filter tabs (Live / All / top leagues), search bar, back/lay odds columns
- [x] Polling every 15 seconds
- [x] Click any event → `/betting/event/:eventId`

### Shared Components (`src/components/shared/`)

Three reusable components used across Cricket, all sport pages, and the home page:

| Component | Used in | Description |
|---|---|---|
| `EventMatchCard` | CricketPage, SportEventPage, MainContent | Portrait event card — league, LIVE/format badge, teams, back/lay odds bar |
| `LeagueCompetitionCard` | CricketPage, SportEventPage | Image card with tinted overlay — league name, event count, LIVE badge |
| `EventListRow` | CricketPage, SportEventPage | Compact list row — LIVE/time, team names, BM badge, back/lay per runner |

**`EventMatchCard` props:**
```typescript
{ event: MatchEvent; sportIcon?: string; formatLabel?: string }
```

**`LeagueCompetitionCard` props:**
```typescript
{ league: string; count: number; isLive?: boolean; index?: number; bgImage?: string }
```

**`EventListRow` props:**
```typescript
{ event: EventListRowEvent; isAlternate?: boolean }
```

### Betting Exchange (`/betting`)
- [x] Nested layout with shared sport tabs and bet slip sidebar
- [x] Home page — live events list with auto-refresh
- [x] Sport page (`/betting/sport/:sportId`) — events filtered by sport
- [x] Event page (`/betting/event/:eventId`) — full market grid with back/lay odds
- [x] My bets page (`/betting/my-bets`) — active and settled bets with status badges
- [x] `OddsButton` — interactive back/lay cell with flash animation on odds change
- [x] `BetSlipSidebar` — stake entry, quick-stake buttons, P&L preview, accept-odds-changes, bet submission
  - Session/fancy markets use percentage-based P&L: BACK return = `(rate × stake) / 100 + stake`, LAY liability = `(rate × stake) / 100`
  - Regular markets use exchange formula: BACK return = `(odds − 1) × stake + stake`, LAY liability = `(odds − 1) × stake`
  - Session bet payloads include `selection: 'YES'|'NO'`, `rate`, and `line` fields required by the API
  - Bet items display `Line: {value} @ {rate}` for session/fancy markets
- [x] `MarketCard` — market odds grid with suspension overlay; routes to renderer by market type
  - Session/fancy rows (`SessionMarketRow`): `b/l` fields = line values (displayed), `br/lr` fields = rates (stored as bet odds)
  - Betfair rows: 3 back + 3 lay columns (`b3/b2/b1`, `l1/l2/l3`)
  - Bookmaker rows: single back + lay per runner
- [x] `MatchedBetsPanel` — matched bets display on event page
- [x] Real-time odds via WebSocket (`bettingSocketService`) — session bets receive both rate and line updates
- [x] `bettingStore` Zustand store for events, markets, odds, bet slip, balance
  - `BetItem.line` — stores the line value for session/fancy/khado/meter bets
  - `updateOdds(marketId, runnerId, betType, newOdds, newLine?)` — marks `oddsChanged` when either rate or line changes

### Real-time WebSocket (`bettingSocketService`)

Three socket.io namespaces:

| Namespace | Purpose |
|---|---|
| `/markets` | Subscribe to market odds updates, flash on change |
| `/events` | Scorecard HTML, new markets notifications |
| `/user` | Balance updates, bet-settled events |

All sockets reconnect automatically.

**Session market odds format** (received via `odds:updates`):

| Field | Meaning |
|---|---|
| `b` | YES line value |
| `l` | NO line value |
| `br` | YES rate (stored as `bet.odds`) |
| `lr` | NO rate (stored as `bet.odds`) |

Regular (Betfair) markets use runner-array format: `{ r: [{ rid, b1, l1, br1, lr1, ... }] }`.

### Market Type Classification (`MarketCard`)

| Category | Types | Layout |
|---|---|---|
| Betfair | `match-odd`, `tied-match`, `completed-match` | 3 back + 3 lay columns per runner |
| Bookmaker | `bookmaker`, `bookmaker2` | 1 back + 1 lay per runner |
| Session / Fancy | `session`, `fancy`, `fancy1`, `ball-by-ball`, `khado`, `meter`, `player-race`, `odd-even`, `other-market` | Flat row: NO (LAY) + YES (BACK) |
| Back-only | `cricket-casino`, `jackpot`, `virtual-match` | BACK column + BOOK button |
| Line market | `line-market` | 3 back + 3 lay, market name as label |
| Default | all others | 1 back + 1 lay per runner |

**Session P&L market types** (use percentage-based formulas in bet slip):
`session`, `fancy`, `fancy1`, `ball-by-ball`, `meter`, `bookmaker`, `bookmaker2`, `khado`

---

### Casino & Slots
- [x] Slots/Casino listing page (`/slots`, `/casino`) with game grid and categories
- [x] Live Casino page (`/live-casino`) with provider sections
- [x] `CasinoGameCard` with hover overlay and launch action
- [x] `LiveCasinoCard` and `TournamentCard` display components
- [x] Dream Casino embedded game (`/dream-casino-game`)
- [x] Aura Casino embedded game (`/aura-casino-game`)
- [x] `CasinoIframe` component for embedded providers
- [x] Casino bet history page (`/casino-bet-history`)

### Wallet & Payments
- [x] Deposit/Withdraw page (`/wallet`, `/deposit`, `/withdraw`)
- [x] **KYC gate** — Deposit and Withdraw tabs blocked until KYC is verified:
  - `loading` → spinner
  - `not_submitted` → prompt with link to `/kyc`
  - `pending` → pending review message with timeline indicator
  - `rejected` → rejection reason display + re-submit link
  - `verified` → full deposit/withdraw UI rendered
- [x] Transaction history tab is always accessible (not gated by KYC)
- [x] Payment accounts management (`/payment-accounts`)
- [x] All KYC gate states use only design system tokens (no hardcoded colors)

### KYC Verification
- [x] KYC page (`/kyc`) with document submission
- [x] KYC status section with verification state display
- [x] KYC status badge on profile page
- [x] `userApi.getKyc()` — `GET /app/user/get_kyc`

### Bet Records
- [x] Sports bet history (`/bet-history`) with pagination and date filter
- [x] Casino bet history (`/casino-bet-history`)
- [x] Unsettled bets (`/unsettled-bets`)
- [x] Profit & loss report (`/profit-loss`)

### Affiliate Program (Full Implementation)

All affiliate routes live under `/affiliate/*` and require authentication.

| Tab | Route | Features |
|---|---|---|
| Dashboard | `/affiliate/dashboard` | 4 stat cards: Total Referrals, Active Players, Total Earnings, Pending Commission |
| Referrals | `/affiliate/referrals` | Paginated table, debounced search (500ms), status badge |
| Players | `/affiliate/players` | Paginated table, click-through to player detail |
| Player Detail | `/affiliate/player/:id` | Individual player stats (deposits, withdrawals, commission) |
| Commissions | `/affiliate/commissions` | Status pills (All/Pending/Settled/Cancelled), type pills (All/Deposit/Loss/Profit), date range filter |
| Earnings | `/affiliate/earnings` | Breakdown by type with count, total, pending, settled per category |
| Settlements | `/affiliate/settlements` | Settled commission records |

**Additional features:**
- [x] Application flow — shows benefit list, submits via `POST /affiliate/apply`
- [x] Status page — pending / rejected / blocked / deleted states with contextual icons and messages
- [x] Referral code card with copy-to-clipboard button
- [x] Referral link with WhatsApp and Telegram share buttons
- [x] URL-based tab routing — each tab has its own shareable/bookmarkable URL
- [x] Affiliate type badge (e.g. "Gold", "Premium") in header

**API integrations:**

| Function | Endpoint |
|---|---|
| `getApplicationStatus()` | `GET /affiliate/application-status` |
| `getStats()` | `GET /affiliate/stats` |
| `getReferrals({ page, perpage, search? })` | `POST /affiliate/referrals` |
| `getPlayers({ page, perpage })` | `POST /affiliate/players` |
| `getCommissionHistory({ page, perpage, status?, commission_type?, start_date?, end_date? })` | `POST /affiliate/commission-history` |
| `getEarningsBreakdown({ start_date?, end_date? })` | `POST /affiliate/earnings-breakdown` |
| `getPlayerDetail(playerId)` | `GET /affiliate/player/:id` |
| `apply()` | `POST /affiliate/apply` |

### User Profile & Account
- [x] Profile page (`/profile`) with user info, avatar, KYC badge
- [x] Change password form (`/change-password`)
- [x] Bet stake settings (`/bet-stake-setting`) — configure default and quick-stake amounts
- [x] Account sidebar (desktop) and mobile account drawer with all navigation links

### Gamification
- [x] Spin & Win page (`/spin-win`)
- [x] Daily Rewards page (`/daily-rewards`)
- [x] VIP tier page (`/my-vip`) with tier benefits
- [x] Bonus manager page (`/bonus-manager`)

### Notifications
- [x] Notification page (`/notification`) with paginated list
- [x] `notificationStore` for unread count badge on header icon

### Content / CMS
- [x] Blog listing page (`/blogs`) with card grid
- [x] Blog detail page (`/blog/:slug`)
- [x] News listing page (`/news`)
- [x] News detail page (`/news/:slug`)
- [x] Generic CMS page renderer (`/page/:link`, `/terms-conditions`, `/about-us`)
- [x] Contact Us page (`/contact-us`) with form

---

## API Architecture

### Interceptor Pattern

All requests use a shared Axios interceptor that:
1. Attaches `Authorization: Bearer <token>` header
2. Unwraps `response.data` — callers receive the HTTP body directly
3. Handles `401` → clears auth state, triggers session expired modal

### API Modules in `client.ts`

| Module | Description |
|---|---|
| `contentApi` | Theme, banners, CMS pages, blogs, news, VIP data |
| `authApi` | Login, register, forgot password, refresh token |
| `userApi` | Profile, balance, KYC, password change, notifications |
| `paymentApi` | Deposit, withdraw, transaction history, payment accounts |
| `affiliateApi` | Full affiliate program (8 functions) |
| `casinoApi` | Casino game listing and launch URLs |
| `bettingApi` | Sports events and bet placement (via `bettingClient.ts`) |

### Betting API Sport IDs

Defined in `src/api/endpoints.ts` as `BETTING_SPORT_IDS`:

| Sport | ID | Endpoint |
|---|---|---|
| Cricket | `4` | `GET /demoapi/betting/sports/4/events` |
| Football / Soccer | `1` | `GET /demoapi/betting/sports/1/events` |
| Tennis | `2` | `GET /demoapi/betting/sports/2/events` |
| Hockey | `7522` | `GET /demoapi/betting/sports/7522/events` |
| Horse Racing | `7` | `GET /demoapi/betting/sports/7/events` |
| Election | `2378961` | `GET /demoapi/betting/sports/2378961/events` |

### BettingDataContext

Mounts once at app level (`src/context/BettingDataContext.tsx`). Fetches:
- `GET /sports` once on mount → writes to `bettingStore.sports`
- `GET /events/live` immediately + every 30s → writes to `bettingStore.liveEvents`

All consumers (LeftSidebar, MainContent, sport pages) read from the store — no independent fetch calls needed.

---

## State Management

| Store | Purpose |
|---|---|
| `authStore` | User session, JWT token, profile data |
| `themeStore` | Active brand theme (CSS variable values) |
| `betStore` | Open bet slip items |
| `bettingStore` | Betting exchange: events, markets, odds, bet slip, balance, sports list, live events |
| `sportsStore` | Sports categories and event data cache |
| `notificationStore` | Notification count and list |
| `toastStore` | Toast notification queue (success/error/warning/info) |
| `uiStore` | Modal visibility, sidebar open/close state |

### Toast System

Call from anywhere in the app:

```ts
import { useToastStore } from './store/toastStore';

const toast = useToastStore();
toast.success('Bet placed!');
toast.error('Insufficient balance');
toast.warning('Odds have changed');
```

Auto-dismiss: success/info 3.5s, warning 4s, error 5s.

---

## Route Summary

### Public Routes

| Path | Component |
|---|---|
| `/` | MainContent (landing page) |
| `/in-play` | InPlay |
| `/betting` | BettingLayout → BettingHomePage |
| `/betting/sport/:sportId` | BettingLayout → BettingSportPage |
| `/betting/event/:eventId` | BettingLayout → BettingEventPage |
| `/betting/my-bets` | BettingLayout → BettingMyBetsPage |
| `/match-details/:event_id` | MatchDetails |
| `/cricket` | CricketPage |
| `/sports` | SportsPage |
| `/football` | SportEventPage (sportId=1) |
| `/soccer` | SportEventPage (sportId=1) |
| `/tennis` | SportEventPage (sportId=2) |
| `/hockey` | SportEventPage (sportId=7522) |
| `/election` | SportEventPage (sportId=2378961) |
| `/horse-racing` | SportEventPage (sportId=7) |
| `/casino`, `/slots` | SlotsPage |
| `/live-casino` | LiveCasinoPage |
| `/dream-casino-game` | DreamCasinoGame |
| `/aura-casino-game` | AuraCasinoGame |
| `/blogs`, `/blog/:slug` | BlogsPage / BlogDetailPage |
| `/news`, `/news/:slug` | NewsPage / NewsDetailPage |
| `/page/:link`, `/terms-conditions`, `/about-us` | CMSPage |
| `*` | NotFound |

### Protected Routes (require login)

| Path | Component |
|---|---|
| `/profile` | Profile |
| `/kyc` | KycPage |
| `/change-password` | ChangePasswordForm |
| `/wallet`, `/deposit`, `/withdraw` | DepositWithdrawPage (KYC gated) |
| `/bet-history` | BetHistoryPage |
| `/casino-bet-history` | CasinoBetHistoryPage |
| `/unsettled-bets` | UnsettledBetsPage |
| `/profit-loss` | ProfitLossPage |
| `/bet-stake-setting` | BetStakeSettingsPage |
| `/payment-accounts` | PaymentAccountsPage |
| `/notification` | NotificationPage |
| `/spin-win` | SpinWinPage |
| `/daily-rewards` | DailyRewardsPage |
| `/my-vip` | VipPage |
| `/bonus-manager` | BonusManagerPage |
| `/contact-us` | ContactUsPage |
| `/affiliate/dashboard` | AffiliateDashboard |
| `/affiliate/referrals` | AffiliateDashboard (Referrals tab) |
| `/affiliate/players` | AffiliateDashboard (Players tab) |
| `/affiliate/player/:id` | AffiliatePlayerDetail |
| `/affiliate/commissions` | AffiliateDashboard (Commissions tab) |
| `/affiliate/earnings` | AffiliateDashboard (Earnings tab) |
| `/affiliate/settlements` | AffiliateDashboard (Settlements tab) |

---

## Design System

All colors, spacing, and effects use CSS custom properties defined in `src/styles/index.css` and mapped to Tailwind utilities via `tailwind.config.js`.

### Key Tokens

| Token | Usage |
|---|---|
| `bg-brand-primary` | Primary brand color — buttons, active states, page headers |
| `text-brand-primary` | Brand color text — active icons, accent links |
| `bg-bg-card` | Card backgrounds |
| `bg-bg-primary` | Page/layout background |
| `bg-bg-secondary` | Input fields, secondary backgrounds |
| `bg-bg-light-blue` | Table row hover, tab hover background |
| `border-stroke-light` | Dividers and card borders |
| `bg-odds-back` | Back bet button — light blue in light mode, navy in dark mode |
| `bg-odds-lay` | Lay bet button — pink in light mode, red in dark mode |
| `text-neutral-gray-900` | Active menu item text |
| `text-neutral-gray-700` | Body text, normal menu items |
| `text-neutral-gray-500` | Secondary / muted text, section labels |
| `text-neutral-gray-400` | Section label icons, placeholder text |
| `text-accent-green` | Success, profit, earnings, verified, LIVE competition badge |
| `text-accent-red` | Error, loss, rejected, LIVE event badge |
| `text-accent-yellow` | Warning, pending states, section trophy icons |
| `brand-text` | Adaptive text (switches light/dark mode) |
| `font-display` | Headings and page titles |
| `font-mono` | Numbers, currency amounts, codes |

### Color Usage Rules

- `text-brand-primary` — **never** used as body text on light backgrounds; only for active icons, active left-border, button labels
- Text on `bg-brand-primary` backgrounds — always `text-white`
- Hover effects — `hover:bg-bg-light-blue` for background only; text color does NOT change on hover
- Back/Lay odds — always use `bg-odds-back` / `bg-odds-lay` tokens (never hardcoded hex)

---

## Responsive Breakpoints

| Breakpoint | Width |
|---|---|
| Mobile | < 768px |
| Tablet | 768px – 1024px |
| Desktop | > 1024px |
| Large Desktop | > 1280px |

---

## Browser Support

Chrome, Firefox, Safari, Edge (latest two versions), mobile browsers (iOS Safari, Chrome Android).

---

## License

Proprietary — all rights reserved.
