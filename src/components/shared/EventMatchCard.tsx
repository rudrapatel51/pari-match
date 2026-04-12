import React from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Star } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MatchEventRunner {
  runnerId: number | string;
  name: string;
  back: string | number;
  lay: string | number;
}

export interface MatchEvent {
  eventId: number | string;
  name: string;
  league?: string;
  matchStatus?: string;
  isInPlay?: boolean;
  startTime?: string;
  score?: string;
  scorecard?: string;
  formatLabel?: string;
  runners?: MatchEventRunner[];
  sport?: { name: string };
  matchOdds?: {
    runners?: MatchEventRunner[];
  } | null;
}

export interface EventMatchCardProps {
  event: MatchEvent;
  sportIcon?: string;
  formatLabel?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface TeamScore {
  name: string;
  score: string;
}

/** Parse team names from runners → fallback to splitting "Team A v Team B" */
function getTeamNames(event: MatchEvent): string[] {
  const runners = event.matchOdds?.runners ?? event.runners ?? [];
  if (Array.isArray(runners) && runners.length >= 2) {
    return [runners[0].name, runners[1].name];
  }
  const parts = event.name.split(/ v | vs /i);
  const names = parts.map((p) => p.trim()).filter(Boolean);
  return names.length >= 2 ? [names[0], names[1]] : [event.name, ""];
}

/** Parse scorecard HTML to extract "<run> (<over>)" for each team */
function parseScorecardHTML(html?: string): [string, string] {
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

/** First try event.score with " - " split, then scorecard HTML */
function parseScores(event: MatchEvent): [string, string] {
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

/** Format ISO string → "DD/MM HH:mm" */
function formatTime(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm} ${hh}:${min}`;
  } catch {
    return iso;
  }
}

// ─── EventMatchCard ───────────────────────────────────────────────────────────

const EventMatchCard: React.FC<EventMatchCardProps> = ({
  event,
  formatLabel,
}) => {
  const navigate = useNavigate();

  const isLive = !!(
    event.isInPlay ||
    event.matchStatus === "LIVE" ||
    event.matchStatus === "in_play"
  );
  const fmt = formatLabel || event.formatLabel || "";
  const timeLabel = formatTime(event.startTime);
  const statusText = isLive
    ? `Event in progress${fmt ? ` / ${fmt}` : ""}`
    : [timeLabel, fmt].filter(Boolean).join(" / ") || "Upcoming";

  const [score0, score1] = parseScores(event);
  const teamNames = getTeamNames(event);
  const teams: TeamScore[] = [
    { name: teamNames[0], score: score0 },
    { name: teamNames[1], score: score1 },
  ].filter((t) => t.name);

  const goToEvent = () => navigate(`/betting/event/${event.eventId}`);

  return (
    <div
      className="flex-shrink-0 w-[290px] bg-bg-card border border-stroke-light rounded-t-lg
                       shadow-betting-card overflow-hidden flex flex-col cursor-pointer
                       hover:shadow-elevated hover:border-stroke-primary transition-all duration-200"
      onClick={goToEvent}
    >
      {/* ── League name ── */}
      <div className="px-3 py-2">
        <span className="text-[11px] text-neutral-gray-500 leading-tight block">
          {event.league || "Event"}
        </span>
      </div>

      {/* ── Status row: icon + text | star ── */}
      <div className="flex items-center justify-between px-3 py-2">
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

      {/* ── Teams + scores ── */}
      <div className="px-3 pb-4 flex flex-col gap-1.5 flex-1">
        {teams.map((team, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-bold text-brand-text truncate flex-1">
              {team.name}
            </span>
            {team.score && (
              <span className="text-[12px] font-semibold text-brand-text flex-shrink-0 font-mono tabular-nums">
                {team.score}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
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

export default EventMatchCard;
