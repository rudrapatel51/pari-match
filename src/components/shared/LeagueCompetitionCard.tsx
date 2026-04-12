import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LeagueCompetitionCardProps {
  league: string;
  count: number;
  isLive?: boolean;
  index?: number;
  /** Background image URL — defaults to local /matchimages.webp */
  bgImage?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_TINTS = [
  "rgba(120,20,20,0.55)",
  "rgba(15,70,80,0.55)",
  "rgba(20,40,110,0.55)",
  "rgba(80,20,100,0.55)",
  "rgba(20,80,40,0.55)",
  "rgba(100,60,10,0.55)",
];

const DEFAULT_BG = "/matchimages.webp";

// ─── LeagueCompetitionCard ────────────────────────────────────────────────────

const LeagueCompetitionCard: React.FC<LeagueCompetitionCardProps> = ({
  league,
  count,
  isLive,
  index = 0,
  bgImage,
}) => {
  const tint = CARD_TINTS[index % CARD_TINTS.length];
  const src = bgImage || DEFAULT_BG;

  return (
    <div className="relative flex-shrink-0 w-72 md:w-auto rounded-xl overflow-hidden cursor-pointer group h-40 select-none">
      {/* Background image */}
      <img
        src={src}
        alt={league}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      {/* Color tint overlay */}
      <div className="absolute inset-0" style={{ background: tint }} />
      {/* Bottom-to-top dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-gray-900/90 via-neutral-gray-900/20 to-transparent" />

      {/* LIVE badge */}
      {isLive && (
        <div className="absolute top-3 left-3">
          <span className="bg-accent-green text-brand-text text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
            LIVE
          </span>
        </div>
      )}

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-brand-text text-base leading-none">🏆</span>
          <span className="text-brand-text font-bold text-sm leading-tight line-clamp-2">
            {league}
          </span>
        </div>
        <span className="bg-brand-primary text-brand-text text-[10px] font-semibold px-2.5 py-1 rounded-full">
          {count} {count === 1 ? "Event" : "Events"}
        </span>
      </div>
    </div>
  );
};

export default LeagueCompetitionCard;
