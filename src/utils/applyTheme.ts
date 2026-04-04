/**
 * applyTheme.ts
 *
 * Reads the backend theme response and writes ALL CSS variables onto <html>.
 * Works for BOTH light and dark mode themes from the backend.
 *
 * Key principle:
 *   - ALL color values come from the backend — nothing is hardcoded here.
 *   - In dark mode, textColor from backend (#fef3c7) becomes --color-brand-text,
 *     which is what components use for readable text on dark backgrounds.
 *   - The neutral-gray scale is DERIVED from the theme so grays always
 *     contrast correctly against bgPrimary regardless of light/dark mode.
 */

export interface BrandTheme {
  mode: 'light' | 'dark';
  primaryColor: string;
  primaryLight: string;
  primaryDark: string;
  accentColor: string;
  accentLight: string;
  accentDark: string;
  bgPrimary: string;
  bgSecondary: string;
  bgCard: string;
  bgLightBlue: string;
  textColor: string;
  strokePrimary: string;
  strokeLight: string;
  successColor: string;
  errorColor: string;
  heroGradient: string;
  logoUrl?: string;
  faviconUrl?: string;
  siteName?: string;
  site_title?: string;
}

export const DEFAULT_THEME: BrandTheme = {
  mode: 'dark',
  primaryColor:  '#121212',  // header, sidebar, nav bar background
  primaryLight:  '#1f1f1f',  // sub-navigation bar, hover states
  primaryDark:   '#0a0a0a',  // left sidebar panel, darker surfaces
  accentColor:   '#CDFE04',  // CTA buttons, active tab, LIVE badge, links
  accentLight:   '#D9FE36',  // accent hover
  accentDark:    '#B3DE00',  // accent pressed
  bgPrimary:     '#121212',  // main page canvas background
  bgSecondary:   '#181818',  // input fields, deeper background
  bgCard:        '#212121',  // cards, panels, match rows
  bgLightBlue:   '#2a2a2a',  // row hover, tab hover, subtle tints
  textColor:     '#ffffff',  // primary text — white on dark bg
  strokePrimary: '#2a2a2a',  // card borders, table dividers
  strokeLight:   '#1f1f1f',  // subtle row separators
  successColor:  '#CDFE04',  // success (Parimatch yellow)
  errorColor:    '#ff4757',  // error, loss, lay bet
  heroGradient:  'linear-gradient(135deg, #121212 0%, #1a1a1a 50%, #212121 100%)',
};

/** Locked 1xBet-style dark theme — used as the base for mobile/desktop merges. */
export const XBET_DARK_THEME: BrandTheme = {
  mode:          'dark',
  primaryColor:  '#121212',
  primaryLight:  '#1f1f1f',
  primaryDark:   '#0a0a0a',
  accentColor:   '#CDFE04',
  accentLight:   '#D9FE36',
  accentDark:    '#B3DE00',
  bgPrimary:     '#121212',
  bgSecondary:   '#181818',
  bgCard:        '#212121',
  bgLightBlue:   '#2a2a2a',
  textColor:     '#ffffff',
  strokePrimary: '#2a2a2a',
  strokeLight:   '#1f1f1f',
  successColor:  '#CDFE04',
  errorColor:    '#ff4757',
  heroGradient:  'linear-gradient(135deg, #121212 0%, #1a1a1a 50%, #212121 100%)',
};

/**
 * Convert hex color to RGB components string "R G B"
 * Used for CSS variables that need opacity support: rgb(var(--x) / 0.5)
 */
function hexToRgbChannels(hex: string): string {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '0 0 0';
  return `${r} ${g} ${b}`;
}

/**
 * Determine if a hex color is "dark" (luminance < 0.4)
 * Used to decide whether neutral grays should go light→dark or dark→light
 */
function isDark(hex: string): boolean {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  // Perceived luminance
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance < 0.4;
}

/**
 * Blend two hex colors by a ratio (0 = all a, 1 = all b)
 */
function blendHex(a: string, b: string, ratio: number): string {
  const ca = a.replace('#', '');
  const cb = b.replace('#', '');
  const fa = ca.length === 3 ? ca.split('').map(c => c + c).join('') : ca;
  const fb = cb.length === 3 ? cb.split('').map(c => c + c).join('') : cb;
  const r = Math.round(parseInt(fa.slice(0, 2), 16) * (1 - ratio) + parseInt(fb.slice(0, 2), 16) * ratio);
  const g = Math.round(parseInt(fa.slice(2, 4), 16) * (1 - ratio) + parseInt(fb.slice(2, 4), 16) * ratio);
  const bv = Math.round(parseInt(fa.slice(4, 6), 16) * (1 - ratio) + parseInt(fb.slice(4, 6), 16) * ratio);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bv.toString(16).padStart(2, '0')}`;
}

/**
 * Generate a 10-step neutral gray scale that always contrasts with bgPrimary.
 *
 * In dark mode (dark bgPrimary): scale goes dark → light (50=darkest, 900=lightest)
 * In light mode (light bgPrimary): scale goes light → dark (50=lightest, 900=darkest)
 *
 * This means text-neutral-gray-800 is ALWAYS readable body text,
 * text-neutral-gray-500 is ALWAYS muted text,
 * regardless of whether the theme is light or dark.
 */
function generateNeutralScale(bgPrimary: string, textColor: string): Record<string, string> {
  const darkBg = isDark(bgPrimary);

  // In dark mode: 50 = near bgPrimary (very dark), 900 = near textColor (very light)
  // In light mode: 50 = near white/textColor (very light), 900 = near bgPrimary (very dark)
  const dark = darkBg ? bgPrimary : '#0a0c0d';
  const light = darkBg ? textColor : '#f8f9fa';

  const steps = [0.03, 0.08, 0.15, 0.22, 0.32, 0.45, 0.60, 0.72, 0.84, 0.93];

  const scale: Record<string, string> = {};
  const keys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

  keys.forEach((key, i) => {
    scale[key] = darkBg
      ? blendHex(dark, light, steps[i])   // dark bg: scale from dark to light
      : blendHex(light, dark, steps[i]);  // light bg: scale from light to dark
  });

  return scale;
}

/**
 * Main function — call this with the backend theme response data.
 * Writes all CSS variables to document.documentElement.
 */
export function applyTheme(theme: Partial<BrandTheme>): void {
  const t: BrandTheme = { ...DEFAULT_THEME, ...theme };
  const root = document.documentElement;
  const darkMode = t.mode === 'dark' || isDark(t.bgPrimary);

  // ── Toggle dark class on <html> ──────────────────────────────────────────
  if (darkMode) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // ── Brand colors ─────────────────────────────────────────────────────────
  root.style.setProperty('--color-brand-primary',       t.primaryColor);
  root.style.setProperty('--color-brand-primary-light', t.primaryLight);
  root.style.setProperty('--color-brand-primary-dark',  t.primaryDark);

  root.style.setProperty('--color-brand-accent',        t.accentColor);
  root.style.setProperty('--color-brand-accent-light',  t.accentLight);
  root.style.setProperty('--color-brand-accent-dark',   t.accentDark);

  // ── Semantic text color ───────────────────────────────────────────────────
  // This is THE most important variable for dark mode readability.
  // In dark theme: textColor = #fef3c7 (light cream) → text is readable on dark cards
  // In light theme: textColor = #0d2b45 (dark blue)  → text is readable on white cards
  root.style.setProperty('--color-brand-text', t.textColor);

  // brand-white is the "always readable surface text" color
  // In dark mode it should be textColor (light), in light mode it's white
  root.style.setProperty('--color-brand-white', darkMode ? t.textColor : '#ffffff');

  // ── Background colors ─────────────────────────────────────────────────────
  root.style.setProperty('--color-bg-primary',   t.bgPrimary);
  root.style.setProperty('--color-bg-secondary', t.bgSecondary);
  root.style.setProperty('--color-bg-card',      t.bgCard);
  root.style.setProperty('--color-bg-light-blue', t.bgLightBlue);

  // bg-white-rgb: used for opacity modifiers like bg-white/20
  // In dark mode use bgCard channels so opacity works correctly
  root.style.setProperty('--color-bg-white-rgb', hexToRgbChannels(t.bgCard));

  // ── Stroke / Border colors ────────────────────────────────────────────────
  root.style.setProperty('--color-stroke-primary', t.strokePrimary);
  root.style.setProperty('--color-stroke-light',   t.strokeLight);

  // ── Fixed accent colors ───────────────────────────────────────────────────
  root.style.setProperty('--color-accent-green',       t.successColor);
  root.style.setProperty('--color-accent-green-light', blendHex(t.successColor, '#ffffff', 0.3));
  root.style.setProperty('--color-accent-green-dark',  blendHex(t.successColor, '#000000', 0.25));

  root.style.setProperty('--color-accent-red',         t.errorColor);
  root.style.setProperty('--color-accent-red-light',   blendHex(t.errorColor, '#ffffff', 0.3));
  root.style.setProperty('--color-accent-red-dark',    blendHex(t.errorColor, '#000000', 0.25));

  // Orange and yellow stay fixed — they're universal warning/highlight colors
  root.style.setProperty('--color-accent-orange',       '#ff6b35');
  root.style.setProperty('--color-accent-orange-light', '#ff8c5a');
  root.style.setProperty('--color-accent-orange-dark',  '#e85a2a');
  root.style.setProperty('--color-accent-yellow',       '#ffd700');
  root.style.setProperty('--color-accent-yellow-light', '#ffe44d');
  root.style.setProperty('--color-accent-yellow-dark',  '#ccac00');

  // ── Betting odds ──────────────────────────────────────────────────────────
  // Odds back/lay must always be readable regardless of theme
  if (darkMode) {
    root.style.setProperty('--color-odds-back', '#1d4b7a');  // 1xBet-style back on dark
    root.style.setProperty('--color-odds-lay',  '#7a1d1d');  // 1xBet-style lay on dark
  } else {
    root.style.setProperty('--color-odds-back', '#a6d8ff');  // soft blue on light
    root.style.setProperty('--color-odds-lay',  '#fac9d0');  // soft pink on light
  }

  // ── Neutral gray scale (auto-generated for correct contrast) ─────────────
  const neutralScale = generateNeutralScale(t.bgPrimary, t.textColor);
  Object.entries(neutralScale).forEach(([key, value]) => {
    root.style.setProperty(`--color-neutral-${key}`, value);
  });

  // ── Shadows ───────────────────────────────────────────────────────────────
  if (darkMode) {
    root.style.setProperty('--shadow-betting-card', '0 2px 8px rgba(0, 0, 0, 0.85)');
    root.style.setProperty('--shadow-odds-hover',   '0 4px 12px rgba(245, 158, 11, 0.2)');
    root.style.setProperty('--shadow-elevated',     '0 8px 24px rgba(0, 0, 0, 0.92)');
    root.style.setProperty('--shadow-sidebar-top',  '0 -2px 8px 0 rgba(0, 0, 0, 0.55)');
  } else {
    root.style.setProperty('--shadow-betting-card', '0 2px 8px rgba(0, 31, 63, 0.15)');
    root.style.setProperty('--shadow-odds-hover',   '0 4px 12px rgba(0, 102, 230, 0.3)');
    root.style.setProperty('--shadow-elevated',     '0 8px 24px rgba(0, 0, 0, 0.12)');
    root.style.setProperty('--shadow-sidebar-top',  '0 -2px 8px 0 rgba(0, 0, 0, 0.06)');
  }

  // ── Gradients ─────────────────────────────────────────────────────────────
  root.style.setProperty('--gradient-hero', t.heroGradient);
  root.style.setProperty('--gradient-cta',
    `linear-gradient(90deg, ${t.accentColor} 0%, ${t.primaryColor} 100%)`);
  root.style.setProperty('--gradient-card',
    `linear-gradient(180deg, ${t.primaryColor} 0%, ${t.primaryDark} 100%)`);
  root.style.setProperty('--gradient-odds',
    `linear-gradient(90deg, ${t.primaryColor} 0%, ${t.accentColor} 100%)`);

  // ── Gradient seed points (used by bg-brand-gradient-start/end) ───────────
  root.style.setProperty('--color-gradient-start', t.accentColor);
  root.style.setProperty('--color-gradient-end',   t.primaryColor);
}

/**
 * Restore theme from localStorage cache (called before React hydrates
 * to prevent flash of wrong theme).
 */
export function restoreThemeFromCache(): void {
  try {
    const cached = localStorage.getItem('brandTheme');
    if (cached) {
      const theme = JSON.parse(cached) as Partial<BrandTheme>;
      applyTheme(theme);
    }
  } catch {
    applyTheme(DEFAULT_THEME);
  }
}