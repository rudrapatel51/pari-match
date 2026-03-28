# Design System Documentation
## WLS Sports Betting Platform

This document defines all design tokens, colors, typography, spacing, and styling patterns used throughout the application to ensure a consistent UI experience.

---

## 🎨 Color Palette

### Brand Colors

#### Primary Blue
- **Purpose**: Main brand color, used for headers, primary buttons, and key UI elements
- **Default**: `#09467B` (`brand-primary`)
- **Light**: `#0d5a9a` (`brand-primary-light`)
- **Dark**: `#063556` (`brand-primary-dark`)
- **Usage**: Navigation bars, primary CTAs, active states, links

#### Brand Blue Scale
```
brand-blue-50:  #e3f2fd
brand-blue-100: #b8dff5
brand-blue-200: #8ccbee
brand-blue-300: #5fb7e7
brand-blue-400: #3da8e1
brand-blue-500: #1a99db
brand-blue-600: #0e7bc4
brand-blue-700: #09467B (DEFAULT)
brand-blue-800: #063556
brand-blue-900: #042331
```

#### Accent Blue
- **Default**: `#00427C` (`brand-accent`)
- **Light**: `#0e5a9a` (`brand-accent-light`)
- **Dark**: `#002f5a` (`brand-accent-dark`)
- **Usage**: Secondary buttons, hover states, accents

#### Brand White
- **Color**: `#FFFFFF` (`brand-white`)
- **Usage**: Text on dark backgrounds, card backgrounds

---

### Background Colors

| Token | Hex Code | Usage |
|-------|----------|-------|
| `bg-primary` | `#D4DEE8` | Main page background, light sections |
| `bg-secondary` | `#1D4268` | Dark sections, contrasting areas |
| `bg-white` | `#FFFFFF` | Cards, modals, clean backgrounds |
| `bg-card` | `#FFFFFF` | Card components |
| `bg-light-blue` | `#E9EEF2` | Subtle backgrounds, hover states |

---

### Stroke/Border Colors

| Token | Hex Code | Usage |
|-------|----------|-------|
| `stroke-primary` | `#09467B` | Primary borders, dividers |
| `stroke-light` | `#D4DEE8` | Light borders, subtle dividers |

---

### Accent Colors

#### Orange
- **Default**: `#ff6b35` (`accent-orange`)
- **Light**: `#ff8c5a` (`accent-orange-light`)
- **Dark**: `#e85a2a` (`accent-orange-dark`)
- **Usage**: Age restrictions (18+), warnings

#### Yellow
- **Default**: `#ffd700` (`accent-yellow`)
- **Light**: `#ffe44d` (`accent-yellow-light`)
- **Dark**: `#ccac00` (`accent-yellow-dark`)
- **Usage**: CTAs, highlights, upcoming badges, footer headings

#### Green
- **Default**: `#276A45` (`accent-green`)
- **Light**: `#34884f` (`accent-green-light`)
- **Dark**: `#1d5033` (`accent-green-dark`)
- **Usage**: Success states, registration buttons, positive actions

#### Red
- **Default**: `#ff1744` (`accent-red`)
- **Light**: `#ff616f` (`accent-red-light`)
- **Dark**: `#c4001d` (`accent-red-dark`)
- **Usage**: Live badges, errors, negative odds

---

### Neutral Gray Scale

| Token | Hex Code | Usage |
|-------|----------|-------|
| `neutral-gray-50` | `#f8f9fa` | Lightest backgrounds |
| `neutral-gray-100` | `#e9ecef` | Very light backgrounds |
| `neutral-gray-200` | `#D4DEE8` | Light backgrounds |
| `neutral-gray-300` | `#ced4da` | Borders, dividers |
| `neutral-gray-400` | `#adb5bd` | Disabled states, placeholders |
| `neutral-gray-500` | `#6c757d` | Secondary text |
| `neutral-gray-600` | `#495057` | Body text |
| `neutral-gray-700` | `#343a40` | Headings, important text |
| `neutral-gray-800` | `#212529` | Primary text |
| `neutral-gray-900` | `#0a0c0d` | Darkest text |

---

### Betting-Specific Colors

| Token | Hex Code | Usage |
|-------|----------|-------|
| `odds-back` | `#a6d8ff` | Back odds buttons (light blue) |
| `odds-lay` | `#fac9d0` | Lay odds buttons (light pink) |
| `odds-positive` | `#00e676` | Positive odds changes |
| `odds-negative` | `#ff1744` | Negative odds changes |

---

## 📝 Typography

### Font Families

```css
font-sans: 'Roboto', Arial, sans-serif      /* Body text, UI elements */
font-display: 'Oswald', sans-serif          /* Headings, hero text */
font-mono: 'Roboto Mono', monospace         /* Odds, numbers, code */
```

### Font Weights
- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **Bold**: 700

### Text Sizes
Use Tailwind's default text sizing scale:
- `text-xs`: 0.75rem (12px)
- `text-sm`: 0.875rem (14px)
- `text-base`: 1rem (16px)
- `text-lg`: 1.125rem (18px)
- `text-xl`: 1.25rem (20px)
- `text-2xl`: 1.5rem (24px)
- `text-3xl`: 1.875rem (30px)
- `text-4xl`: 2.25rem (36px)
- `text-5xl`: 3rem (48px)

---

## 🎭 Gradients

### Background Gradients

```css
bg-hero-gradient: linear-gradient(135deg, #09467B 0%, #00427C 50%, #276A45 100%)
bg-cta-gradient: linear-gradient(90deg, #276A45 0%, #00427C 100%)
bg-card-gradient: linear-gradient(180deg, #09467B 0%, #00427C 100%)
bg-odds-gradient: linear-gradient(90deg, #09467B 0%, #00427C 100%)
```

**Usage**:
- `hero-gradient`: Hero banners, promotional sections
- `cta-gradient`: Call-to-action buttons
- `card-gradient`: Premium cards, featured content
- `odds-gradient`: Odds displays, betting cards

---

## 🌑 Shadows

```css
shadow-betting-card: 0 2px 8px rgba(0, 31, 63, 0.15)
shadow-odds-hover: 0 4px 12px rgba(0, 102, 230, 0.3)
shadow-elevated: 0 8px 24px rgba(0, 0, 0, 0.12)
```

**Usage**:
- `betting-card`: Default card elevation
- `odds-hover`: Hover state for odds buttons
- `elevated`: Modals, dropdowns, important elements

---

## 📏 Spacing

### Custom Spacing Tokens

```css
sidebar-collapsed: 50px
sidebar-expanded: 250px
```

### Standard Spacing
Use Tailwind's spacing scale (based on 0.25rem = 4px):
- `p-1`: 0.25rem (4px)
- `p-2`: 0.5rem (8px)
- `p-3`: 0.75rem (12px)
- `p-4`: 1rem (16px)
- `p-6`: 1.5rem (24px)
- `p-8`: 2rem (32px)
- `p-12`: 3rem (48px)

---

## 🎬 Animations

### Keyframe Animations

```css
@keyframes pulse-odds {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; transform: scale(1.05); }
}

@keyframes slideIn {
  0% { transform: translateX(-100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
```

### Animation Classes

```css
animate-pulse-odds: pulse-odds 0.5s cubic-bezier(0.4, 0, 0.6, 1)
animate-slide-in: slideIn 0.3s ease-out
animate-fade-in: fadeIn 0.2s ease-in
```

---

## 🧩 Component Styles

### Buttons

#### Primary Button
```css
.btn-primary
bg-brand-primary
hover:bg-brand-primary-light
text-white
font-medium
px-6 py-2.5
rounded
transition-all duration-200
hover:shadow-odds-hover
```

#### Secondary Button
```css
.btn-secondary
bg-brand-accent
hover:bg-brand-accent-light
text-white
font-medium
px-6 py-2.5
rounded
transition-all duration-200
```

#### Accent Button (CTA)
```css
.btn-accent
bg-cta-gradient
hover:opacity-90
text-white
font-medium
px-6 py-2.5
rounded
transition-all duration-200
```

---

### Odds Buttons

#### Back Odds
```css
.odds-button
bg-odds-back
hover:bg-blue-200
text-neutral-gray-900
font-mono
text-sm
px-3 py-2
rounded
cursor-pointer
transition-all duration-150
hover:shadow-odds-hover
```

#### Lay Odds
```css
.odds-button-lay
bg-odds-lay
hover:bg-red-200
text-neutral-gray-900
font-mono
text-sm
px-3 py-2
rounded
cursor-pointer
transition-all duration-150
```

---

### Cards

#### Standard Card
```css
.card
bg-bg-card
rounded-lg
shadow-betting-card
p-4
```

#### Dark Card
```css
.card-dark
bg-brand-primary
text-white
rounded-lg
shadow-betting-card
p-4
```

---

### Input Fields

```css
.input-field
w-full
px-4 py-2.5
border border-stroke-light
rounded
focus:outline-none
focus:border-brand-primary
focus:ring-2 focus:ring-blue-200
transition-all
```

---

### Badges

#### Live Badge
```css
.badge-live
bg-accent-red
text-white
text-xs
font-bold
px-2 py-1
rounded
uppercase
```

#### Upcoming Badge
```css
.badge-upcoming
bg-accent-yellow
text-neutral-gray-900
text-xs
font-bold
px-2 py-1
rounded
uppercase
```

---

## 🎯 Z-Index Layers

```css
z-header: 50    /* Fixed header */
z-sidebar: 40   /* Sidebars */
z-content: 10   /* Main content */
```

---

## 📜 Scrollbar Styling

### Thin Scrollbar
```css
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: neutral-gray-400;
  border-radius: 4px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: neutral-gray-500;
}
```

### Global Scrollbar (Dark)
```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1a1a1a;
}

::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #444;
}
```

---

## ⚠️ Known Issues & Inconsistencies

### Issues Found:

1. **Header.tsx (Line 45)**: Uses `text-primary` instead of `text-brand-primary`
   - ❌ Current: `text-primary`
   - ✅ Should be: `text-brand-primary`

2. **Footer.tsx**: References undefined colors
   - ❌ `text-brand-cyan` (not defined in Tailwind config)
   - ❌ `text-brand-navy` (not defined in Tailwind config)
   - ✅ Should use: `text-accent-yellow` or `text-brand-primary`

3. **Scrollbar Colors**: Global scrollbar uses hardcoded hex values instead of Tailwind tokens
   - Consider using theme colors for consistency

---

## 📋 Usage Guidelines

### Color Usage Best Practices

1. **Text Colors**:
   - Primary text: `text-neutral-gray-800`
   - Secondary text: `text-neutral-gray-600` or `brand-text`
   - On dark backgrounds: `text-white` or `text-brand-white`
   - Links/Interactive: `text-brand-primary`

2. **Backgrounds**:
   - Page background: `bg-bg-primary`
   - Cards: `bg-white` or `bg-bg-card`
   - Dark sections: `bg-brand-primary` or `bg-brand-primary-dark`
   - Hover states: `bg-bg-light-blue`

3. **Borders**:
   - Default: `border-stroke-light`
   - Emphasis: `border-brand-primary`
   - Subtle: `border-neutral-gray-200`

4. **Interactive States**:
   - Hover: Lighten background or add shadow
   - Active: Use `brand-primary` color
   - Disabled: Use `neutral-gray-400`

---

## 🔄 Transition Standards

```css
transition-colors     /* For color changes */
transition-all        /* For multiple properties */
duration-150          /* Fast interactions (150ms) */
duration-200          /* Standard interactions (200ms) */
duration-300          /* Slower animations (300ms) */
```

---

## 📱 Responsive Design

### Breakpoints (Tailwind defaults)
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Container
```css
.container-custom
max-w-[1920px]
mx-auto
px-2 sm:px-4 lg:px-6
```

---

## 🎨 Component-Specific Color Usage

### Header
- Background: `bg-white`
- Top bar border: `border-stroke-light`
- Navigation bar: `bg-brand-primary-light`
- Text on nav: `text-white`
- Buttons: `bg-brand-primary` with `text-white`

### Sidebars
- Left sidebar background: `bg-white`
- Right sidebar background: `bg-bg-light-blue`
- Section headers: `bg-brand-primary` with `text-white`
- List items hover: `bg-bg-light-blue`

### Main Content
- Background: `bg-bg-light-blue`
- Cards: `bg-white`
- Match headers: `bg-brand-primary` with `text-brand-white`
- Tabs active: `border-brand-primary` and `text-brand-primary`

### Footer
- Background: `bg-brand-primary-dark`
- Section headers: `text-accent-yellow`
- Links: `text-neutral-gray-300` hover to `text-white`
- Social icons background: `bg-brand-primary-light`

---

## ✅ Checklist for Consistent UI

- [ ] Use only defined color tokens from Tailwind config
- [ ] Apply consistent text colors: `text-neutral-gray-800` for body, `text-white` on dark backgrounds
- [ ] Use `brand-primary` for primary actions and navigation
- [ ] Apply `accent-red` for live badges
- [ ] Use `accent-yellow` for CTAs and highlights
- [ ] Ensure all borders use `stroke-light` or `stroke-primary`
- [ ] Apply consistent hover states with `transition-colors`
- [ ] Use defined shadow tokens for elevation
- [ ] Follow spacing scale consistently
- [ ] Use font families appropriately (sans for UI, display for headings, mono for numbers)

---

**Last Updated**: 2026-02-12  
**Version**: 1.0.0
