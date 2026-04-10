import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FiCircle } from "react-icons/fi";
import { useBettingStore } from "../../store/bettingStore";
import { bettingSocketService } from "../../services/bettingSocketService";
import type { EventRunner } from "../../types/domain";

function renderMatchOddsColumns(runners: EventRunner[] | undefined) {
  const slots = [runners?.[0], runners?.[1], runners?.[2]];
  return slots.map((runner, i) => (
    <div key={i} className="flex flex-col items-center gap-0.5 min-w-[70px]">
      <div className="w-full px-3 py-2 flex flex-col items-center justify-center rounded-lg border border-stroke-light bg-neutral-gray-850 hover:bg-neutral-gray-800 transition-colors">
        <span className="text-lg font-mono font-bold text-white leading-none">
          {runner?.back != null ? Number(runner.back).toFixed(2) : "—"}
        </span>
        <span className="text-[9px] text-neutral-gray-400 font-semibold mt-1">
          Back
        </span>
      </div>
      <div className="w-full px-3 py-2 flex flex-col items-center justify-center rounded-lg border border-stroke-light bg-neutral-gray-850 hover:bg-neutral-gray-800 transition-colors">
        <span className="text-lg font-mono font-bold text-white leading-none">
          {runner?.lay != null ? Number(runner.lay).toFixed(2) : "—"}
        </span>
        <span className="text-[9px] text-neutral-gray-400 font-semibold mt-1">
          Lay
        </span>
      </div>
    </div>
  ));
}

export default function BettingHomePage() {
  // Live events come from BettingDataProvider (fetches + polls at app level)
  const liveEvents = useBettingStore((s) => s.liveEvents);

  useEffect(() => {
    bettingSocketService.connectMarkets();
  }, []);

  return (
    <div className="p-3">
      {liveEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="text-4xl">📡</span>
          <p className="text-neutral-gray-700 text-sm">
            No live events right now
          </p>
        </div>
      ) : (
        <div className="bg-bg-card rounded-lg shadow-betting-card overflow-hidden">
          {/* Table header */}
          <div className="flex items-center px-3 py-2 bg-brand-primary text-white text-xs font-display font-semibold">
            <span className="flex-1">SCHEDULE</span>
            <div className="flex gap-1 text-center">
              <span className="min-w-[40px]">1</span>
              <span className="min-w-[40px]">X</span>
              <span className="min-w-[40px]">2</span>
            </div>
          </div>

          {/* Event rows */}
          {liveEvents.map((event) => (
            <Link
              key={event.eventId}
              to={`/betting/event/${event.eventId}`}
              className="flex items-center px-3 py-3 border-b border-stroke-light transition-colors"
            >
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green" />
                </span>
                <span className="text-sm font-medium text-brand-text truncate">
                  {event.name}
                </span>
                {event.hasBookmaker && (
                  <span className="text-[10px] bg-brand-primary text-white font-bold px-1.5 py-0.5 rounded shrink-0">
                    BM
                  </span>
                )}
              </div>
              <div className="flex gap-1 shrink-0 hover:opacity-90 transition-opacity">
                {renderMatchOddsColumns(event.matchOdds?.runners)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
