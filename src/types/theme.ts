/**
 * BrandTheme — shape of the `data` object returned by GET /app/theme.
 *
 * All fields are optional so the frontend gracefully falls back to
 * DEFAULT_THEME (and ultimately the static CSS variables in index.css)
 * when any field is absent or the API fails entirely.
 *
 * ─── Dark Mode Contract ───────────────────────────────────────────────────
 * The API always sends light-mode hex values. When mode === 'dark', applyTheme.ts
 * IGNORES bgPrimary, bgSecondary, bgCard, bgLightBlue, and textColor — computing
 * dark equivalents from the brand hue instead. Components must NEVER use these
 * fields directly as inline styles; always go through CSS custom properties.
 * ─────────────────────────────────────────────────────────────────────────
 */
export interface BrandTheme {
    /** Controls dark or light mode globally — driven by the API response */
    mode?: 'light' | 'dark';

    // Brand primary — seed hue for the entire palette
    primaryColor?: string;
    /** Light-mode value. Dark-mode equivalent is computed by applyTheme. */
    primaryLight?: string;
    /** Light-mode value. Dark-mode equivalent is computed by applyTheme. */
    primaryDark?: string;

    // Accent
    accentColor?: string;
    accentLight?: string;
    accentDark?: string;

    // Backgrounds — light-mode values only.
    // In dark mode applyTheme uses html.dark CSS fallbacks; do NOT use these as inline styles.
    bgPrimary?: string;
    bgSecondary?: string;
    bgCard?: string;
    bgLightBlue?: string;

    // Text & borders
    // textColor is a light-mode value. In dark mode applyTheme forces a high-lightness value.
    textColor?: string;
    strokePrimary?: string;
    strokeLight?: string;

    // Semantic status colors
    successColor?: string;
    errorColor?: string;

    // Gradients (full CSS gradient string)
    heroGradient?: string;

    // Assets
    logoUrl?: string;
    faviconUrl?: string;

    // Site identity
    siteName?: string;
    /** Used as document.title; falls back to siteName if absent */
    site_title?: string;
}
