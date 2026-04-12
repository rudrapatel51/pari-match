import React from "react";
import { useNavigate } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EventListRowRunner {
  runnerId: number | string;
  name: string;
  back: string | number;
  lay: string | number;
}

export interface EventListRowEvent {
  _id?: string;
  eventId: number | string;
  name: string;
  matchStatus?: string;
  isInPlay?: boolean;
  startTime?: string;
  hasBookmaker?: boolean;
  matchOdds?: {
    runners?: EventListRowRunner[];
  } | null;
}

export interface EventListRowProps {
  event: EventListRowEvent;
  isAlternate?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function getTeams(event: EventListRowEvent): { home: string; away: string } {
  const r = event.matchOdds?.runners;
  if (r && r.length >= 2) return { home: r[0].name, away: r[1].name };
  const parts = event.name.split(" v ");
  return {
    home: parts[0]?.trim() || event.name,
    away: parts[1]?.trim() || "",
  };
}

// ─── EventListRow ─────────────────────────────────────────────────────────────

const EventListRow: React.FC<EventListRowProps> = ({ event, isAlternate }) => {
  const navigate = useNavigate();
  const isLive = event.isInPlay || event.matchStatus === "LIVE";
  const { home, away } = getTeams(event);
  const runners = event.matchOdds?.runners ?? [];
  const hasOdds = runners.length >= 2;

  return (
    <div
      onClick={() => navigate(`/betting/event/${event.eventId}`)}
      className={`flex items-center px-3 py-2.5 cursor-pointer hover:bg-bg-light-blue transition-colors border-b border-stroke-light last:border-b-0 ${isAlternate ? "bg-bg-white" : "bg-bg-card"}`}
    >
      {/* Left: status + match info */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {isLive ? (
          <span className="bg-accent-green text-brand-text text-[9px] font-bold px-1.5 py-0.5 rounded uppercase leading-none tracking-wide flex-shrink-0 animate-pulse">
            LIVE
          </span>
        ) : (
          <span className="text-[10px] text-neutral-gray-500 whitespace-nowrap shrink-0">
            {formatTime(event.startTime)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          {away ? (
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-xs font-semibold text-brand-text truncate">
                {home}
              </span>
              <span className="text-xs font-semibold text-brand-text truncate">
                {away}
              </span>
            </div>
          ) : (
            <span className="text-xs font-semibold text-brand-text truncate block">
              {event.name}
            </span>
          )}
          {event.hasBookmaker && (
            <span className="text-[9px] text-accent-yellow font-medium leading-none">
              BM
            </span>
          )}
        </div>
      </div>

      {/* Right: back/lay odds */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        {hasOdds ? (
          runners.slice(0, 2).map((r) => (
            <div
              key={r.runnerId}
              className="flex flex-col items-center gap-0.5"
            >
              <span className="text-[8px] text-neutral-gray-400 truncate max-w-[60px] text-center leading-none">
                {r.name}
              </span>
              <div className="flex gap-0.5">
                <button className="bg-odds-back text-neutral-gray-900 font-bold text-[10px] px-1.5 py-0.5 rounded min-w-[32px] text-center hover:opacity-80 transition-opacity">
                  {r.back}
                </button>
                <button className="bg-odds-lay text-neutral-gray-900 font-bold text-[10px] px-1.5 py-0.5 rounded min-w-[32px] text-center hover:opacity-80 transition-opacity">
                  {r.lay}
                </button>
              </div>
            </div>
          ))
        ) : (
          <span className="text-[10px] text-neutral-gray-400 italic">
            No odds
          </span>
        )}
      </div>
    </div>
  );
};

export default EventListRow;
