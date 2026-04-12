import React, { useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { FiActivity } from "react-icons/fi";
import { useBettingStore } from "../../store/bettingStore";
import { bettingSocketService } from "../../services/bettingSocketService";

import ErrorBoundary from "../Common/ErrorBoundary";
import clsx from "clsx";

const SPORT_ICONS: Record<string, string> = {
  Cricket: "🏏",
  Football: "⚽",
  Tennis: "🎾",
  Soccer: "⚽",
  Hockey: "🏒",
};

function SportTabs() {
  const sports = useBettingStore((s) => s.sports);
  const location = useLocation();
  const isHome =
    location.pathname === "/betting" || location.pathname === "/betting/";
  const sportMatch = location.pathname.match(/\/betting\/sport\/([^/]+)/);
  const activeSportId = sportMatch?.[1] ?? null;

  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide px-3 py-2 bg-bg-card border-b border-stroke-light">
      <Link
        to="/betting"
        className={clsx(
          "flex items-center gap-1.5 px-4 py-2 rounded font-display text-sm font-semibold whitespace-nowrap transition-all shrink-0",
          isHome
            ? "bg-brand-primary text-brand-text shadow-sm"
            : "text-neutral-gray-600 hover:bg-bg-light-blue hover:text-brand-text",
        )}
      >
        <FiActivity size={14} />
        IN-PLAY
      </Link>
      {sports.map((sport) => (
        <Link
          key={sport.sportId}
          to={`/betting/sport/${sport.sportId}`}
          className={clsx(
            "flex items-center gap-1.5 px-4 py-2 rounded font-display text-sm font-semibold whitespace-nowrap transition-all shrink-0",
            String(sport.sportId) === activeSportId
              ? "bg-brand-primary text-brand-text shadow-sm"
              : "text-neutral-gray-600 hover:bg-bg-light-blue hover:text-brand-text",
          )}
        >
          <span>{SPORT_ICONS[sport.name] ?? "🏆"}</span>
          {sport.name.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}

export default function BettingLayout() {
  const location = useLocation();
  const isEventPage = /\/betting\/event\//.test(location.pathname);

  useEffect(() => {
    // Sports are now fetched by BettingDataProvider at app level
    bettingSocketService.connectUser();
    return () => {
      bettingSocketService.disconnectAll();
    };
  }, []);

  return (
    <div className="flex flex-col h-full min-h-screen bg-bg-primary">
      {/* Sport nav tabs (hidden on event detail page) */}
      {!isEventPage && <SportTabs />}

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
