import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useBettingStore } from "../../store/bettingStore";
import { SPORT_META, LIVE_CARD } from "./MainContent";

const PopularSports: React.FC = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bettingSports = useBettingStore((s) => s.sports);
  const liveEvents = useBettingStore((s) => s.liveEvents);
  const displaySports = bettingSports;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    // Each card = half the container width (2 cards visible)
    const cardWidth = scrollRef.current.clientWidth / 2;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  return (
    <div className="bg-bg-white px-3 sm:px-4 pt-3 pb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-accent-yellow text-base">🏆</span>
          <h2 className="text-sm font-bold text-neutral-gray-800 uppercase tracking-wide">
            Popular Sports
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate("/betting")}
            className="text-brand-text text-xs font-semibold hover:underline flex items-center gap-0.5"
          >
            Live Events →
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory md:snap-none"
      >
        {/* Live In-Play card */}
        {(() => {
          const liveTotal = liveEvents.length;
          return (
            <div
              key="live"
              onClick={() => navigate(LIVE_CARD.path)}
              style={{ background: LIVE_CARD.gradient }}
              className="flex-shrink-0 w-[calc(50%-6px)] sm:w-40 rounded-lg overflow-hidden cursor-pointer hover:scale-[1.03] transition-transform shadow-md snap-start"
            >
              <div className="p-3 flex flex-col justify-between min-h-[110px]">
                <div className="flex items-start justify-between">
                  <span className="text-3xl leading-none">
                    {LIVE_CARD.icon}
                  </span>
                  {liveTotal > 0 && (
                    <span className="bg-white/20 text-brand-text text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                      {liveTotal} LIVE
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-brand-text font-bold text-sm leading-tight">
                    {LIVE_CARD.name}
                  </p>
                  <p className="text-brand-text/60 text-[10px] mt-0.5">
                    Live betting
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
        {/* API Sports */}
        {displaySports.map((sport: any) => {
          const meta = SPORT_META[sport.name] || {
            icon: "🏆",
            path: `/betting/sport/${sport.sportId}`,
            gradient: "linear-gradient(135deg, #1a2a4a 0%, #0d1830 100%)",
          };
          const sportLiveCount = liveEvents.filter(
            (e: any) => String(e.sportId) === String(sport.sportId),
          ).length;
          return (
            <div
              key={sport.sportId}
              onClick={() => navigate(meta.path)}
              style={{ background: meta.gradient }}
              className="flex-shrink-0 w-[calc(50%-6px)] sm:w-40 rounded-lg overflow-hidden cursor-pointer hover:scale-[1.03] transition-transform shadow-md snap-start"
            >
              <div className="p-3 flex flex-col justify-between min-h-[110px]">
                <div className="flex items-start justify-between">
                  <span className="text-3xl leading-none">{meta.icon}</span>
                  {sportLiveCount > 0 && (
                    <span className="bg-accent-red text-brand-text text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {sportLiveCount} LIVE
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-brand-text font-bold text-sm leading-tight">
                    {sport.name}
                  </p>
                  <p className="text-brand-text/60 text-[10px] mt-0.5">
                    Bet now
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PopularSports;
