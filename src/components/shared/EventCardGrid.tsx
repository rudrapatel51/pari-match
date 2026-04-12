import React from "react";
import { useNavigate } from "react-router-dom";

interface EventRunner {
  runnerId: number | string;
  name: string;
  back: string | number;
  lay: string | number;
}

interface Event {
  _id?: string;
  eventId: number | string;
  name: string;
  league?: string;
  matchStatus?: string;
  isInPlay?: boolean;
  startTime?: string;
  hasBookmaker?: boolean;
  matchOdds?: {
    runners?: EventRunner[];
  } | null;
}

interface EventCardGridProps {
  events: Event[];
  groupByLeague?: boolean;
  loading?: boolean;
}

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

function getTeams(event: Event): { home: string; away: string } {
  const r = event.matchOdds?.runners;
  if (r && r.length >= 2) return { home: r[0].name, away: r[1].name };
  const parts = event.name.split(" v ");
  return {
    home: parts[0]?.trim() || "Team 1",
    away: parts[1]?.trim() || "Team 2",
  };
}

const EventCardGrid: React.FC<EventCardGridProps> = ({
  events,
  groupByLeague = true,
  loading = false,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-3 px-4 py-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-bg-card animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16 text-neutral-gray-500 px-4">
        <span className="text-5xl block mb-3">🎯</span>
        <p className="text-sm font-medium">No matches found</p>
      </div>
    );
  }

  // Group events by league if requested
  const leagueGroups = groupByLeague
    ? events.reduce<Record<string, Event[]>>((acc, e) => {
        const league = e.league || "Other";
        if (!acc[league]) acc[league] = [];
        acc[league].push(e);
        return acc;
      }, {})
    : { All: events };

  return (
    <div className="space-y-6 px-4 py-4">
      {Object.entries(leagueGroups).map(([league, leagueEvents]) => (
        <div key={league}>
          {/* League Section Header */}
          {groupByLeague && (
            <div className="mb-4">
              <div className="flex items-center gap-3 pb-2 border-b border-stroke-light">
                <span className="text-lg">🏟️</span>
                <h3 className="text-sm font-bold text-brand-text uppercase tracking-wide">
                  {league}
                </h3>
              </div>
            </div>
          )}

          {/* Event Cards */}
          <div className="space-y-3">
            {leagueEvents.map((e) => {
              const { home, away } = getTeams(e);
              const runners = e.matchOdds?.runners || [];
              const timeStr = formatTime(e.startTime);
              const isLive = e.isInPlay || e.matchStatus === "LIVE";

              return (
                <div
                  key={e._id || e.eventId}
                  onClick={() => navigate(`/betting/event/${e.eventId}`)}
                  className="bg-bg-card border border-stroke-light rounded-lg p-3 sm:p-4 cursor-pointer"
                >
                  {/* Top row: Match title & time */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      {isLive && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/20 border border-red-500/40 rounded-full flex-shrink-0">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-bold text-red-400 uppercase">
                              LIVE
                            </span>
                          </span>
                        </div>
                      )}
                      <h4 className="text-xs sm:text-sm font-bold text-brand-text truncate">
                        {e.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        {timeStr && (
                          <p className="text-xs text-neutral-gray-400">
                            {timeStr}
                          </p>
                        )}
                        {e.hasBookmaker && (
                          <span className="text-[9px] text-accent-yellow font-medium bg-accent-yellow/10 px-1.5 py-0.5 rounded">
                            BM
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom row: Teams left, odds right */}
                  <div className="flex items-center gap-3">
                    {/* Teams */}
                    <div className="hidden sm:flex flex-1 min-w-0 flex flex-col gap-1.5">
                      {runners.length >= 1 && (
                        <>
                          {runners
                            .slice(0, Math.min(runners.length, 2))
                            .map((runner, idx) => (
                              <div
                                key={idx}
                                className="text-xs text-neutral-gray-300 truncate"
                              >
                                {runner.name}
                              </div>
                            ))}
                        </>
                      )}
                    </div>

                    {/* Odds Boxes - Back & Lay for each runner with labels */}
                    {runners.length > 0 && (
                      <div className={`flex gap-2 sm:gap-2.5 flex-shrink-0`}>
                        {runners
                          .slice(0, Math.min(runners.length, 2))
                          .map((runner, runnerIdx) => (
                            <div
                              key={runnerIdx}
                              className="flex gap-1.5 flex-col"
                            >
                              {/* Runner name above odds */}
                              <div className="text-xs text-neutral-400 text-center truncate px-1">
                                {runner.name.length > 12
                                  ? runner.name.slice(0, 10) + "..."
                                  : runner.name}
                              </div>

                              {/* Back & Lay buttons */}
                              <div className="flex gap-1">
                                {/* Back Odds */}
                                <button
                                  onClick={(clickEvent) => {
                                    clickEvent.stopPropagation();
                                    navigate(`/betting/event/${e.eventId}`);
                                  }}
                                  className={`bg-bg-light-blue border border-stroke-primary hover:bg-brand-blue-600 transition-all rounded flex flex-col items-center justify-center group ${
                                    runners.length === 2
                                      ? "py-2 px-2.5 sm:py-3 sm:px-4 min-w-[70px] sm:min-w-[95px]"
                                      : runners.length === 3
                                        ? "py-1.5 px-2 sm:py-2.5 sm:px-3 min-w-[65px] sm:min-w-[85px]"
                                        : "py-1 px-1.5 sm:py-2 sm:px-2.5 min-w-[60px] sm:min-w-[80px]"
                                  }`}
                                >
                                  <span
                                    className={`font-bold text-cyan-400 group-hover:text-brand-text leading-none transition-colors ${
                                      runners.length === 2
                                        ? "text-lg sm:text-xl"
                                        : runners.length === 3
                                          ? "text-base sm:text-lg"
                                          : "text-sm sm:text-base"
                                    }`}
                                  >
                                    {runner.back}
                                  </span>
                                </button>

                                {/* Lay Odds */}
                                <button
                                  onClick={(clickEvent) => {
                                    clickEvent.stopPropagation();
                                    navigate(`/betting/event/${e.eventId}`);
                                  }}
                                  className={`bg-bg-light-blue border border-stroke-primary hover:bg-brand-blue-600 transition-all rounded flex flex-col items-center justify-center group ${
                                    runners.length === 2
                                      ? "py-2 px-2.5 sm:py-3 sm:px-4 min-w-[70px] sm:min-w-[95px]"
                                      : runners.length === 3
                                        ? "py-1.5 px-2 sm:py-2.5 sm:px-3 min-w-[65px] sm:min-w-[85px]"
                                        : "py-1 px-1.5 sm:py-2 sm:px-2.5 min-w-[60px] sm:min-w-[80px]"
                                  }`}
                                >
                                  <span
                                    className={`font-bold text-pink-300 group-hover:text-brand-text leading-none transition-colors ${
                                      runners.length === 2
                                        ? "text-lg sm:text-xl"
                                        : runners.length === 3
                                          ? "text-base sm:text-lg"
                                          : "text-sm sm:text-base"
                                    }`}
                                  >
                                    {runner.lay}
                                  </span>
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventCardGrid;
