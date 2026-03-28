import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { contentApi, ApiResponse } from '../api/client';
import { BrandTheme } from '../types/theme';
import { applyTheme, DEFAULT_THEME } from '../utils/applyTheme';
import { useThemeStore } from '../store/themeStore';

// ─── Context Shape ────────────────────────────────────────────────────────────

interface ThemeContextValue {
  /** The active brand theme — always a valid object (never null) */
  brandTheme: BrandTheme;
  isThemeLoading: boolean;
  themeError: Error | null;
  /** Convenience shortcut for the logo URL */
  logoUrl: string | null;
  /** Current mode as resolved from API (or default) */
  isDark: boolean;
  /** Which device type was used to fetch the theme */
  activeDevice?: 'desktop' | 'mobile';
  /** Whether a mobile-specific theme is configured in the admin panel */
  mobileEnabled?: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ─── Device Detection ─────────────────────────────────────────────────────────

const isMobileDevice = (): boolean => {
  const uaMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i
    .test(navigator.userAgent);
  const widthMobile = window.innerWidth < 768;
  return uaMobile || widthMobile;
};

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * ThemeProvider fetches the brand theme from GET /app/theme and applies it
 * globally via CSS custom properties on <html>.
 *
 * Dark / light mode is controlled exclusively by the `mode` field in the
 * API response — there is no manual frontend toggle.
 *
 * On API failure the DEFAULT_THEME is applied as a safe fallback.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setBrandTheme } = useThemeStore();
  const [activeDevice, setActiveDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [mobileEnabled, setMobileEnabled] = useState<boolean>(false);

  const device: 'desktop' | 'mobile' = isMobileDevice() ? 'mobile' : 'desktop';

  const {
    data: themeResponse,
    isLoading: isThemeLoading,
    error: themeError,
  } = useQuery<ApiResponse<BrandTheme>, Error>({
    queryKey: ['brand-theme', device],
    queryFn: () => contentApi.getTheme(device), // COMMENTED OUT FOR PARIMATCH HARDCODE: () => contentApi.getTheme(device)
    // Theme is admin-driven — refresh once per hour is sufficient
    // Poll every 30 s so admin panel changes reach users quickly
    refetchInterval: 30_000,
    // Re-fetch immediately when the user switches back to this tab
    refetchOnWindowFocus: true,
    // Keep cache fresh for 30 s (matches refetchInterval — prevents RQ skipping ticks)
    staleTime: 30_000,
    // Single retry; fall back to DEFAULT_THEME quickly on failure
    retry: 1,
  });

  // ── Apply theme when API responds ────────────────────────────────────────
  useEffect(() => {
    if (themeResponse?.data) {
      // Safely merge: DEFAULT_THEME provides values for every field the
      // API may omit. Empty strings from the API are ignored so they
      // don't blank out a valid default.
      const merged: BrandTheme = {
        ...DEFAULT_THEME,
        ...Object.fromEntries(
          Object.entries(themeResponse.data).filter(
            ([, v]) => v !== null && v !== undefined && v !== ''
          )
        ),
      };
      // applyTheme(merged); // DISABLING DYNAMIC THEME
      setBrandTheme(merged);
      const apiData = themeResponse.data as any;
      setActiveDevice((apiData?._device as 'desktop' | 'mobile') || device);
      setMobileEnabled(Boolean(apiData?._mobileEnabled));
      // Persist so the early-paint script can apply critical vars before React renders
      // try { localStorage.setItem('siteTheme', JSON.stringify(merged)); } catch (_) {} // DISABLING DYNAMIC THEME
      // Notify non-React code — matches old frontend's theme:updated custom event
      window.dispatchEvent(new CustomEvent('theme:updated', { detail: merged }));
    }
  }, [themeResponse, setBrandTheme]);

  // ── Fallback on API error ────────────────────────────────────────────────
  useEffect(() => {
    if (themeError) {
      console.warn(
        '[Theme] Failed to fetch theme from API — using DEFAULT_THEME.',
        themeError.message
      );
      // applyTheme(DEFAULT_THEME); // DISABLING DYNAMIC THEME
      setBrandTheme(DEFAULT_THEME);
    }
  }, [themeError, setBrandTheme]);

  // Resolve the active brand theme for context consumers
  const brand: BrandTheme = themeResponse?.data
    ? { ...DEFAULT_THEME, ...themeResponse.data }
    : DEFAULT_THEME;

  return (
    <ThemeContext.Provider
      value={{
        brandTheme: brand,
        isThemeLoading,
        themeError: themeError ?? null,
        logoUrl: brand.logoUrl || null,
        isDark: brand.mode === 'dark',
        activeDevice,
        mobileEnabled,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
};
