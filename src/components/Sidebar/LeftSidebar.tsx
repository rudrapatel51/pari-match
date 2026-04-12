import React from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { useBettingStore } from "../../store/bettingStore";

const SPORT_ICONS: Record<string, string> = {
  Cricket: "🏏",
  Football: "⚽",
  Soccer: "⚽",
  Tennis: "🎾",
  Hockey: "🏒",
  Basketball: "🏀",
  Baseball: "⚾",
  Rugby: "🏉",
  "Horse Racing": "🐎",
  "Greyhound Racing": "🐕",
  Kabaddi: "🤼",
  Election: "🗳️",
  Volleyball: "🏐",
  "Table Tennis": "🏓",
  Badminton: "🏸",
  Boxing: "🥊",
  MMA: "🥋",
  Golf: "⛳",
};

// QUICK LINKS
const QUICK_LINKS = [
  { id: "all-live", label: "All Live", icon: "🔥", path: "/betting" },
  { id: "favorites", label: "Favorites", icon: "⭐", path: "/betting" },
  { id: "top-parlays", label: "Top Parlays", icon: "💸", path: "/betting" },
  { id: "promotions", label: "Promotions", icon: "🎁", path: "/promo" },
];

interface LeftSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = () => {
  const navigate = useNavigate();
  const storeSports = useBettingStore((s) => s.sports);
  const displaySports = storeSports;

  return (
    <aside
      className={[
        "hidden lg:flex flex-col",
        "sticky top-[49px] h-[calc(100vh-49px)]",
        "w-[320px]",
        "bg-bg-secondary",
        "text-brand-text",
        "z-sidebar overflow-y-auto custom-scrollbar flex-shrink-0",
      ].join(" ")}
    >
      <div className="flex flex-col py-1">
        {/* QUICK LINKS */}
        <div className="flex flex-col">
          {QUICK_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => navigate(link.path)}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-bg-light-blue transition-colors text-left border-b border-black/40"
            >
              <span className="text-2xl leading-none">{link.icon}</span>
              <span className="text-sm font-semibold text-[#e1e1e1]">
                {link.label}
              </span>
            </button>
          ))}
        </div>

        {/* SPORTS LIST */}
        <div className="flex flex-col">
          {displaySports.map((sport: any) => (
            <button
              key={sport.sportId}
              onClick={() =>
                navigate(sport.path || `/betting/sport/${sport.sportId}`)
              }
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-bg-light-blue transition-colors text-left border-b border-black/40"
            >
              <span className="text-2xl leading-none">
                {SPORT_ICONS[sport.name] ?? "🏆"}
              </span>
              <span className="text-sm font-semibold text-[#e1e1e1] flex-1">
                {sport.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default LeftSidebar;
