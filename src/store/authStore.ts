import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { User } from "../types/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;
  rememberedUsername: string | null;

  // Actions
  setAuth: (user: User, token: string, rememberMe?: boolean) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  updateUser: (updates: Partial<User>) => void;
  clearRememberedCredentials: () => void;

  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // ──── MOCK AUTH - DESIGN MODE ────────────────────────────────
      // Uncomment below for DESIGN MODE (stay logged in)
      // ──────────────────────────────────────────────────────────────
      // user: {
      //   id: "1",
      //   username: "demo_user",
      //   email: "demo@parimatch.com",
      //   first_name: "Demo",
      //   last_name: "User",
      //   balance: 5000,
      //   currency: "USD",
      //   change_password: false,
      // },
      // token: "mock_token_for_design_work",
      // isAuthenticated: true,

      // ──── TESTING MODE - See login/signup pages ────────────────
      // Active by default - comment out above to use design mode
      // ──────────────────────────────────────────────────────────────
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      rememberMe: false,
      rememberedUsername: null,

      setAuth: (user, token, rememberMe = false) => {
        localStorage.setItem("authToken", token);

        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
          localStorage.setItem("rememberedUsername", user.username);
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("rememberedUsername");
        }

        set({
          user,
          token,
          isAuthenticated: true,
          error: null,
          rememberMe,
          rememberedUsername: rememberMe ? user.username : null,
        });
      },

      logout: () => {
        const rememberMe = localStorage.getItem("rememberMe") === "true";
        const rememberedUsername = localStorage.getItem("rememberedUsername");

        localStorage.removeItem("authToken");
        localStorage.removeItem("sessionToken");

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
          rememberMe,
          rememberedUsername: rememberMe ? rememberedUsername : null,
        });

        // Reset all other stores to prevent stale data leaking between sessions.
        // Lazy-imported to avoid circular dependencies at module init time.
        import("./bettingStore").then((m) =>
          m.useBettingStore.getState().reset(),
        );
        import("./betStore").then((m) => m.useBetStore.getState().reset());
        import("./sportsStore").then((m) =>
          m.useSportsStore.getState().reset(),
        );
        import("./notificationStore").then((m) =>
          m.useNotificationStore.getState().reset(),
        );
        import("./uiStore").then((m) => m.useUiStore.getState().reset());
      },

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      clearRememberedCredentials: () => {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("rememberedUsername");
        set({ rememberMe: false, rememberedUsername: null });
      },

      reset: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
        rememberedUsername: state.rememberedUsername,
      }),
    },
  ),
);

// ---------------------------------------------------------------------------
// Global event listeners — wired up once at module-initialisation time.
// ---------------------------------------------------------------------------
if (typeof window !== "undefined") {
  window.addEventListener("auth:session-expired", () => {
    useAuthStore.getState().logout();
  });

  window.addEventListener("auth:device-conflict", () => {
    useAuthStore.getState().logout();
  });

  window.addEventListener("auth:force-logout", () => {
    useAuthStore.getState().logout();
  });
}
