import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Header from "./components/Header/Header";
import LeftSidebar from "./components/Sidebar/LeftSidebar";
import RightSidebar from "./components/Sidebar/RightSidebar";
import Footer from "./components/Footer/Footer";
import AppRoutes from "./routes/AppRoutes";
import AuthModalContainer from "./components/Auth/AuthModalContainer";
import SessionExpiredModal from "./components/Auth/SessionExpiredModal";
import ToastContainer from "./components/Common/Toast";
import ScrollToTop from "./components/Common/ScrollToTop";
import MobileBottomNav from "./components/Common/MobileBottomNav";
import DesktopAccountDrawer from "./components/Profile/DesktopAccountDrawer";
import { useAuthStore } from "./store/authStore";
import { useNotificationStore } from "./store/notificationStore";
import { BettingDataProvider } from "./context/BettingDataContext";
import { useBettingStore } from "./store/bettingStore";
import "./styles/index.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const Layout: React.FC = () => {
  const location = useLocation();

  // ── Notification polling (driven by auth state) ──────────────────────────────
  const { isAuthenticated } = useAuthStore();
  const { initPolling, stopPolling } = useNotificationStore();

  useEffect(() => {
    if (isAuthenticated) {
      initPolling();
    } else {
      stopPolling();
    }
  }, [isAuthenticated]);

  // ── Desktop sidebar collapse state ──────────────────────────────────────────
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  // Mobile bet-slip drawer (shown below xl breakpoint)
  const [isMobileBetSlipOpen, setIsMobileBetSlipOpen] = useState(false);

  // Auto-open right sidebar (desktop) OR mobile drawer whenever a bet is added
  const betItemsLength = useBettingStore((s) => s.betItems.length);
  useEffect(() => {
    if (betItemsLength > 0) {
      setIsRightSidebarCollapsed(false); // open desktop sidebar
      setIsMobileBetSlipOpen(true); // open mobile drawer
    }
  }, [betItemsLength]);

  // ── Mobile state — STRICTLY SEPARATED ───────────────────────────────────────
  /**
   * isMobileNavOpen  → Pages navigation drawer (hamburger in header, LEFT side).
   *                    Renders the same navigationItems as the desktop nav bar.
   */
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  /**
   * isDesktopAccountDrawerOpen → Desktop account settings drawer.
   *                              Opened by hamburger icon next to logo on desktop.
   */
  const [isDesktopAccountDrawerOpen, setIsDesktopAccountDrawerOpen] =
    useState(false);

  /**
   * isMobileFilterOpen → Left sidebar filter drawer (LeftSidebar component).
   *                      Triggered by "Add Filter" in MobileBottomNav.
   *                      Also used on non-account pages via the header hamburger
   *                      on pages where the LeftSidebar is the primary nav.
   */
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Listen for 'openLeftSidebar' event dispatched by MobileBottomNav "Add Filter" button.
  // This avoids prop drilling through MobileBottomNav.
  useEffect(() => {
    const handleOpenFilter = () => setIsMobileFilterOpen(true);
    window.addEventListener("openLeftSidebar", handleOpenFilter);
    return () =>
      window.removeEventListener("openLeftSidebar", handleOpenFilter);
  }, []);

  // Listen for 'toggleMobileNav' event dispatched by hamburger menu in MobileBottomNav
  useEffect(() => {
    const handleToggleMobileNav = () => setIsMobileNavOpen((prev) => !prev);
    window.addEventListener("toggleMobileNav", handleToggleMobileNav);
    return () =>
      window.removeEventListener("toggleMobileNav", handleToggleMobileNav);
  }, []);

  // Listen for 'toggleDesktopAccountDrawer' event dispatched by Header hamburger
  useEffect(() => {
    const handleToggleAccountDrawer = () =>
      setIsDesktopAccountDrawerOpen((prev) => !prev);
    window.addEventListener(
      "toggleDesktopAccountDrawer",
      handleToggleAccountDrawer,
    );
    return () =>
      window.removeEventListener(
        "toggleDesktopAccountDrawer",
        handleToggleAccountDrawer,
      );
  }, []);

  // Close all mobile menus when route changes
  useEffect(() => {
    setIsMobileNavOpen(false);
    setIsMobileFilterOpen(false);
  }, [location.pathname]);

  // Hide global sidebars on all account/profile pages — AccountLayout provides its own sidebar
  const ACCOUNT_PATHS = [
    "/my-account",
    "/profile",
    "/kyc",
    "/change-password",
    "/notification",
    "/wallet",
    "/deposit",
    "/withdraw",
    "/bet-history",
    "/unsettled-bets",
    "/profit-loss",
    "/bet-stake-setting",
    "/payment-accounts",
    "/casino-bet-history",
    "/spin-win",
    "/daily-rewards",
    "/my-vip",
    "/affiliate",
    "/contact-us",
    "/bonus-manager",
  ];
  const isProfilePage = ACCOUNT_PATHS.some(
    (p) => location.pathname === p || location.pathname.startsWith(p + "/"),
  );

  return (
    <div className="bg-brand-primary-dark flex flex-col">
      <Header
        isMobileNavOpen={isMobileNavOpen}
        onMobileNavToggle={() => setIsMobileNavOpen((prev) => !prev)}
        isDesktopAccountDrawerOpen={isDesktopAccountDrawerOpen}
      />

      {/* Responsive layout: left sidebar (desktop) + main content + right sidebar */}
      <div className="flex-1 flex pt-[45px] sm:pt-[49px] w-full min-w-0">
        {/* Left Sidebar (filter/sports nav) — hidden on account pages */}
        {!isProfilePage && (
          <LeftSidebar
            isCollapsed={isLeftSidebarCollapsed}
            onToggleCollapse={() =>
              setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)
            }
            isMobileOpen={isMobileFilterOpen}
            onMobileClose={() => setIsMobileFilterOpen(false)}
          />
        )}

        {/*
         * Main Content (includes Footer at bottom)
         * Account pages: overflow-visible so the VIEWPORT is the scroll container
         *   (required for position:sticky inside AccountLayout to work correctly).
         * Other pages: overflow-auto as before.
         */}
        <main
          className={`flex-1 w-full max-w-[1920px] mx-auto flex flex-col md:w-auto md:pb-0 ${
            isProfilePage ? "overflow-visible" : "overflow-auto"
          }`}
        >
          <div className="flex-1">
            <AppRoutes />
          </div>
          {!isProfilePage && <Footer />}
        </main>

        {/* Right Sidebar — desktop: sticky column; mobile: fixed overlay drawer */}
        {!isProfilePage && (
          <>
            {/* ── Desktop xl and above ── */}
            <aside
              className={`hidden xl:block xl:sticky xl:top-[49px] xl:h-[calc(100vh-49px)] transition-all duration-300 ease-in-out ${
                isRightSidebarCollapsed
                  ? "xl:w-0 xl:overflow-hidden"
                  : "xl:w-80"
              } flex-shrink-0`}
            >
              <RightSidebar
                isCollapsed={isRightSidebarCollapsed}
                onToggleCollapse={() => setIsRightSidebarCollapsed((v) => !v)}
              />
            </aside>

            {/* ── Mobile / tablet (< xl) — shared bottom sheet / collapsed bar ── */}
            <div className="xl:hidden">
              <RightSidebar
                isCollapsed={!isMobileBetSlipOpen}
                onToggleCollapse={() => setIsMobileBetSlipOpen((v) => !v)}
              />
            </div>
          </>
        )}

        {/* Desktop Account Drawer */}
        <DesktopAccountDrawer
          isOpen={isDesktopAccountDrawerOpen}
          onClose={() => setIsDesktopAccountDrawerOpen(false)}
        />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <ScrollToTop />
          <BettingDataProvider>
            <Layout />
          </BettingDataProvider>
          <MobileBottomNav />
          <AuthModalContainer />
          <SessionExpiredModal />
          <ToastContainer />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
