import React, { useState, useEffect } from "react";
import {
  FiChevronDown,
  FiMenu,
  FiX,
  FiGlobe,
  FiClock,
  FiBell,
  FiUser,
  FiSearch,
} from "react-icons/fi";
import { IndianRupee, CirclePlus } from "lucide-react";
import { navigationItems } from "../../data/mockData";
import { useUiStore } from "../../store/uiStore";
import { useAuth } from "../../hooks/useAuth";
import { useAuthStore } from "../../store/authStore";
import { useNavigate, useLocation } from "react-router-dom";
import { useNotificationStore } from "../../store/notificationStore";
import MobileNavDrawer from "./MobileNavDrawer";
import ProfileDropdown from "./ProfileDropdown";

interface HeaderProps {
  isMobileNavOpen?: boolean;
  onMobileNavToggle?: () => void;
  isDesktopAccountDrawerOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  isMobileNavOpen = false,
  isDesktopAccountDrawerOpen = false,
  onMobileNavToggle,
}) => {
  const [currentTime, setCurrentTime] = useState<string>("");
  const { openModal } = useUiStore();
  const { isAuthenticated } = useAuth();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-header bg-bg-secondary">
        {/* ── Top bar ── */}
        <div className="bg-bg-secondary">
          <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 md:px-6">
            <div className="flex items-center h-11 sm:h-12 text-brand-text text-xs">
              {/* LEFT: Logo */}
              <div className="flex items-center gap-2 min-w-0">
                {/* Desktop hamburger menu — shows X when open */}
                <button
                  className="hidden md:flex items-center justify-center w-12 h-12 mr-1 rounded-lg text-brand-text hover:bg-bg-light-blue transition-colors"
                  onClick={() =>
                    window.dispatchEvent(
                      new Event("toggleDesktopAccountDrawer"),
                    )
                  }
                  aria-label={
                    isDesktopAccountDrawerOpen
                      ? "Close account menu"
                      : "Open account menu"
                  }
                >
                  {isDesktopAccountDrawerOpen ? (
                    <FiX className="w-5 h-5" />
                  ) : (
                    <FiMenu className="w-5 h-5" />
                  )}
                </button>

                <div
                  className="flex items-center cursor-pointer shrink-0"
                  onClick={() => navigate("/")}
                  role="link"
                  aria-label="Go to homepage"
                >
                  <img
                    src="https://cdn.whitelabelssolutions.com/yellowred.svg"
                    className="h-10 w-10 sm:h-11 sm:w-11"
                    alt="WLSBet logo"
                  />
                </div>
              </div>

              {/* CENTER: Desktop Nav Links */}
              <div className="hidden md:flex items-center flex-1 justify-center px-4 overflow-x-auto scrollbar-hide">
                <ul className="flex items-center">
                  {navigationItems.map((item, index) => {
                    const isActive =
                      location.pathname === item.href ||
                      (item.href !== "/" &&
                        location.pathname.startsWith(item.href + "/"));
                    return (
                      <li key={index}>
                        <a
                          href={item.href}
                          className={[
                            "group relative flex items-center justify-center gap-2",
                            "px-4 lg:px-5 py-3",
                            "text-sm font-semibold whitespace-nowrap",
                            "transition-all touch-manipulation",
                            isActive
                              ? "bg-transparent text-brand-accent font-bold"
                              : "text-white hover:text-brand-accent",
                          ].join(" ")}
                        >
                          {item.icon && (
                            <span className="text-base">{item.icon}</span>
                          )}
                          <span>{item.label}</span>
                          {!isActive && (
                            <span className="absolute bottom-0 left-0 w-full h-[3px] bg-white/40 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
                          )}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* RIGHT: Auth + Language + Time */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
                {!isAuthenticated ? (
                  <>
                    <button
                      onClick={() => openModal("login")}
                      className="flex items-center justify-center bg-bg-card hover:bg-bg-light-blue text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded transition-colors font-semibold text-xs sm:text-sm border border-stroke-light touch-manipulation"
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => openModal("register")}
                      className="flex items-center justify-center bg-brand-accent hover:opacity-90 text-black px-3 py-1.5 sm:px-4 sm:py-2 rounded transition-colors font-bold text-xs sm:text-sm touch-manipulation"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
                    {/* Notification bell */}
                    <button
                      onClick={() => navigate("/notification")}
                      aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
                      className="relative flex items-center justify-center w-9 h-9 rounded-full text-brand-text hover:bg-bg-light-blue transition-colors"
                    >
                      <FiBell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-accent-red text-white text-[9px] font-bold px-1 leading-none ring-2 ring-bg-card pointer-events-none">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Account — Desktop only */}
                    <div className="hidden lg:flex">
                      <ProfileDropdown />
                    </div>

                    {/* Balance Button with Currency Icon */}
                    <button
                      onClick={() => navigate("/wallet")}
                      className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-bg-secondary hover:bg-bg-light-blue text-white transition-colors rounded"
                      title="Balance & Wallet"
                    >
                      {/* Currency Circle */}
                      <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-accent-yellow rounded-full text-black flex-shrink-0">
                        <IndianRupee size={10} strokeWidth={3} />
                      </div>
                      {/* Balance Amount */}
                      <span className="text-xs sm:text-sm font-bold text-brand-text">
                        {user?.balance?.toFixed(2) || "0.00"}
                      </span>
                      <FiChevronDown className="hidden sm:block w-4 h-4 text-brand-text opacity-70" />
                    </button>

                    {/* Deposit Button */}
                    <button
                      onClick={() => navigate("/deposit")}
                      className="flex items-center gap-1.5 sm:gap-2 bg-accent-green hover:opacity-90 text-black font-bold py-1.5 sm:py-2 px-2 sm:px-4 rounded text-xs sm:text-sm transition-colors"
                    >
                      <CirclePlus size={16} />
                      <span>Deposit</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer — rendered outside header to overlay everything */}
      <MobileNavDrawer
        isOpen={isMobileNavOpen}
        onClose={onMobileNavToggle ?? (() => {})}
      />
    </>
  );
};

export default Header;
