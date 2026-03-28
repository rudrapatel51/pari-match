# Sports Betting Website - Complete Documentation

## 🎯 Project Overview

A professional, fully responsive sports betting website built with **React**, **TypeScript**, and **Tailwind CSS**. This project replicates a modern betting platform with all major features including live betting, odds display, user registration, and comprehensive navigation.

---

## ✨ Key Features

### 1. **Fully Responsive Design**
- ✅ Mobile-first approach (320px+)
- ✅ Tablet optimization (768px+)
- ✅ Desktop three-column layout (1024px+)
- ✅ Large screen support (1920px max-width)

### 2. **Complete Component Library**
- Header with sticky navigation
- Auto-rotating hero banner carousel
- Horizontal scrolling game categories
- Three-column layout (left sidebar, main content, right sidebar)
- Interactive betting odds display
- User registration forms (3 types)
- Comprehensive footer with links and partners

### 3. **Reusable Color System**
All colors are centralized in `tailwind.config.js`:
- **Brand Colors**: Blue, Navy, Cyan
- **Accent Colors**: Orange, Yellow, Green, Red
- **Neutral Grays**: 50-900 shades
- **Betting Colors**: Odds back/lay, positive/negative

### 4. **TypeScript Integration**
- Full type safety
- Interface definitions for all data structures
- Type-safe props for all components

### 5. **Modern UI/UX**
- Smooth animations and transitions
- Hover effects and interactive elements
- Loading states and visual feedback
- Accessibility-friendly design

---

## 📁 Complete Project Structure

```
sports-betting-app/
│
├── public/
│   ├── index.html                 # HTML template
│   └── (images would go here)
│
├── src/
│   ├── components/
│   │   ├── Header/
│   │   │   └── Header.tsx         # Top navigation & search
│   │   │
│   │   ├── Sidebar/
│   │   │   ├── LeftSidebar.tsx    # Competitions & live matches
│   │   │   └── RightSidebar.tsx   # Registration & bet slip
│   │   │
│   │   ├── MainContent/
│   │   │   └── MainContent.tsx    # Betting markets & odds table
│   │   │
│   │   ├── Footer/
│   │   │   └── Footer.tsx         # Links, partners, payments
│   │   │
│   │   └── Common/
│   │       ├── HeroBanner.tsx     # Carousel slider
│   │       ├── GameCategories.tsx # Horizontal scroll cards
│   │       ├── OddsButton.tsx     # Reusable odds button
│   │       └── Badge.tsx          # Reusable badge component
│   │
│   ├── data/
│   │   └── mockData.ts            # Sample matches, competitions, etc.
│   │
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces
│   │
│   ├── styles/
│   │   └── index.css              # Global styles & Tailwind imports
│   │
│   ├── App.tsx                    # Main app component
│   └── index.tsx                  # Entry point
│
├── package.json                   # Dependencies & scripts
├── tsconfig.json                  # TypeScript configuration
├── tailwind.config.js             # Tailwind customization
├── postcss.config.js              # PostCSS configuration
├── .gitignore                     # Git ignore rules
├── README.md                      # Basic readme
├── SETUP_GUIDE.md                # Detailed setup instructions
├── quick-start.sh                # Quick start script
└── PROJECT_OVERVIEW.md           # This file
```

---

## 🎨 Design System

### Color Palette

#### Brand Colors
```typescript
'brand-blue': {
  50: '#e6f0ff',   // Lightest
  500: '#0066e6',  // Primary
  900: '#00141a',  // Darkest
}

'brand-navy': {
  DEFAULT: '#001f3f',  // Main background
  light: '#002952',
  dark: '#001529',
}

'brand-cyan': {
  DEFAULT: '#00bcd4',  // Accent color
  light: '#4dd0e1',
  dark: '#0097a7',
}
```

#### Accent Colors
```typescript
'accent-orange': '#ff6b35',  // CTA buttons
'accent-yellow': '#ffd700',  // Highlights
'accent-green': '#00c853',   // Positive/Win
'accent-red': '#ff1744',     // Live/Urgent
```

#### Betting Colors
```typescript
'odds-back': '#a6d8ff',      // Back betting odds
'odds-lay': '#fac9d0',       // Lay betting odds
'odds-positive': '#00e676',  // Odds increase
'odds-negative': '#ff1744',  // Odds decrease
```

### Typography

**Fonts Used:**
- **Roboto**: Body text and general content
- **Oswald**: Display text and headings
- **Roboto Mono**: Odds, numbers, and monospaced content

**Font Sizes:**
- Extra Small: `text-xs` (12px)
- Small: `text-sm` (14px)
- Base: `text-base` (16px)
- Large: `text-lg` (18px)
- Extra Large: `text-xl` to `text-6xl`

### Component Classes

```css
/* Buttons */
.btn-primary          // Blue primary button
.btn-secondary        // Cyan secondary button
.btn-accent          // Orange accent button

/* Odds */
.odds-button         // Back odds (light blue)
.odds-button-lay     // Lay odds (light pink)

/* Cards */
.card                // White card with shadow
.card-dark           // Navy card with shadow

/* Badges */
.badge-live          // Red live badge
.badge-upcoming      // Yellow upcoming badge

/* Inputs */
.input-field         // Standard form input
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Extract the project** (if zipped)
2. **Navigate to directory:**
   ```bash
   cd sports-betting-app
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start development server:**
   ```bash
   npm start
   ```

5. **Open browser:**
   Navigate to `http://localhost:3000`

### Quick Start Script
For Unix/Mac/Linux:
```bash
chmod +x quick-start.sh
./quick-start.sh
```

---

## 📱 Responsive Breakpoints

| Device | Breakpoint | Behavior |
|--------|-----------|----------|
| Mobile | `< 768px` | Single column, hamburger menu |
| Tablet | `768px - 1023px` | Two columns, collapsible sidebars |
| Desktop | `1024px - 1279px` | Three columns, left sidebar visible |
| Large Desktop | `≥ 1280px` | Full three columns, all sidebars |

### Tailwind Responsive Classes
```tsx
// Hidden on mobile, visible on desktop
<div className="hidden lg:block">...</div>

// Full width on mobile, half on tablet
<div className="w-full md:w-1/2">...</div>

// Stack on mobile, flex on desktop
<div className="flex-col lg:flex-row">...</div>
```

---

## 🧩 Component Usage

### Header Component
```tsx
<Header />
```
**Features:**
- Sticky positioning
- Search bar
- Login/Registration buttons
- Main navigation menu
- Mobile hamburger menu

### Hero Banner
```tsx
<HeroBanner />
```
**Features:**
- Auto-rotating slides (5s interval)
- Manual navigation arrows
- Dot indicators
- Click to navigate
- Pause on hover (can be added)

### Odds Button
```tsx
<OddsButton 
  odds={1.85} 
  label="1" 
  type="back"
  onClick={handleClick}
/>
```

### Badge Component
```tsx
<Badge variant="live">LIVE</Badge>
<Badge variant="upcoming">UPCOMING</Badge>
```

---

## 🔧 Customization Guide

### 1. Change Brand Colors

Edit `tailwind.config.js`:
```javascript
colors: {
  'brand-blue': {
    600: '#YOUR_COLOR',  // Change this
  },
}
```

### 2. Modify Layout

Edit `src/App.tsx`:
```tsx
// Change gap between columns
<div className="flex gap-4">  {/* Change gap-4 to gap-6 */}
```

### 3. Update Mock Data

Edit `src/data/mockData.ts`:
```typescript
export const mockMatches: Match[] = [
  {
    id: '1',
    homeTeam: 'Your Team Name',
    awayTeam: 'Opponent Name',
    // ... rest of data
  },
];
```

### 4. Add New Pages

1. Create new component:
```tsx
// src/components/NewPage/NewPage.tsx
const NewPage: React.FC = () => {
  return <div>New Page Content</div>;
};
export default NewPage;
```

2. Import in App.tsx:
```tsx
import NewPage from './components/NewPage/NewPage';
```

---

## 🎯 API Integration (Future)

### Setup API Service

Create `src/services/api.ts`:
```typescript
const API_BASE_URL = 'https://your-api.com';

export const fetchMatches = async () => {
  const response = await fetch(`${API_BASE_URL}/matches`);
  return response.json();
};

export const placeBet = async (betData: any) => {
  const response = await fetch(`${API_BASE_URL}/bets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(betData),
  });
  return response.json();
};
```

### Use in Component

```tsx
import { useEffect, useState } from 'react';
import { fetchMatches } from '../services/api';

const MainContent = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches()
      .then(data => {
        setMatches(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching matches:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    // Render matches
  );
};
```

---

## 🧪 Testing

### Install Testing Libraries
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### Example Test
```typescript
// src/components/Header/Header.test.tsx
import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header Component', () => {
  test('renders logo', () => {
    render(<Header />);
    expect(screen.getByText('WLS')).toBeInTheDocument();
  });

  test('renders navigation items', () => {
    render(<Header />);
    expect(screen.getByText('CRICKET')).toBeInTheDocument();
  });
});
```

### Run Tests
```bash
npm test
```

---

## 📦 Build & Deploy

### Create Production Build
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Deploy to GitHub Pages
```bash
npm install --save-dev gh-pages
```

Add to `package.json`:
```json
"homepage": "https://username.github.io/sports-betting-app",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

Deploy:
```bash
npm run deploy
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Module not found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 2: Tailwind classes not working
```bash
# Reinstall Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Issue 3: TypeScript errors
```bash
# Install type definitions
npm install --save-dev @types/react @types/react-dom
```

### Issue 4: Port already in use
```bash
# Kill process on port 3000
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 🎓 Learning Resources

- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Icons**: https://react-icons.github.io/react-icons

---

## 📄 License

This is a demonstration project for educational purposes.

---

## 👥 Contributing

To contribute or customize:
1. Fork the project
2. Create your feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📞 Support

For issues or questions:
1. Check the SETUP_GUIDE.md
2. Review this documentation
3. Check the README.md
4. Search for similar issues online

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**