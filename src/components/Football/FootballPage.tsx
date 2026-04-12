import React, { useState } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiToggleRight,
  FiToggleLeft,
  FiSmartphone,
} from "react-icons/fi";
import { BsStar, BsPhone } from "react-icons/bs";
import { MdOutlineStar, MdStar } from "react-icons/md";

// ─── Club Badge Component ──────────────────────────────────────────────────────
// Maps each club to its primary brand colors for authentic-looking circular badges

const CLUB_COLORS: Record<
  string,
  { bg: string; text: string; initials: string }
> = {
  Arsenal: { bg: "#EF0107", text: "#FFFFFF", initials: "ARS" },
  "Bayern Munich": { bg: "#DC052D", text: "#FFFFFF", initials: "BAY" },
  "Manchester City": { bg: "#6CABDD", text: "#FFFFFF", initials: "MCI" },
  Barcelona: { bg: "#A50044", text: "#FFED00", initials: "BAR" },
  "Paris Saint-Germain": { bg: "#003399", text: "#FF0000", initials: "PSG" },
  Liverpool: { bg: "#C8102E", text: "#FFFFFF", initials: "LIV" },
  "Real Madrid": { bg: "#FEBE10", text: "#FFFFFF", initials: "RMA" },
  Chelsea: { bg: "#034694", text: "#FFFFFF", initials: "CHE" },
  "Internazionale Milano": { bg: "#003399", text: "#FFCC00", initials: "INT" },
  "Atletico Madrid": { bg: "#CE3524", text: "#FFFFFF", initials: "ATM" },
  "Tottenham Hotspur": { bg: "#132257", text: "#FFFFFF", initials: "TOT" },
  "Newcastle United": { bg: "#241F20", text: "#FFFFFF", initials: "NEW" },
  "Sporting Clube de Portugal": {
    bg: "#00A850",
    text: "#FFFFFF",
    initials: "SCP",
  },
  Juventus: { bg: "#000000", text: "#FFFFFF", initials: "JUV" },
  "Borussia Dortmund": { bg: "#FDE100", text: "#000000", initials: "BVB" },
  Atalanta: { bg: "#1C4B9C", text: "#FFFFFF", initials: "ATA" },
  "Bayer 04 Leverkusen": { bg: "#E32221", text: "#000000", initials: "B04" },
  Galatasaray: { bg: "#D4011D", text: "#FFCD00", initials: "GAL" },
  Benfica: { bg: "#CC0000", text: "#FFFFFF", initials: "SLB" },
  "Club Brugge": { bg: "#003D6E", text: "#FFCC00", initials: "BRU" },
  "Olympiacos Piraeus": { bg: "#CC2026", text: "#FFFFFF", initials: "OLY" },
  "Bodo-Glimt": { bg: "#FFCC00", text: "#000000", initials: "BOD" },
  Qarabag: { bg: "#003DA5", text: "#FFFFFF", initials: "QAR" },
  "AS Monaco": { bg: "#CC0000", text: "#FFFFFF", initials: "ASM" },
  Feyenoord: { bg: "#C8102E", text: "#FFFFFF", initials: "FEY" },
  "AC Milan": { bg: "#CC0000", text: "#000000", initials: "ACM" },
  "RB Leipzig": { bg: "#DD0741", text: "#FFFFFF", initials: "RBL" },
  "Aston Villa": { bg: "#95BFE5", text: "#720000", initials: "AVL" },
  Lille: { bg: "#B3001B", text: "#FFFFFF", initials: "LIL" },
};

const ClubBadge: React.FC<{ name: string; size?: number }> = ({
  name,
  size = 24,
}) => {
  const config = CLUB_COLORS[name] || {
    bg: "#6b7280",
    text: "#FFFFFF",
    initials: name.slice(0, 3).toUpperCase(),
  };
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: config.bg,
        color: config.text,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.28,
        fontWeight: 800,
        flexShrink: 0,
        letterSpacing: "-0.5px",
        border: "1.5px solid rgba(0,0,0,0.12)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        userSelect: "none",
      }}
    >
      {config.initials}
    </div>
  );
};

// ─── Data ─────────────────────────────────────────────────────────────────────

interface OutrightOdds {
  reachFinalYes?: number | null;
  reachFinalNo?: number | null;
  winnerYes?: number | null;
  winnerNo1?: number | null;
  winnerNo2?: number | null;
}

interface TeamOdds {
  team: string;
  odds: OutrightOdds;
}

interface Tournament {
  id: string;
  name: string;
  sport: string;
  count?: number;
}

// UEFA Champions League outright winner market
const UCL_TEAMS: TeamOdds[] = [
  {
    team: "Arsenal",
    odds: {
      reachFinalYes: 2.75,
      reachFinalNo: null,
      winnerYes: 4.5,
      winnerNo1: null,
      winnerNo2: 1.157,
    },
  },
  {
    team: "Bayern Munich",
    odds: {
      reachFinalYes: 3,
      reachFinalNo: null,
      winnerYes: 5.55,
      winnerNo1: null,
      winnerNo2: 1.103,
    },
  },
  {
    team: "Manchester City",
    odds: {
      reachFinalYes: 4,
      reachFinalNo: null,
      winnerYes: 8.1,
      winnerNo1: null,
      winnerNo2: 1.038,
    },
  },
  {
    team: "Barcelona",
    odds: {
      reachFinalYes: 4,
      reachFinalNo: null,
      winnerYes: 8.1,
      winnerNo1: null,
      winnerNo2: 1.038,
    },
  },
  {
    team: "Paris Saint-Germain",
    odds: {
      reachFinalYes: 4.5,
      reachFinalNo: null,
      winnerYes: 9.5,
      winnerNo1: null,
      winnerNo2: 1.019,
    },
  },
  {
    team: "Liverpool",
    odds: {
      reachFinalYes: 5.5,
      reachFinalNo: null,
      winnerYes: 10.2,
      winnerNo1: null,
      winnerNo2: 1.011,
    },
  },
  {
    team: "Real Madrid",
    odds: {
      reachFinalYes: 6.5,
      reachFinalNo: null,
      winnerYes: 12,
      winnerNo1: null,
      winnerNo2: null,
    },
  },
  {
    team: "Chelsea",
    odds: {
      reachFinalYes: 9,
      reachFinalNo: null,
      winnerYes: 17.5,
      winnerNo1: null,
      winnerNo2: null,
    },
  },
  {
    team: "Internazionale Milano",
    odds: {
      reachFinalYes: 13,
      reachFinalNo: null,
      winnerYes: 30,
      winnerNo1: null,
      winnerNo2: null,
    },
  },
  {
    team: "Atletico Madrid",
    odds: {
      reachFinalYes: 19,
      reachFinalNo: null,
      winnerYes: 34,
      winnerNo1: null,
      winnerNo2: null,
    },
  },
  {
    team: "Tottenham Hotspur",
    odds: {
      reachFinalYes: 15,
      reachFinalNo: null,
      winnerYes: 35,
      winnerNo1: null,
      winnerNo2: null,
    },
  },
  {
    team: "Newcastle United",
    odds: {
      reachFinalYes: 19,
      reachFinalNo: null,
      winnerYes: 41,
      winnerNo1: null,
      winnerNo2: null,
    },
  },
  {
    team: "Sporting Clube de Portugal",
    odds: {
      reachFinalYes: 34,
      reachFinalNo: null,
      winnerYes: 55,
      winnerNo1: null,
      winnerNo2: null,
    },
  },
  {
    team: "Juventus",
    odds: {
      reachFinalYes: 34,
      reachFinalNo: null,
      winnerYes: 65,
      winnerNo1: null,
      winnerNo2: null,
    },
  },
  {
    team: "Borussia Dortmund",
    odds: {
      reachFinalYes: 34,
      reachFinalNo: null,
      winnerYes: 75,
      winnerNo1: null,
      winnerNo2: null,
    },
  },
  {
    team: "Atalanta",
    odds: {
      reachFinalYes: 41,
      reachFinalNo: null,
      winnerYes: 80,
      winnerNo1: null,
      winnerNo2: null,
    },
  },
  {
    team: "Bayer 04 Leverkusen",
    odds: {
      reachFinalYes: 41,
      reachFinalNo: null,
      winnerYes: 85,
      winnerNo1: null,
      winnerNo2: null,
    },
  },
  {
    team: "Galatasaray",
    odds: {
      reachFinalYes: 65,
      reachFinalNo: null,
      winnerYes: 100,
      winnerNo1: null,
      winnerNo2: null,
    },
  },
  {
    team: "Benfica",
    odds: {
      reachFinalYes: 80,
      reachFinalNo: null,
      winnerYes: 100,
      winnerNo1: null,
      winnerNo2: null,
    },
  },
  {
    team: "Club Brugge",
    odds: {
      reachFinalYes: 100,
      reachFinalNo: null,
      winnerYes: 100,
      winnerNo1: null,
      winnerNo2: null,
    },
  },
  {
    team: "Olympiacos Piraeus",
    odds: {
      reachFinalYes: 100,
      reachFinalNo: null,
      winnerYes: 100,
      winnerNo1: null,
      winnerNo2: null,
    },
  },
  {
    team: "Bodo-Glimt",
    odds: {
      reachFinalYes: 100,
      reachFinalNo: null,
      winnerYes: 100,
      winnerNo1: null,
      winnerNo2: null,
    },
  },
  {
    team: "Qarabag",
    odds: {
      reachFinalYes: 100,
      reachFinalNo: null,
      winnerYes: 100,
      winnerNo1: null,
      winnerNo2: null,
    },
  },
  {
    team: "AS Monaco",
    odds: {
      reachFinalYes: 50,
      reachFinalNo: null,
      winnerYes: 100,
      winnerNo1: null,
      winnerNo2: null,
    },
  },
];

export type TournamentKey =
  | "ucl"
  | "uel"
  | "uecl"
  | "epl"
  | "bundesliga"
  | "laliga"
  | "seriea"
  | "rpl"
  | "ligue1";

export const TOURNAMENT_DATA: Record<
  TournamentKey,
  { title: string; teams: TeamOdds[] }
> = {
  ucl: {
    title: "Football. UEFA Champions League. 2025/26. Winner",
    teams: UCL_TEAMS,
  },
  uel: {
    title: "Football. UEFA Europa League. 2025/26. Winner",
    teams: [
      {
        team: "AC Milan",
        odds: { reachFinalYes: 2.5, winnerYes: 5, winnerNo2: 1.25 },
      },
      {
        team: "Manchester United",
        odds: { reachFinalYes: 3, winnerYes: 7, winnerNo2: 1.12 },
      },
      {
        team: "Roma",
        odds: { reachFinalYes: 4, winnerYes: 9, winnerNo2: 1.05 },
      },
      {
        team: "Feyenoord",
        odds: { reachFinalYes: 5, winnerYes: 11, winnerNo2: 1.03 },
      },
    ],
  },
  uecl: {
    title: "Football. UEFA Europa Conference League. 2025/26. Winner",
    teams: [
      {
        team: "Aston Villa",
        odds: { reachFinalYes: 3, winnerYes: 6, winnerNo2: 1.18 },
      },
      {
        team: "Lille",
        odds: { reachFinalYes: 4, winnerYes: 9, winnerNo2: 1.07 },
      },
    ],
  },
  epl: {
    title: "Football. England. Premier League. 2025/26. Winner",
    teams: [
      {
        team: "Liverpool",
        odds: { reachFinalYes: 1.5, winnerYes: 2.2, winnerNo2: 1.55 },
      },
      {
        team: "Arsenal",
        odds: { reachFinalYes: 2.8, winnerYes: 3.5, winnerNo2: 1.28 },
      },
      {
        team: "Manchester City",
        odds: { reachFinalYes: 3.2, winnerYes: 5, winnerNo2: 1.18 },
      },
      {
        team: "Chelsea",
        odds: { reachFinalYes: 6, winnerYes: 9, winnerNo2: 1.07 },
      },
      {
        team: "Tottenham Hotspur",
        odds: { reachFinalYes: 9, winnerYes: 15, winnerNo2: 1.03 },
      },
      {
        team: "Newcastle United",
        odds: { reachFinalYes: 12, winnerYes: 19, winnerNo2: 1.03 },
      },
    ],
  },
  bundesliga: {
    title: "Football. Germany. Bundesliga. 2025/26. Winner",
    teams: [
      {
        team: "Bayern Munich",
        odds: { reachFinalYes: 1.4, winnerYes: 1.8, winnerNo2: 1.65 },
      },
      {
        team: "Borussia Dortmund",
        odds: { reachFinalYes: 4, winnerYes: 7, winnerNo2: 1.12 },
      },
      {
        team: "RB Leipzig",
        odds: { reachFinalYes: 5, winnerYes: 10, winnerNo2: 1.04 },
      },
      {
        team: "Bayer 04 Leverkusen",
        odds: { reachFinalYes: 5, winnerYes: 10, winnerNo2: 1.04 },
      },
    ],
  },
  laliga: {
    title: "Football. Spain. La Liga. 2025/26. Winner",
    teams: [
      {
        team: "Real Madrid",
        odds: { reachFinalYes: 1.7, winnerYes: 2.5, winnerNo2: 1.48 },
      },
      {
        team: "Barcelona",
        odds: { reachFinalYes: 2.2, winnerYes: 3.5, winnerNo2: 1.29 },
      },
      {
        team: "Atletico Madrid",
        odds: { reachFinalYes: 5, winnerYes: 9, winnerNo2: 1.07 },
      },
    ],
  },
  seriea: {
    title: "Football. Italy. Serie A. 2025/26. Winner",
    teams: [
      {
        team: "Internazionale Milano",
        odds: { reachFinalYes: 2, winnerYes: 3, winnerNo2: 1.42 },
      },
      {
        team: "Juventus",
        odds: { reachFinalYes: 3, winnerYes: 6, winnerNo2: 1.16 },
      },
      {
        team: "AC Milan",
        odds: { reachFinalYes: 4, winnerYes: 9, winnerNo2: 1.09 },
      },
      {
        team: "Atalanta",
        odds: { reachFinalYes: 5, winnerYes: 11, winnerNo2: 1.04 },
      },
    ],
  },
  rpl: {
    title: "Football. Russia. Premier League. 2025/26. Winner",
    teams: [
      {
        team: "CSKA Moscow",
        odds: { reachFinalYes: 2, winnerYes: 3.5, winnerNo2: 1.38 },
      },
      {
        team: "Spartak Moscow",
        odds: { reachFinalYes: 2.5, winnerYes: 5, winnerNo2: 1.22 },
      },
    ],
  },
  ligue1: {
    title: "Football. France. Ligue 1. 2025/26. Winner",
    teams: [
      {
        team: "Paris Saint-Germain",
        odds: { reachFinalYes: 1.2, winnerYes: 1.5, winnerNo2: 1.82 },
      },
      {
        team: "Lille",
        odds: { reachFinalYes: 5, winnerYes: 10, winnerNo2: 1.04 },
      },
      {
        team: "AS Monaco",
        odds: { reachFinalYes: 5, winnerYes: 11, winnerNo2: 1.04 },
      },
    ],
  },
};

export const LEFT_COMPETITIONS: Array<{
  id: TournamentKey;
  label: string;
  flag: string;
}> = [
  { id: "ucl", label: "UEFA Champions League. 2025/26. Winner", flag: "⭐" },
  { id: "uel", label: "UEFA Europa League. 2025/26. Winner", flag: "🟠" },
  {
    id: "uecl",
    label: "UEFA Europa Conference League. 2025/26. Winner",
    flag: "🟢",
  },
  { id: "epl", label: "England. Premier League. 2025/26. Winner", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  {
    id: "bundesliga",
    label: "Germany. Bundesliga. 2025/26. Winner",
    flag: "🇩🇪",
  },
  { id: "laliga", label: "Spain. La Liga. 2025/26. Winner", flag: "🇪🇸" },
  { id: "seriea", label: "Italy. Serie A. 2025/26. Winner", flag: "🇮🇹" },
  { id: "rpl", label: "Russia. Premier League. 2025/26. Winner", flag: "🇷🇺" },
  { id: "ligue1", label: "France. Ligue 1. 2025/26. Winner", flag: "🇫🇷" },
];

export const SIDE_SPORTS = [
  { label: "Ice Hockey", count: null },
  { label: "Cricket", count: null },
];

// ─── Odds Cell ────────────────────────────────────────────────────────────────

const OddsBtn: React.FC<{ value: number | null | undefined }> = ({ value }) => {
  const [active, setActive] = useState(false);
  if (value === null || value === undefined) {
    return (
      <div className="w-16 h-7 rounded bg-bg-light-blue flex items-center justify-center text-neutral-gray-600 text-xs">
        -
      </div>
    );
  }
  return (
    <button
      onClick={() => setActive((a) => !a)}
      className={`w-16 h-7 rounded text-xs font-semibold transition-all
                ${
                  active
                    ? "bg-accent-yellow text-brand-text shadow-inner"
                    : "bg-bg-light-blue hover:bg-brand-primary/10 hover:text-brand-primary dark:hover:text-brand-text text-brand-text"
                }`}
    >
      {value % 1 === 0 ? value : value.toFixed(3)}
    </button>
  );
};

// ─── Right Bet Slip ────────────────────────────────────────────────────────────

const BetSlipPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"betslip" | "mybets">("betslip");
  const [oneClick, setOneClick] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className="w-8 flex-shrink-0 bg-brand-primary flex flex-col items-center pt-2">
        <button
          onClick={() => setCollapsed(false)}
          className="text-brand-text text-[10px] vertical-rl transform rotate-180 hover:text-brand-blue-300 transition-colors whitespace-nowrap"
          style={{ writingMode: "vertical-rl" }}
        >
          ◀ Expand block
        </button>
      </div>
    );
  }

  return (
    <div className="w-[280px] flex-shrink-0 bg-bg-card border-l border-stroke-light flex flex-col overflow-y-auto">
      {/* Collapse button */}
      <div className="bg-bg-light-blue border-b border-stroke-light px-2 py-1 flex justify-end">
        <button
          onClick={() => setCollapsed(true)}
          className="text-[10px] text-neutral-gray-700 hover:text-brand-text font-semibold flex items-center gap-1"
        >
          Collapse block ▶
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stroke-light">
        <button
          onClick={() => setActiveTab("betslip")}
          className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors
                        ${activeTab === "betslip" ? "border-accent-green text-brand-text" : "border-transparent text-neutral-gray-700 hover:text-brand-text"}`}
        >
          Bet slip
        </button>
        <button
          onClick={() => setActiveTab("mybets")}
          className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors
                        ${activeTab === "mybets" ? "border-accent-green text-brand-text" : "border-transparent text-neutral-gray-700 hover:text-brand-text"}`}
        >
          My bets
        </button>
      </div>

      {activeTab === "betslip" && (
        <>
          {/* Your Bets */}
          <div className="bg-bg-white border-b border-stroke-light px-3 py-1.5 flex items-center justify-between">
            <span className="text-[10px] font-bold text-brand-text uppercase">
              Your Bets
            </span>
            <button className="text-neutral-gray-600 hover:text-accent-red transition-colors">
              <FiX className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Empty state */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 text-center">
            <p className="text-xs text-neutral-gray-700 leading-relaxed">
              Your bet slip is empty. Find an event you're interested in and
              press the odds to add it to your bet slip.
            </p>
          </div>

          {/* One-click bet toggle */}
          <div className="border-t border-stroke-light px-3 py-2 flex items-center justify-between">
            <span className="text-xs text-brand-text font-semibold">
              ONE-CLICK BET?
            </span>
            <button
              onClick={() => setOneClick((v) => !v)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors
                                ${oneClick ? "bg-brand-primary" : "bg-neutral-gray-300"}`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform
                                ${oneClick ? "translate-x-4" : "translate-x-1"}`}
              />
            </button>
          </div>
          <div className="px-3 pb-2">
            <button className="text-[10px] text-neutral-gray-700 hover:text-brand-text hover:underline">
              Save/load events ▾
            </button>
          </div>

          {/* Bet Slip Sale */}
          <div className="px-3 pb-3 border-b border-stroke-light">
            <button className="w-full py-2 bg-brand-primary text-brand-text text-xs font-bold rounded hover:bg-brand-primary-light transition-colors tracking-wide uppercase">
              BET SLIP SALE
            </button>
          </div>

          {/* Card game options */}
          <div className="border-b border-stroke-light">
            <button className="w-full flex items-center justify-between px-3 py-2.5 text-xs text-brand-text hover:bg-bg-light-blue transition-colors">
              <span className="flex items-center gap-2">
                <span className="text-base">🃏</span>
                <span>Card game "21"</span>
              </span>
              <FiChevronDown className="w-3.5 h-3.5 text-neutral-gray-600" />
            </button>
            <button className="w-full flex items-center justify-between px-3 py-2.5 text-xs text-brand-text hover:bg-bg-light-blue transition-colors">
              <span className="flex items-center gap-2">
                <span className="text-base">🍎</span>
                <span>Apple Of Fortune</span>
              </span>
              <FiChevronDown className="w-3.5 h-3.5 text-neutral-gray-600" />
            </button>
          </div>

          {/* Bonus Account */}
          <div className="mx-3 my-3 rounded-lg overflow-hidden border border-brand-blue-200 bg-cta-gradient text-brand-text p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wide">
                  Bonus Account
                </p>
                <p className="text-[10px] mt-1 opacity-90 leading-relaxed">
                  Activate your bonus in My Account!
                </p>
                <a
                  href="#"
                  className="text-[10px] underline opacity-80 hover:opacity-100"
                >
                  Find out more
                </a>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 ml-2">
                <MdStar className="w-4 h-4 text-accent-yellow" />
              </div>
            </div>
            <button className="mt-2 w-full py-1.5 bg-brand-primary-light text-brand-text text-xs font-bold rounded hover:bg-brand-primary transition-colors uppercase tracking-wide">
              ACTIVATE
            </button>
          </div>

          {/* App Download */}
          <div className="mx-3 mb-3 rounded-lg border border-stroke-light overflow-hidden">
            <div className="bg-brand-primary flex items-center justify-between px-2 py-1">
              <div className="flex gap-2">
                <button className="text-brand-text text-[10px] font-semibold border-b border-white pb-0.5">
                  🤖 Android
                </button>
                <button className="text-brand-blue-300 text-[10px] font-semibold">
                  🍎 iOS
                </button>
              </div>
              <button className="text-neutral-gray-600 hover:text-brand-text">
                <FiX className="w-3 h-3" />
              </button>
            </div>
            <div className="p-2 flex gap-2 items-center bg-bg-card">
              <div className="w-14 h-14 bg-bg-light-blue border border-stroke-light rounded flex items-center justify-center flex-shrink-0">
                {/* QR code placeholder */}
                <div className="grid grid-cols-4 gap-0.5">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-sm ${Math.random() > 0.4 ? "bg-neutral-gray-800" : "bg-white"}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-neutral-gray-800">
                  1XBET
                </p>
                <p className="text-[9px] text-neutral-gray-700">
                  MOBILE APPLICATION
                </p>
                <button className="mt-1 flex items-center gap-1 text-[9px] text-accent-green hover:underline">
                  <BsPhone className="w-3 h-3" />
                  Free download
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "mybets" && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 text-center">
          <p className="text-xs text-neutral-gray-700">You have no bets yet.</p>
        </div>
      )}
    </div>
  );
};

// ─── Main Content ─────────────────────────────────────────────────────────────

const MainContent: React.FC<{ tournament: TournamentKey }> = ({
  tournament,
}) => {
  const data = TOURNAMENT_DATA[tournament];

  return (
    <div className="flex-1 min-w-0 overflow-y-auto bg-bg-card rounded-lg">
      {/* Breadcrumb header */}
      <div className="bg-brand-primary border-b border-stroke-light px-4 py-2">
        <h1 className="text-xs font-bold text-neutral-gray-100">
          {data.title}
        </h1>
      </div>

      {/* Table header */}
      <div className="border-b border-stroke-light">
        {/* Top Header Row */}
        <div className="flex items-center bg-brand-primary px-4 py-2">
          {/* Team */}
          <div className="flex-1 text-[10px] font-bold text-neutral-gray-100 uppercase">
            Team
          </div>

          {/* To Reach Final */}
          <div className="w-16 text-center text-[9px] font-semibold text-neutral-gray-100">
            To reach final
          </div>

          {/* Winner (spans 2 columns) */}
          <div className="w-32 text-center text-[9px] font-semibold text-neutral-gray-100">
            Winner
          </div>
        </div>

        {/* Second Row (Sub Columns) */}
        <div className="flex items-center mt-1 px-2 py-2">
          {/* Empty space under Team */}
          <div className="flex-1" />

          {/* To Reach Final → Yes */}
          <div className="w-16 text-center text-[10px] font-semibold text-neutral-gray-900">
            Yes
          </div>

          {/* Winner → Yes */}
          <div className="w-16 text-center text-[10px] font-semibold text-neutral-gray-900">
            Yes
          </div>

          {/* Winner → No */}
          <div className="w-16 text-center text-[10px] font-semibold text-neutral-gray-900">
            No
          </div>
        </div>
      </div>

      {/* Team rows */}
      {data.teams.map((row, idx) => (
        <div
          key={row.team}
          className={`flex items-center px-4 py-2.5 border-b border-stroke-light hover:bg-bg-light-blue transition-colors group
                        ${idx % 2 === 1 ? "bg-bg-light-blue" : "bg-bg-card"}`}
        >
          {/* Team */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <ClubBadge name={row.team} size={28} />
            <span className="text-xs text-neutral-gray-800 font-medium truncate group-hover:text-brand-primary dark:group-hover:text-brand-text transition-colors">
              {row.team}
            </span>
          </div>
          {/* 3 odds cells: reach final (yes) | winner (yes) | winner (no) */}
          <div className="flex items-center gap-1 ml-2">
            <OddsBtn value={row.odds.reachFinalYes} />
            <OddsBtn value={row.odds.winnerYes} />
            <OddsBtn value={row.odds.winnerNo2} />
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Football Page ────────────────────────────────────────────────────────────

import { useSearchParams } from "react-router-dom";

const FootballPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const activeTournament =
    (searchParams.get("tournament") as TournamentKey) || "ucl";

  return (
    <div className="flex h-[calc(100vh-theme(spacing.12))] overflow-hidden bg-bg-light-blue">
      {/* Main content */}
      <MainContent tournament={activeTournament} />

      {/* Right bet slip */}
      <BetSlipPanel />
    </div>
  );
};

export default FootballPage;
