import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Star } from "lucide-react";
import { bettingApi } from "../../api/bettingClient";

// ─── Sport ID → name map ──────────────────────────────────────────────────────

export const SPORT_ID_NAME: Record<number | string, string> = {
  1: "Football",
  2: "Tennis",
  4: "Cricket",
  6: "Boxing",
  7: "Horse Racing",
  7522: "Hockey",
  2378961: "Election",
};

export const SPORT_META: Record<string, { icon: string }> = {
  Cricket: { icon: "🏏" },
  Football: { icon: "⚽" },
  Soccer: { icon: "⚽" },
  Tennis: { icon: "🎾" },
  Basketball: { icon: "🏀" },
  Baseball: { icon: "⚾" },
  Boxing: { icon: "🥊" },
  Election: { icon: "🗳️" },
  "Horse Racing": { icon: "🐴" },
  "Greyhound Racing": { icon: "🐕" },
  Kabaddi: { icon: "🤼" },
  Hockey: { icon: "🏒" },
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Runner {
  runnerId: number | string;
  name: string;
  back: string | number;
  lay: string | number;
}

export interface SportEvent {
  _id: string;
  eventId: number | string;
  name: string;
  league?: string;
  sportId?: number | string;
  sport?: { name: string };
  matchStatus?: string;
  isInPlay?: boolean;
  isGameOver?: boolean;
  startTime?: string;
  score?: string;
  scorecard?: string;
  formatLabel?: string;
  matchOdds?: { marketId?: string; runners?: Runner[] } | null;
  hasBookmaker?: boolean;
}

export interface SportsEventsSectionProps {
  sportId?: number | string;
  totalCount?: number;
  externalEvents?: SportEvent[];
}

export interface SportStripProps {
  sportName: string;
  events: SportEvent[];
  totalCount?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function parseScorecardHTML(html?: string): [string, string] {
  if (!html) return ["", ""];
  try {
    const runs = [
      ...html.matchAll(
        /<span[^>]*class="run"[^>]*>([^<]+)<\/span>\s*<span[^>]*class="over"[^>]*>([^<]+)<\/span>/gi,
      ),
    ];
    if (runs.length >= 2)
      return [
        `${runs[0][1].trim()} ${runs[0][2].trim()}`,
        `${runs[1][1].trim()} ${runs[1][2].trim()}`,
      ];
    if (runs.length === 1)
      return [`${runs[0][1].trim()} ${runs[0][2].trim()}`, ""];
  } catch (_) {
    /* ignore */
  }
  return ["", ""];
}

export function getTeamNames(event: SportEvent): [string, string] {
  const runners = event.matchOdds?.runners;
  if (runners && runners.length >= 2) return [runners[0].name, runners[1].name];
  const parts = event.name.split(/ v | vs /i);
  return [parts[0]?.trim() || event.name, parts[1]?.trim() || ""];
}

export function getScores(event: SportEvent): [string, string] {
  if (event.score && event.score.trim()) {
    const idx = event.score.indexOf(" - ");
    if (idx !== -1)
      return [
        event.score.slice(0, idx).trim(),
        event.score.slice(idx + 3).trim(),
      ];
    return [event.score.trim(), ""];
  }
  return parseScorecardHTML(event.scorecard);
}

export function formatTime(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm} ${hh}:${min}`;
  } catch {
    return iso || "";
  }
}

export function getSportName(event: SportEvent): string {
  return event.sport?.name || SPORT_ID_NAME[event.sportId ?? ""] || "Sports";
}

// ─── NavButton (shared prev/next icon button) ─────────────────────────────────

const ChevronLeft = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// ─── EventCard ────────────────────────────────────────────────────────────────

export const EventCard: React.FC<{ event: SportEvent }> = ({ event }) => {
  const navigate = useNavigate();
  const isLive = !!(
    event.isInPlay ||
    event.matchStatus === "LIVE" ||
    event.matchStatus === "in_play"
  );
  const fmt = event.formatLabel || "";
  const timeLabel = formatTime(event.startTime);
  const statusText = isLive
    ? `Event in progress${fmt ? ` / ${fmt}` : ""}`
    : [timeLabel, fmt].filter(Boolean).join(" / ") || "Upcoming";

  const [team1, team2] = getTeamNames(event);
  const [score1, score2] = getScores(event);
  const teams = [
    { name: team1, score: score1 },
    { name: team2, score: score2 },
  ].filter((t) => t.name);
  const runners = event.matchOdds?.runners ?? [];

  const goToEvent = () => navigate(`/betting/event/${event.eventId}`);

  return (
    <div
      className="flex-shrink-0 w-full md:w-[calc(33.333%-8px)] bg-bg-card border border-stroke-light rounded-t-lg shadow-betting-card
                       overflow-hidden flex flex-col cursor-pointer snap-start
                       hover:shadow-elevated hover:border-stroke-primary transition-all duration-200"
      onClick={goToEvent}
    >
      {/* League */}
      <div className="px-3 pt-2.5 pb-1.5">
        <span className="text-[11px] text-neutral-gray-500 leading-tight block">
          {event.league || "Match"}
        </span>
      </div>

      {/* Header: status icon + text | star */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-1.5 overflow-hidden">
          {isLive ? (
            <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse flex-shrink-0" />
          ) : (
            <Pencil
              className="w-3 h-3 text-brand-primary flex-shrink-0"
              strokeWidth={2.2}
            />
          )}
          <span className="text-[12px] font-medium text-brand-text truncate">
            {statusText}
          </span>
        </div>
        <Star
          className="w-3.5 h-3.5 text-neutral-gray-400 hover:text-accent-yellow transition-colors flex-shrink-0 ml-2"
          strokeWidth={1.5}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Teams + scores */}
      <div className="px-3 pb-2 flex flex-col gap-1 flex-1">
        {teams.map((team, i) => (
          <div key={i} className="flex flex-col">
            <span className="text-[13px] font-bold text-brand-text truncate leading-tight">
              {team.name}
            </span>
            {team.score && (
              <span className="text-[11px] text-neutral-gray-500 font-mono tabular-nums leading-tight">
                {team.score}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Odds boxes below */}
      {runners.length > 0 && (
        <div className="px-3 pb-3 flex gap-2">
          {runners.slice(0, 2).map((runner, i) => {
            const back =
              runner?.back != null && runner.back !== ""
                ? Number(runner.back)
                : null;
            const lay =
              runner?.lay != null && runner.lay !== ""
                ? Number(runner.lay)
                : null;
            return (
              <div key={i} className="flex-1">
                <div className="flex gap-2 mb-2">
                  <div
                    className="flex-1 border border-stroke-light p-3 text-center cursor-pointer transition-all"
                    style={{ backgroundColor: "var(--color-bg-light-blue)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#404040";
                      const span = e.currentTarget.querySelector("span");
                      if (span) span.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--color-bg-light-blue)";
                      const span = e.currentTarget.querySelector("span");
                      if (span) span.style.color = "#22d3ee";
                    }}
                  >
                    <span
                      className="text-[14px] font-bold block"
                      style={{ color: "#22d3ee" }}
                    >
                      {back != null && !isNaN(back) ? back.toFixed(2) : "—"}
                    </span>
                  </div>
                  <div
                    className="flex-1 border border-stroke-light p-3 text-center cursor-pointer transition-all"
                    style={{ backgroundColor: "var(--color-bg-light-blue)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#404040";
                      const span = e.currentTarget.querySelector("span");
                      if (span) span.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--color-bg-light-blue)";
                      const span = e.currentTarget.querySelector("span");
                      if (span) span.style.color = "#fb923c";
                    }}
                  >
                    <span
                      className="text-[14px] font-bold block"
                      style={{ color: "#fb923c" }}
                    >
                      {lay != null && !isNaN(lay) ? lay.toFixed(2) : "—"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 text-center">
                  <span className="flex-1 text-[10px] text-neutral-gray-500">
                    Back
                  </span>
                  <span className="flex-1 text-[10px] text-neutral-gray-500">
                    Lay
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          goToEvent();
        }}
        className="w-full py-2.5 text-[12px] font-medium text-neutral-gray-500
                           bg-bg-card
                           hover:bg-bg-light-blue transition-colors text-center"
      >
        All events
      </button>
    </div>
  );
};

// ─── SportStrip: one horizontal scroll section per sport ──────────────────────

export const SportStrip: React.FC<SportStripProps> = ({
  sportName,
  events,
  totalCount,
}) => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const icon = SPORT_META[sportName]?.icon ?? "🏆";
  const count = totalCount ?? events.length;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const firstCard = scrollRef.current.firstElementChild as HTMLElement;
    const cardWidth = firstCard
      ? firstCard.offsetWidth + 12
      : scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-full px-2 py-2">
      {/* Section header */}
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="flex items-center gap-1.5 text-[14px] font-bold text-brand-text uppercase tracking-wide">
          <span className="text-base">{icon}</span>
          {sportName.toUpperCase()}
          <span className="text-neutral-gray-500 font-semibold normal-case tracking-normal text-[13px]">
            ({count.toLocaleString()})
          </span>
        </h2>
        <div className="flex items-center gap-1">
          {/* Prev / Next — all screen sizes */}
          <div className="flex gap-0.5">
            <button
              onClick={() => scroll("left")}
              className="p-1.5 rounded-full bg-stroke-light hover:bg-stroke-primary text-brand-text transition-colors touch-manipulation"
              aria-label="Previous event"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-1.5 rounded-full bg-stroke-light hover:bg-stroke-primary text-brand-text transition-colors touch-manipulation"
              aria-label="Next event"
            >
              <ChevronRight />
            </button>
          </div>
          <button
            onClick={() => navigate("/betting")}
            aria-label={`More ${sportName} events`}
            className="text-[18px] font-bold text-brand-primary hover:text-brand-primary-light transition-colors"
          >
            »
          </button>
        </div>
      </div>

      {/* Horizontal scroll with snap */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory py-2"
      >
        {events.slice(0, 15).map((event) => (
          <EventCard key={event._id || String(event.eventId)} event={event} />
        ))}
      </div>
    </div>
  );
};

// ─── SportsEventsSection (main / default export) ──────────────────────────────

const SportsEventsSection: React.FC<SportsEventsSectionProps> = ({
  sportId = 4,
  totalCount,
  externalEvents,
}) => {
  // If externalEvents is provided, never fetch — just mirror the prop.
  // Use `undefined` to mean "no externals & needs fetch"; `[]` means externals provided but empty.
  const hasExternal = externalEvents !== undefined;

  const [events, setEvents] = useState<SportEvent[]>(externalEvents ?? []);
  const [loading, setLoading] = useState(!hasExternal);

  // Keep events in sync when parent pushes new externalEvents (e.g. after parent's own fetch)
  useEffect(() => {
    if (hasExternal) {
      setEvents(externalEvents!);
      setLoading(false);
    }
  }, [externalEvents]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await bettingApi.getEventsBySport(sportId);
      const events = Array.isArray(res?.data) ? res.data : [];
      setEvents(events.filter((e: SportEvent) => !e.isGameOver));
    } catch (err) {
      console.error("Error fetching events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [sportId]);

  useEffect(() => {
    if (!hasExternal) fetchEvents();
  }, [fetchEvents, hasExternal]);

  if (loading) {
    return (
      <div className="w-full px-2 py-2">
        {/* Skeleton header */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-28 h-4 bg-stroke-light rounded animate-pulse" />
        </div>
        {/* Skeleton cards */}
        <div className="flex gap-3 overflow-x-hidden">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-full md:w-[calc(33.333%-8px)] h-[156px] bg-stroke-light rounded-2xl animate-pulse"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) return null;

  // Group by sport name
  const grouped: Record<string, SportEvent[]> = {};
  for (const e of events) {
    const sport = getSportName(e);
    if (!grouped[sport]) grouped[sport] = [];
    grouped[sport].push(e);
  }
  const sportNames = Object.keys(grouped);

  return (
    <div className="w-full flex flex-col gap-1 bg-bg-white">
      {sportNames.map((sportName) => (
        <SportStrip
          key={sportName}
          sportName={sportName}
          events={grouped[sportName]}
          totalCount={sportNames.length === 1 ? totalCount : undefined}
        />
      ))}
    </div>
  );
};

export default SportsEventsSection;
