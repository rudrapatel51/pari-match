import { create } from 'zustand';
import { BrandTheme } from '../types/theme';
import { DEFAULT_THEME } from '../utils/applyTheme';

interface ThemeStoreState {
    brandTheme: BrandTheme;
    isThemeLoaded: boolean;

    setBrandTheme: (theme: BrandTheme) => void;
    clearBrandTheme: () => void;
}

/**
 * Zustand store for the active brand theme.
 *
 * Initialised with DEFAULT_THEME so the app always has meaningful color
 * values before the API response arrives. ThemeContext is the primary
 * writer; this store makes the theme readable anywhere without prop drilling.
 */
interface ThemeStoreStateWithReset extends ThemeStoreState {
    reset: () => void;
}

export const useThemeStore = create<ThemeStoreStateWithReset>((set) => ({
    brandTheme: DEFAULT_THEME,
    isThemeLoaded: false,

    setBrandTheme: (theme) => set({ brandTheme: theme, isThemeLoaded: true }),
    clearBrandTheme: () => set({ brandTheme: DEFAULT_THEME, isThemeLoaded: false }),
    reset: () => set({ brandTheme: DEFAULT_THEME, isThemeLoaded: false }),
}));
