import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiHome, FiUser, FiGrid, FiGift, FiMenu } from "react-icons/fi";
import { clsx } from "clsx";
import { useAuth } from "../../hooks/useAuth";
import { useUiStore } from "../../store/uiStore";

type NavAction = "navigate" | "profile" | "toggleMenu";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  action: NavAction;
}

const GUEST_NAV_ITEMS: NavItem[] = [
  { icon: FiGrid, label: "Casino", path: "/casino", action: "navigate" },
  { icon: FiGift, label: "Promos", path: "/promo", action: "navigate" },
  { icon: FiHome, label: "Home", path: "/", action: "navigate" },
  { icon: FiUser, label: "Account", path: "/profile", action: "profile" },
  { icon: FiMenu, label: "Menu", path: "", action: "toggleMenu" },
];

const AUTH_NAV_ITEMS: NavItem[] = [
  { icon: FiGrid, label: "Casino", path: "/casino", action: "navigate" },
  { icon: FiGift, label: "Promos", path: "/promo", action: "navigate" },
  { icon: FiHome, label: "Home", path: "/", action: "navigate" },
  { icon: FiUser, label: "Account", path: "/profile", action: "profile" },
  { icon: FiMenu, label: "Menu", path: "", action: "toggleMenu" },
];

const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { openModal } = useUiStore();

  const NAV_ITEMS = isAuthenticated ? AUTH_NAV_ITEMS : GUEST_NAV_ITEMS;

  const handleNavClick = ({ path, action }: NavItem) => {
    switch (action) {
      case "profile":
        if (!isAuthenticated) {
          openModal("login");
          return;
        }
        navigate(path);
        window.dispatchEvent(new Event("openAccountDrawer"));
        break;

      case "toggleMenu":
        window.dispatchEvent(new Event("toggleMobileNav"));
        break;

      case "navigate":
      default:
        navigate(path);
        break;
    }
  };

  return (
    <>
      {/* Spacer to push body content above the fixed navigation */}
      <div
        className="h-14 lg:hidden w-full shrink-0 select-none pointer-events-none"
        aria-hidden="true"
      />
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-brand-primary border-t border-stroke-light lg:hidden shadow-elevated safe-area-bottom"
        aria-label="Mobile navigation"
      >
        <div
          className="flex items-center justify-around py-2"
          style={{ paddingBottom: "calc(8px + env(safe-area-inset-bottom))" }}
        >
          {NAV_ITEMS.map((item) => {
            const { icon: Icon, label, path, action } = item;

            const isActive =
              (path && location.pathname === path) ||
              (path !== "/" && path && location.pathname.startsWith(path));

            return (
              <button
                key={path + action}
                onClick={() => handleNavClick(item)}
                className={clsx(
                  "flex flex-col items-center justify-center flex-1 min-w-0 gap-1 py-1 px-1 rounded-lg touch-manipulation transition-colors duration-150",
                  isActive
                    ? "text-brand-accent"
                    : "text-neutral-gray-500 active:text-brand-accent",
                )}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Icon wrapper */}
                <div className="relative flex-shrink-0">
                  <Icon
                    className={clsx(
                      "w-5 h-5",
                      isActive ? "text-brand-accent" : "text-neutral-gray-500",
                    )}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;
