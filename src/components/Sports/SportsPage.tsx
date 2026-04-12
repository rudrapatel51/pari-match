import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sportsApi } from "../../api/client";
import Loader from "../Common/Loader";
import {
  FiSearch,
  FiChevronDown,
  FiStar,
  FiBarChart2,
  FiList,
} from "react-icons/fi";
import { MdOutlinePushPin } from "react-icons/md";
import { BsGraphUp } from "react-icons/bs";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Odds {
  w1?: number | null;
  draw?: number | null;
  w2?: number | null;
  o?: number | null;
  it1?: number | null;
  u?: number | null;
  o2?: number | null;
  it2?: number | null;
  u2?: number | null;
  extraCount?: number;
}

interface SportsMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag?: string;
  awayFlag?: string;
  dateTime: string;
  stage?: string;
  odds: Odds;
  sport: string;
}

interface Competition {
  id: string;
  name: string;
  flag?: string;
  sport: string;
  matches: SportsMatch[];
}

// ─── Static Mock Data ─────────────────────────────────────────────────────────

// REMOVED: Mock data moved to API
// Use sportsApi.getInPlay() or sportsApi.getUpcomingCricket() instead

const VIEW_TABS = [
  "Matches",
  "Recommended",
  "1st period",
  "2nd period",
] as const;
type ViewTab = (typeof VIEW_TABS)[number];

const SPORT_TABS = [
  { label: "Cricket", icon: "✏️", slug: "Cricket" },
  { label: "Football", icon: "⚽", slug: "Football" },
  { label: "Tennis", icon: "🎾", slug: "Tennis" },
  { label: "Badminton", icon: "🏸", slug: "Badminton" },
  { label: "Kabaddi", icon: "🤺", slug: "Kabaddi" },
  { label: "Golf", icon: "⛳", slug: "Golf" },
  { label: "Polybet", icon: "", slug: "Polybet" },
];

const COLUMN_HEADERS = ["1", "X", "2", "O", "IT1", "U", "O", "IT2", "U"];
const MONTHS = [
  "Jan",
  "Feb",
  "March",
  "April",
  "May",
  "June",
  "July",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const REGIONS = [
  "India",
  "Global",
  "Australia",
  "England",
  "Pakistan",
  "Sri Lanka",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtOdds = (v: number | null | undefined): string => {
  if (v === null || v === undefined) return "-";
  return v.toFixed(v % 1 === 0 ? 0 : 3);
};

const formatDateLabel = (dateKey: string): string => {
  // dateKey = "DD/MM", e.g. "06/02"
  const parts = dateKey.split("/");
  if (parts.length < 2) return dateKey;
  const day = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const month = MONTHS[monthIdx] || parts[1];
  return `${day} ${month}`;
};

// ─── OddsCell ─────────────────────────────────────────────────────────────────

const OddsCell: React.FC<{
  value: number | null | undefined;
  highlight?: boolean;
}> = ({ value, highlight }) => {
  const hasValue = value !== null && value !== undefined;
  return (
    <div
      className={`flex items-center justify-center rounded text-xs font-semibold transition-colors select-none min-w-[48px] h-7 px-1
                ${
                  hasValue
                    ? highlight
                      ? "bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 cursor-pointer"
                      : "bg-bg-light-blue text-brand-text hover:bg-brand-primary/10 hover:text-brand-primary dark:hover:text-brand-text cursor-pointer"
                    : "bg-bg-light-blue text-neutral-gray-600 cursor-default"
                }`}
    >
      {fmtOdds(value)}
    </div>
  );
};

// ─── Date Separator ───────────────────────────────────────────────────────────

const DateSeparator: React.FC<{ label: string }> = ({ label }) => (
  <div className="px-3 py-1 bg-bg-light-blue border-b border-stroke-light">
    <span className="text-[11px] font-semibold text-brand-primary">
      {label}
    </span>
  </div>
);

// ─── Match Row ────────────────────────────────────────────────────────────────

const MatchRow: React.FC<{ match: SportsMatch; isAlternate?: boolean }> = ({
  match,
  isAlternate,
}) => {
  const navigate = useNavigate();
  const [pinned, setPinned] = useState(false);
  const [starred, setStarred] = useState(false);

  return (
    <div
      className={`flex items-stretch border-b border-stroke-light group cursor-pointer transition-colors
                ${isAlternate ? "bg-bg-light-blue" : "bg-bg-card"}
                hover:bg-bg-light-blue`}
      onClick={() => navigate(`/match-details/${match.id}`)}
    >
      {/* Left: Pin + Teams */}
      <div className="flex items-start gap-1.5 flex-1 min-w-0 py-1.5 px-2">
        {/* Pin */}
        <button
          className="mt-0.5 flex-shrink-0 pt-0.5"
          onClick={(e) => {
            e.stopPropagation();
            setPinned((p) => !p);
          }}
          title="Pin match"
        >
          <MdOutlinePushPin
            className={`w-3.5 h-3.5 transition-colors ${pinned ? "text-brand-primary" : "text-neutral-gray-300 hover:text-neutral-gray-700"}`}
          />
        </button>

        {/* Teams */}
        <div className="flex-1 min-w-0">
          {/* Home team */}
          <div className="flex items-center gap-1.5">
            <span className="text-sm leading-none flex-shrink-0">
              {match.homeFlag}
            </span>
            <span className="text-xs text-neutral-gray-800 truncate leading-5">
              {match.homeTeam}
            </span>
          </div>
          {/* Away team */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <button
              className="flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                setStarred((p) => !p);
              }}
              title="Favourite"
            >
              <FiStar
                className={`w-3 h-3 transition-colors ${starred ? "text-accent-yellow fill-accent-yellow" : "text-neutral-gray-300 hover:text-accent-yellow"}`}
              />
            </button>
            <span className="text-sm leading-none flex-shrink-0">
              {match.awayFlag}
            </span>
            <span className="text-xs text-neutral-gray-800 truncate leading-5">
              {match.awayTeam}
            </span>
          </div>
          {/* Date + stage + icons */}
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-neutral-gray-600 leading-none">
              {match.dateTime}
              {match.stage ? ` / ${match.stage}` : ""}
            </span>
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <FiBarChart2 className="w-3 h-3 text-neutral-gray-300 hover:text-brand-primary dark:hover:text-brand-text cursor-pointer" />
              <BsGraphUp className="w-3 h-3 text-neutral-gray-300 hover:text-brand-primary dark:hover:text-brand-text cursor-pointer" />
              <FiList className="w-3 h-3 text-neutral-gray-300 hover:text-brand-primary dark:hover:text-brand-text cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      {/* Odds columns */}
      <div
        className="flex items-center gap-1 flex-shrink-0 px-2 py-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <OddsCell value={match.odds.w1} highlight />
        <OddsCell value={match.odds.draw} />
        <OddsCell value={match.odds.w2} highlight />
        <OddsCell value={match.odds.o} />
        <OddsCell value={match.odds.it1} />
        <OddsCell value={match.odds.u} />
        <OddsCell value={match.odds.o2} />
        <OddsCell value={match.odds.it2} />
        <OddsCell value={match.odds.u2} />
        {/* +N badge */}
        <div
          className="min-w-[48px] h-7 flex items-center justify-center"
          onClick={() => navigate(`/match-details/${match.id}`)}
        >
          {match.odds.extraCount ? (
            <span className="text-[11px] font-bold text-brand-primary hover:underline cursor-pointer">
              +{match.odds.extraCount}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// ─── Competition Group ─────────────────────────────────────────────────────────

const CompetitionGroup: React.FC<{ competition: Competition }> = ({
  competition,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  // Group by date prefix  "DD/MM"
  const byDate: Record<string, SportsMatch[]> = {};
  competition.matches.forEach((m) => {
    const key = m.dateTime.split(" / ")[0];
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(m);
  });

  return (
    <div className="border-b border-stroke-light">
      {/* Competition header row */}
      <div
        className="flex items-center bg-bg-light-blue border-b border-stroke-light px-2 py-1.5 cursor-pointer select-none"
        onClick={() => setCollapsed((c) => !c)}
      >
        {/* Left: pin + flag + name */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <MdOutlinePushPin className="w-3.5 h-3.5 text-neutral-gray-600 flex-shrink-0" />
          <span className="text-sm flex-shrink-0 leading-none">
            {competition.flag}
          </span>
          <span className="text-xs font-bold text-neutral-gray-800 truncate">
            {competition.name}
          </span>
        </div>
        {/* Right: column header labels */}
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {COLUMN_HEADERS.map((h, i) => (
            <div
              key={i}
              className="min-w-[48px] text-center text-[10px] font-bold text-neutral-gray-700 uppercase"
            >
              {h}
            </div>
          ))}
          <div className="min-w-[48px] text-center text-[10px] font-bold text-neutral-gray-700">
            +1
          </div>
        </div>
      </div>

      {/* Matches grouped by date */}
      {!collapsed && (
        <>
          {Object.entries(byDate).map(([dateKey, matches]) => (
            <div key={dateKey}>
              <DateSeparator label={formatDateLabel(dateKey)} />
              {matches.map((match, idx) => (
                <MatchRow
                  key={match.id}
                  match={match}
                  isAlternate={idx % 2 === 1}
                />
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

// ─── Main SportsPage ──────────────────────────────────────────────────────────

const SportsPage: React.FC = () => {
  const [activeViewTab, setActiveViewTab] = useState<ViewTab>("Matches");
  const [activeSport, setActiveSport] = useState("Cricket");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("India");
  const [regionOpen, setRegionOpen] = useState(false);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    const loadCompetitions = async () => {
      try {
        setLoading(true);
        // Uncomment the appropriate API call based on need
        // const response = await sportsApi.getInPlay();
        // const response = await sportsApi.getUpcomingCricket();
        // setCompetitions(response?.data?.data || response?.data || []);

        // For now, show empty state until API is ready
        setCompetitions([]);
      } catch (error) {
        console.error("Failed to load competitions:", error);
        setCompetitions([]);
      } finally {
        setLoading(false);
      }
    };

    loadCompetitions();
  }, []);

  if (loading) return <Loader text="Loading sports events..." />;

  const filteredCompetitions = useMemo(() => {
    let comps = competitions.filter((c) => c.sport === activeSport);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      comps = comps
        .map((c) => ({
          ...c,
          matches: c.matches.filter(
            (m) =>
              m.homeTeam.toLowerCase().includes(q) ||
              m.awayTeam.toLowerCase().includes(q) ||
              c.name.toLowerCase().includes(q),
          ),
        }))
        .filter((c) => c.matches.length > 0);
    }
    return comps;
  }, [activeSport, searchQuery, competitions]);

  return (
    <div className="w-full min-h-screen bg-bg-primary">
      {/* ── Top bar: View tabs + Search ─────── */}
      <div className="bg-brand-primary-dark flex items-center px-2 sm:px-3 h-10 gap-0">
        <div className="flex items-center gap-0 flex-1 overflow-x-auto scrollbar-hide">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveViewTab(tab)}
              className={`px-3 sm:px-4 h-10 text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 border-b-2
                                ${
                                  activeViewTab === tab
                                    ? "text-brand-text border-white"
                                    : "text-brand-blue-300 border-transparent hover:text-brand-text"
                                }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Search */}
        <div className="flex items-center bg-white/10 hover:bg-white/20 rounded px-2.5 py-1.5 gap-1.5 flex-shrink-0 transition-colors ml-2">
          <input
            type="text"
            placeholder="Search by match"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-brand-text placeholder-brand-blue-300 outline-none w-28 sm:w-36"
          />
          <FiSearch className="w-3.5 h-3.5 text-brand-blue-300 flex-shrink-0" />
        </div>
      </div>

      {/* ── Sport sub-tabs + region ────────── */}
      <div className="bg-bg-card border-b border-stroke-light flex items-center">
        <div className="flex items-center overflow-x-auto scrollbar-hide flex-1">
          {SPORT_TABS.map((sport) => (
            <button
              key={sport.slug}
              onClick={() => setActiveSport(sport.slug)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex-shrink-0
                                ${
                                  activeSport === sport.slug
                                    ? "border-accent-green text-brand-text"
                                    : "border-transparent text-neutral-gray-600 hover:text-brand-text hover:border-accent-green/30"
                                }`}
            >
              {sport.icon && (
                <span className="text-sm leading-none">{sport.icon}</span>
              )}
              <span>{sport.label}</span>
            </button>
          ))}
          <button className="flex items-center gap-0.5 px-3 py-2.5 text-xs font-semibold text-neutral-gray-700 hover:text-brand-primary dark:hover:text-brand-text whitespace-nowrap flex-shrink-0 border-b-2 border-transparent">
            <span className="text-base leading-none">≡</span>
            <FiChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* Region dropdown */}
        <div className="relative flex-shrink-0 px-2 py-1.5">
          <button
            onClick={() => setRegionOpen((o) => !o)}
            className="flex items-center gap-1.5 bg-brand-primary text-brand-text text-xs font-semibold rounded px-3 py-1.5 hover:bg-brand-primary-light transition-colors"
          >
            <span className="text-base leading-none">🇮🇳</span>
            <span>{selectedRegion}</span>
            <FiChevronDown
              className={`w-3 h-3 transition-transform ${regionOpen ? "rotate-180" : ""}`}
            />
          </button>
          {regionOpen && (
            <div className="absolute right-0 top-full mt-1 bg-bg-card border border-stroke-light rounded shadow-elevated z-50 min-w-[130px]">
              {REGIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setSelectedRegion(r);
                    setRegionOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-bg-light-blue transition-colors
                                        ${r === selectedRegion ? "text-brand-primary font-bold" : "text-brand-text"}`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Competition + match list ────────── */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[900px]">
          {filteredCompetitions.length === 0 ? (
            <div className="text-center py-16 text-neutral-gray-700 bg-bg-card">
              <span className="text-5xl block mb-3">🏆</span>
              <p className="font-semibold text-sm">
                No events found for {activeSport}
              </p>
              <p className="text-xs mt-1">
                Try a different sport or clear your search
              </p>
            </div>
          ) : (
            filteredCompetitions.map((comp) => (
              <CompetitionGroup key={comp.id} competition={comp} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SportsPage;
