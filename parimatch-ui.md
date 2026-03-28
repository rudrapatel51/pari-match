# WLSBet → Parimatch UI Transformation: Master Prompt Guide

> **Context**: You have an existing betting platform at `wlsbet.wls365.com` (WL Bet / WLS365). You want to ONLY change the frontend UI/theme to look like Parimatch (pm-betting.com) — keeping all backend APIs, functionality, sports data, casino integrations, and business logic exactly the same.

---

## TABLE OF CONTENTS

1. [Understanding Both Platforms](#1-understanding-both-platforms)
2. [Master Prompt (Copy-Paste Ready)](#2-master-prompt-copy-paste-ready)
3. [Step-by-Step Prompts by Component](#3-step-by-step-prompts-by-component)
4. [CSS Theme Override System](#4-css-theme-override-system)
5. [Component-Level Transformation Map](#5-component-level-transformation-map)
6. [Implementation Strategy](#6-implementation-strategy)

---

## 1. Understanding Both Platforms

### YOUR PLATFORM: WLSBet (wlsbet.wls365.com)

- **Type**: White-label betting platform (WLS365 provider)
- **Market**: India-focused (INR, cricket, IPL, UPI payments)
- **Sections**: Sports Betting (live + prematch), Casino, Live Casino, Virtual Sports, Crash Games
- **Providers**: Play'n GO, Evolution, Pragmatic Play, MicroGaming
- **Payments**: Bitcoin, USDT Tether, UPI
- **Features**: Live streaming, bet slip, multi-language, mobile responsive
- **License**: Curaçao

### TARGET DESIGN: Parimatch (pm-betting.com)

- **Theme**: Dark navy (#1A1A2E) background + bright yellow (#FFD700) accents
- **Design philosophy**: Clean, utilitarian, speed-over-style, mobile-first
- **Layout**: 3-column (left nav tree + center content + right bet slip)
- **Typography**: Clean sans-serif, bold for headers, monospace for odds
- **Signature**: Black/yellow brand identity, minimal decoration, data-dense odds grid

---

## 2. Master Prompt (Copy-Paste Ready)

Use this single prompt to get a comprehensive UI reskin plan:

```
=== MASTER PROMPT: WLSBET TO PARIMATCH UI RESKIN ===

I have an existing white-label betting platform (WLSBet on WLS365 infrastructure).
The backend, APIs, sports data feeds, casino game integrations, payment gateways,
and all business logic must remain 100% unchanged.

I ONLY want to transform the frontend UI/theme to match the Parimatch (pm-betting.com)
design language. Here is the exact specification:

TARGET DESIGN SYSTEM:
━━━━━━━━━━━━━━━━━━━
Colors:
- Background primary: #1A1A2E (deep navy)
- Background secondary: #16213E (lighter navy)
- Background cards/panels: #1E2A4A
- Sidebar background: #0F1629
- Header background: #0D1117
- Primary accent: #FFD700 (bright yellow - CTAs, highlights, active states)
- Primary accent hover: #E5C100
- Text primary: #FFFFFF
- Text secondary: #A0AEC0 (muted grey)
- Text accent: #FFD700
- Success/win: #48BB78 (green)
- Danger/loss: #F56565 (red)
- Live indicator: #FF4757 (pulsing red)
- Odds up: #48BB78
- Odds down: #F56565
- Borders: #2D3748

Typography:
- Headers/Display: Montserrat Bold, 700 weight
- Body text: Roboto, 400 weight
- Odds/Numbers: Roboto Mono (monospace)
- Sizes: 12px small / 14px odds / 16px body / 18px section / 24px page / 32px promo

Layout (3-column):
- Header: Fixed top bar, dark (#0D1117), logo left, nav center, auth right
- Left sidebar: 220px, sports navigation tree, collapsible categories
- Main content: Flexible center, odds grid, match listings, casino grid
- Right sidebar: 300px, persistent bet slip
- Footer: Dark, license logos, payment icons, legal links
- Mobile: Bottom navigation tab bar, collapsible bet slip from bottom

Component Styles:
- Buttons: Yellow (#FFD700) fill with dark text for primary CTAs, ghost/outline for secondary
- Cards: #1E2A4A background, 8px border-radius, subtle #2D3748 border
- Odds buttons: Compact rectangular, #1E2A4A background, white text, yellow on selected
- Inputs: Dark background (#16213E), light border (#2D3748), white text
- Modals: Dark overlay, #1E2A4A panel, yellow accent CTA
- Navigation: Text links, yellow (#FFD700) for active/hover state
- Badges: Small yellow pills for "LIVE", "NEW", "HOT"
- Shadows: Minimal, dark-on-dark (no white/light shadows)
- Animations: Subtle odds flash (green up / red down), smooth slide transitions

PAGES TO RESKIN (keeping same functionality):
1. Homepage - hero banners, quick access grid, featured matches
2. Sports page - left nav tree, central odds grid, right bet slip
3. Live betting page - live scores, real-time odds, match tracker
4. Casino page - game thumbnail grid, provider filters, categories
5. Live casino page - dealer game cards, table selection
6. Virtual sports page - virtual event viewer
7. Promotions page - promo banner cards, T&C sections
8. Registration page - form with dark theme
9. Login page - simple auth form
10. Profile/Account - tabs for deposits, withdrawals, history, KYC
11. Bet slip component - persistent right sidebar
12. Header/Navigation - global nav bar
13. Footer - license, payment, legal
14. Mobile responsive views - all above pages

DELIVERABLES NEEDED:
- Complete CSS custom properties (variables) file
- Component-by-component style override guide
- Any HTML structure changes needed (without touching business logic)
- Responsive breakpoints and mobile layout adaptation
- Icon/asset replacement list
- Font loading configuration

CONSTRAINTS:
- Do NOT change any API calls, endpoints, or data structures
- Do NOT modify any business logic, betting calculations, or game integrations
- Do NOT change URL routing structure or page hierarchy
- ONLY modify: CSS, HTML templates/markup, assets, fonts, icons
- Keep all existing functionality working as-is
```

---

## 3. Step-by-Step Prompts by Component

Use these individual prompts one at a time for each component:

---

### PROMPT 1: Global Theme & CSS Variables

```
Create a complete CSS custom properties (CSS variables) theme file that transforms
my existing betting platform from its current design to a Parimatch-style dark navy
+ yellow accent theme.

Include variables for:
- All color tokens (backgrounds, text, borders, states, accents)
- Typography (font families, weights, sizes, line heights)
- Spacing scale (4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px)
- Border radius tokens
- Shadow tokens (dark-on-dark, no light shadows)
- Z-index scale
- Transition/animation durations
- Breakpoints

Color palette:
- Backgrounds: #0D1117, #0F1629, #1A1A2E, #16213E, #1E2A4A
- Accent: #FFD700 (yellow), hover: #E5C100
- Text: #FFFFFF, #A0AEC0, #FFD700
- Status: #48BB78 (success), #F56565 (danger), #FF4757 (live)
- Borders: #2D3748

Fonts:
- Display: 'Montserrat', sans-serif (700)
- Body: 'Roboto', sans-serif (400, 500)
- Mono: 'Roboto Mono', monospace (500)

Output a single CSS file with :root variables and dark-theme defaults.
Also include Google Fonts import statements.
```

---

### PROMPT 2: Header & Navigation Bar

```
Redesign the header/navigation bar of my betting platform to match Parimatch style.

Current: [describe your current header layout]

Target design:
- Fixed top bar, height: 56px, background: #0D1117
- Left: Logo (bright yellow or white on dark)
- Center: Main navigation tabs as text links
  - Sports | Live | Casino | Live Casino | Virtual | Promotions
  - Active tab: yellow (#FFD700) text + bottom 2px border
  - Inactive: white text, hover → yellow
- Right: Language dropdown, Login button (ghost/outline), Register button (yellow fill)
- If logged in: Balance display (₹ amount in yellow), Deposit button (yellow), user avatar dropdown
- Mobile: Hamburger menu left, logo center, user/login right

Keep all existing navigation links and routing. Only change the visual styling
and layout structure. Output the CSS overrides needed.
```

---

### PROMPT 3: Left Sidebar - Sports Navigation

```
Transform the left sidebar sports navigation to Parimatch style.

Target design:
- Width: 220px, background: #0F1629
- Collapsible on mobile (slide-in from left)
- Search bar at top: dark input (#16213E), magnifying glass icon
- Sports categories as expandable tree:
  - Sport icon (small, 16px) + Sport name + match count badge
  - Click to expand → shows leagues underneath
  - League items indented 16px, smaller text (13px)
  - Active sport/league: yellow text (#FFD700)
  - Inactive: #A0AEC0 (muted grey)
- "LIVE" section pinned at top with pulsing red dot
- Separator line (#2D3748) between Live and Pre-match sections
- Scrollable with custom dark scrollbar

Do NOT change the sports data structure or API. Only restyle the navigation
tree component. Output CSS overrides and any minimal HTML restructuring needed.
```

---

### PROMPT 4: Odds Grid / Match Listing (Main Content)

```
Redesign the main content area odds grid/match listing to Parimatch style.

Target design:
- Background: #1A1A2E
- Match rows grouped by league with collapsible league headers
- League header: #16213E background, bold white text, league icon, match count
- Match row:
  - Left: Team names (white, 14px), match time/date (grey #A0AEC0, 12px)
  - Center: Odds buttons in a grid (1X2, Over/Under, BTTS columns)
  - Odds button:
    - Default: #1E2A4A background, white text, 4px radius
    - Hover: lighter background (#2D3748)
    - Selected (in bet slip): yellow (#FFD700) background, dark text
    - Odds increasing: brief green (#48BB78) flash animation
    - Odds decreasing: brief red (#F56565) flash animation
  - Right: +N more markets link (yellow text)
- Match row hover: subtle lighter background
- Alternating row backgrounds: #1A1A2E / #1E2A4A (very subtle)
- Match separator: thin 1px #2D3748 line
- "LIVE" matches: red badge + elapsed time counter

Do NOT modify odds data, API calls, or betting logic.
Only restyle the grid component. Output CSS overrides.
```

---

### PROMPT 5: Bet Slip (Right Sidebar)

```
Redesign the bet slip (right sidebar) to Parimatch style.

Target design:
- Width: 300px, background: #0F1629, sticky position
- Tabs at top: Single | Accumulator | System (yellow active tab underline)
- Empty state: subtle message "Make your first selection" with icon
- Each selection card:
  - #1E2A4A background, 8px radius
  - Match name (white, 13px), market (grey, 12px)
  - Odds value (yellow, bold, 16px)
  - Remove X button (grey, hover red)
  - Stake input: dark background, white text, "₹" prefix
- Potential returns: yellow text, bold, bottom of each selection
- Total stake / Total potential return: bottom summary bar
- "Place Bet" button: full-width, #FFD700 background, dark bold text, 44px height
- One-click bet toggle: small switch with label
- On mobile: Bet slip is a bottom sheet that slides up, with a floating
  "Bet Slip (N)" yellow pill button to trigger it

Do NOT change bet placement logic, calculations, or API calls.
Only restyle the bet slip component. Output CSS overrides and any HTML adjustments.
```

---

### PROMPT 6: Casino & Game Grid

```
Redesign the casino section game grid to Parimatch style.

Target design:
- Background: #1A1A2E
- Top: Category tabs (All, Slots, Table Games, Jackpot, New, Popular)
  - Active: yellow text + underline, Inactive: white
- Below tabs: Provider filter chips (Play'n GO, Evolution, Pragmatic Play, etc.)
  - Chip style: #1E2A4A pill, white text, hover: yellow border, active: yellow fill
- Search bar: dark input, search icon, "Search games..."
- Game grid: 4-5 columns responsive
  - Game card:
    - Thumbnail image (rounded 8px top corners)
    - Dark overlay on hover with "PLAY" button (yellow)
    - Game name below (white, 13px)
    - Provider name (grey, 11px)
  - Card background: #1E2A4A
  - Card border: 1px #2D3748
- "Load More" button at bottom: ghost/outline style

Do NOT change casino game provider integrations, iFrame launching logic,
or game data. Only restyle the grid and cards. Output CSS overrides.
```

---

### PROMPT 7: Live Betting Page

```
Redesign the live betting page to Parimatch style.

Target design:
- Layout: Same 3-column but with enhanced center area
- Left: Live sports filter (red "LIVE" dots next to each sport with count)
- Center:
  - Match cards with live score prominently displayed
  - Score: Large yellow numbers, team flags/icons
  - Match clock: red text, animated blinking
  - Live stats bar: possession, shots, corners (horizontal bar chart)
  - Live odds grid: same as prematch but with faster animation on changes
  - Market suspension: greyed out odds buttons with "Suspended" text overlay
- Mini match tracker/visualization: simple animated pitch graphic (if available)
- Right: Bet slip (same as standard)
- "All Live Events" counter at top: shows total live matches
- Auto-refresh indicator: subtle spinning icon or progress bar

Do NOT change live data WebSocket connections, odds streaming logic, or
scoring updates. Only restyle the visual presentation. Output CSS overrides.
```

---

### PROMPT 8: Registration & Login Pages

```
Redesign the registration and login pages to Parimatch style.

Target design:
- Full-page dark background: #1A1A2E
- Centered card: max-width 440px, #1E2A4A background, 16px radius, 32px padding
- Logo at top of card (centered)
- Form title: "Create Account" / "Welcome Back" in Montserrat bold, white, 24px

Registration form fields:
- Phone number input: dark bg (#16213E), white text, country code prefix
- Date of birth: 3 dropdowns (day, month, year) or date picker
- Password: dark input with toggle visibility eye icon
- Confirm password: same style
- Promo code (optional): dark input
- Terms checkbox: yellow checkmark when checked
- "Register" button: full-width, #FFD700, dark bold text
- "Already have an account? Login" link: yellow text

Login form:
- Username/phone input
- Password input with eye toggle
- "Login" button: yellow fill
- "Forgot password?" link: yellow text
- "Register" link: yellow text

Input styling:
- Background: #16213E
- Border: 1px #2D3748, focus: 1px #FFD700
- Text: white
- Placeholder: #A0AEC0
- Error state: red border + red helper text
- Label: #A0AEC0, 12px, above input

Do NOT change form validation logic, API submission endpoints, or auth flow.
Only restyle. Output CSS overrides.
```

---

### PROMPT 9: Profile / Account Dashboard

```
Redesign the user account/profile page to Parimatch style.

Target design:
- Background: #1A1A2E
- Left side: Vertical tab navigation (#0F1629 background)
  - Tabs: Profile, Deposits, Withdrawals, Bet History, Bonuses, KYC, Settings
  - Active tab: yellow text + left yellow 3px border
  - Inactive: #A0AEC0 text
- Right side: Content panel (#1E2A4A background, 12px radius)
- Balance card at top: prominent display of wallet balance in yellow
  - Quick action buttons: Deposit (yellow), Withdraw (ghost/outline)
- Bet history: Table with dark alternating rows
  - Headers: #16213E background, grey text, uppercase, 11px
  - Rows: #1A1A2E / #1E2A4A alternating
  - Status badges: Won (green), Lost (red), Pending (yellow), Void (grey)
- Transaction history: Same table style
- KYC section: Document upload with drag-drop area (dark border, dashed)

Do NOT modify any account API calls, transaction logic, or data structures.
Only restyle. Output CSS overrides.
```

---

### PROMPT 10: Mobile Responsive Adaptation

```
Create responsive styles to adapt the Parimatch-themed desktop layout to mobile.

Breakpoints:
- Desktop: 1200px+  (3-column layout)
- Tablet: 768px–1199px (2-column, collapsible sidebar)
- Mobile: 320px–767px (single column, bottom nav)

Mobile-specific design:
1. BOTTOM NAVIGATION BAR:
   - Fixed bottom, #0D1117 background, 56px height
   - 5 tabs: Sports | Live | Casino | Bet Slip | Menu
   - Icons (24px) + labels (10px)
   - Active: yellow icon + text, Inactive: grey
   - Bet Slip tab shows count badge (yellow circle)

2. HEADER (mobile):
   - Height: 48px
   - Left: hamburger menu icon (opens left sidebar as overlay)
   - Center: logo
   - Right: balance (if logged in) or login button

3. LEFT SIDEBAR:
   - Full-screen overlay when opened (slide-in from left)
   - Close button (X) top-right
   - Semi-transparent dark backdrop

4. BET SLIP:
   - Bottom sheet / drawer that slides up from bottom
   - Trigger: floating yellow pill button "Bet Slip (N)" above bottom nav
   - Sheet: full-width, max 80vh height, rounded top corners
   - Drag handle at top for swipe-to-close

5. ODDS GRID:
   - Horizontal scroll for odds columns on small screens
   - Stack team names vertically for narrow screens
   - Larger touch targets: min 44px tap areas for odds buttons

6. CASINO GRID:
   - 2 columns on mobile, 3 on tablet
   - Larger game thumbnails relative to screen

Do NOT change any routing, navigation logic, or page functionality.
Only add responsive CSS overrides. Output a mobile.css override file.
```

---

### PROMPT 11: Promotions Page

```
Redesign the promotions page to Parimatch style.

Target design:
- Background: #1A1A2E
- Section title: "Promotions & Bonuses" — Montserrat bold, 28px, white
- Category filter tabs: All | Sports | Casino | Live Casino
  - Same tab styling: yellow active, white inactive
- Promo cards: Grid layout (2 columns desktop, 1 mobile)
  - Card: #1E2A4A background, 12px radius
  - Top: Promo banner image (full-width, rounded top)
  - Title: Bold white, 18px
  - Description: Grey (#A0AEC0), 14px, max 3 lines with ellipsis
  - CTA button: "Claim Now" — yellow fill, dark text
  - Tags: Small yellow pills — "NEW", "HOT", "EXPIRING"
- Promo detail page: same card style but expanded with full T&C section
  - T&C: collapsible accordion, grey text, dark background

Do NOT change promotion data, bonus logic, or claim API endpoints.
Only restyle. Output CSS overrides.
```

---

### PROMPT 12: Footer

```
Redesign the footer to Parimatch style.

Target design:
- Background: #0D1117
- Padding: 48px top, 24px bottom
- Top section: 4 columns
  - Column 1: Logo + brief description (grey text, 13px)
  - Column 2: Quick Links (Sports, Casino, Live Casino, Promotions)
  - Column 3: Support (Help Center, FAQ, Contact, Live Chat)
  - Column 4: Legal (T&C, Privacy Policy, Responsible Gambling, Cookie Policy)
  - Column headers: white, 14px, bold
  - Links: #A0AEC0, hover → yellow
- Middle section: Payment method icons (horizontally centered, grayscale, hover → color)
- Bottom section:
  - Left: License information + Curaçao badge
  - Center: 18+ responsible gambling badge
  - Right: "© 2026 WLSBet. All rights reserved."
  - Divider: 1px #2D3748 line above
  - Text: #A0AEC0, 12px

Do NOT change any links or legal content. Only restyle. Output CSS overrides.
```

---

## 4. CSS Theme Override System

### How to Apply Without Touching Backend

The safest approach is a **CSS override layer**. Create a single theme file that overrides all existing styles:

```
your-project/
├── css/
│   ├── original-theme.css     ← DON'T TOUCH
│   └── parimatch-theme.css    ← NEW: Load AFTER original
├── fonts/
│   ├── montserrat.woff2       ← NEW
│   └── roboto-mono.woff2      ← NEW
├── img/
│   ├── logo-parimatch.svg     ← NEW (your brand in PM style)
│   └── icons/                 ← NEW sport/nav icons
└── index.html                 ← Add one <link> tag for new theme
```

**Loading order** (critical):

```html
<!-- Original platform styles (DON'T REMOVE) -->
<link rel="stylesheet" href="/css/original-theme.css" />

<!-- Parimatch theme override (ADD THIS LAST) -->
<link rel="stylesheet" href="/css/parimatch-theme.css" />
```

Because it loads LAST, it will override all visual styles while leaving
functionality untouched.

---

## 5. Component-Level Transformation Map

| WLSBet Component  | →   | Parimatch Style          | What Changes                     | What Stays             |
| ----------------- | --- | ------------------------ | -------------------------------- | ---------------------- |
| Header bar        | →   | Dark fixed top nav       | Colors, font, layout             | Links, auth, routing   |
| Sports sidebar    | →   | Dark collapsible tree    | Colors, icons, spacing           | Sport categories, data |
| Odds grid         | →   | Dense dark odds table    | Colors, button style, animations | Odds data, bet logic   |
| Bet slip          | →   | Dark right panel         | Colors, layout, button style     | Bet calculation, API   |
| Casino grid       | →   | Dark game card grid      | Card style, filters              | Game launch, iFrames   |
| Live page         | →   | Real-time dark layout    | Score display, animations        | WebSocket, live data   |
| Registration form | →   | Dark centered card       | Input styling, colors            | Validation, submission |
| Login form        | →   | Dark centered card       | Input styling, colors            | Auth flow, tokens      |
| Profile/Account   | →   | Dark tabbed dashboard    | Tab style, table style           | Account APIs, data     |
| Promotions        | →   | Dark promo cards         | Card style, layout               | Promo data, claims     |
| Footer            | →   | Dark multi-column footer | Colors, layout                   | Links, legal content   |
| Mobile nav        | →   | Bottom tab bar           | New bottom nav component         | Routing logic          |

---

## 6. Implementation Strategy

### Phase 1: Foundation (Day 1-2)

1. Create `parimatch-theme.css` with all CSS variables
2. Add Google Fonts (Montserrat, Roboto, Roboto Mono)
3. Apply global body, background, text color overrides
4. Override header and footer

### Phase 2: Core Betting UI (Day 3-5)

5. Left sidebar sports navigation
6. Odds grid / match listing
7. Bet slip component
8. Live betting specific styles

### Phase 3: Secondary Pages (Day 6-7)

9. Casino game grid
10. Live casino section
11. Registration and login forms
12. Profile/Account pages
13. Promotions page

### Phase 4: Mobile & Polish (Day 8-10)

14. Mobile bottom navigation
15. Responsive breakpoints for all components
16. Bet slip bottom sheet behavior
17. Touch target optimization
18. Animation polish (odds flash, transitions)
19. Cross-browser testing
20. Performance audit (font loading, CSS size)

---

## QUICK-START: Single Prompt for AI Code Generation

If you want to give ONE prompt to an AI (like Claude, GPT, etc.) to generate the complete theme CSS, use this:

```
Generate a complete CSS theme override file called "parimatch-theme.css" for a
betting/casino web platform. This file will be loaded AFTER the existing platform
CSS to override only visual styles.

Requirements:
- Dark navy/blue-black theme (#1A1A2E base, #0D1117 header/footer, #0F1629 sidebars)
- Bright yellow accent (#FFD700) for CTAs, active states, selected odds
- White (#FFF) primary text, muted grey (#A0AEC0) secondary text
- Fonts: Montserrat (headers), Roboto (body), Roboto Mono (odds/numbers)
- 3-column layout: 220px left sidebar, flexible center, 300px right sidebar
- Cards/panels: #1E2A4A background, 8px radius, #2D3748 borders
- Odds buttons: #1E2A4A default, yellow when selected, green/red flash on change
- Mobile: Bottom tab navigation bar, collapsible sidebars, bottom sheet bet slip
- Minimal shadows (dark-on-dark only), subtle hover states
- Include CSS animations for odds changes and loading states
- Use CSS custom properties (:root variables) for all tokens
- Include @media queries for 1200px, 768px, and 480px breakpoints
- Include Google Fonts @import for Montserrat, Roboto, Roboto Mono
- Target common betting platform selectors: header, sidebar, odds-grid,
  bet-slip, casino-grid, form inputs, buttons, cards, tables, modals
- Include a "LIVE" pulsing red dot animation
- Include smooth transition animations for panel open/close

Output ONLY the CSS file content, no explanations.
```

---

## IMPORTANT NOTES

1. **White-label platforms** (like WLS365) may have restricted template editing. Check if your admin panel allows custom CSS injection or theme uploads before starting.

2. **If using a CMS/admin panel**: Look for "Custom CSS" or "Theme Editor" sections in your WLS365 backend — you may be able to paste the override CSS directly.

3. **If self-hosted**: Add the CSS file to your project and include it as the last stylesheet in your HTML `<head>`.

4. **Testing**: Always test in staging/development before pushing to production. Check all pages, especially: bet placement flow, casino game launch, deposits/withdrawals, and live betting.

5. **Assets**: You'll need to replace the logo and possibly some icons. Prepare your brand logo in SVG format (white or yellow version for dark backgrounds).

6. **Performance**: Keep the override CSS file under 50KB. Use CSS minification for production.
