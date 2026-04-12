import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FiChevronRight } from "react-icons/fi";

import { bettingApi } from "../../api/bettingClient";
import { casinoApi, bannerApi } from "../../api/client";
import { useBettingStore } from "../../store/bettingStore";
import type { CasinoRawGame } from "../../types/casino";

import HeroBanner from "../Common/HeroBanner";
import Loader from "../Common/Loader";
import LiveTicker from "../Common/LiveTicker";
import PromoBannerSection from "../Common/PromoBannerSection";
import ProviderList from "../Common/ProviderList";
import RecommendedGameSection from "../Common/RecommendedGameSection";
import MobileSubMenu from "../Header/MobileSubMenu";
import EventMatchCard from "../shared/EventMatchCard";
import SportsEventsSection from "../shared/SportsEventsSection";
import PopularSports from "./PopularSports";
export type Game = CasinoRawGame;

export const SPORT_META: Record<
  string,
  { icon: string; path: string; gradient: string }
> = {
  Cricket: {
    icon: "🏏",
    path: "/cricket",
    gradient: "linear-gradient(135deg, #1a6b3a 0%, #0d4a28 100%)",
  },
  Football: {
    icon: "⚽",
    path: "/football",
    gradient: "linear-gradient(135deg, #1a3a6b 0%, #0d2048 100%)",
  },
  Soccer: {
    icon: "⚽",
    path: "/soccer",
    gradient: "linear-gradient(135deg, #1a3a6b 0%, #0d2048 100%)",
  },
  Tennis: {
    icon: "🎾",
    path: "/tennis",
    gradient: "linear-gradient(135deg, #7b6a00 0%, #4a4000 100%)",
  },
  Hockey: {
    icon: "🏒",
    path: "/hockey",
    gradient: "linear-gradient(135deg, #2d1a6b 0%, #1a0d48 100%)",
  },
  "Horse Racing": {
    icon: "🐎",
    path: "/horse-racing",
    gradient: "linear-gradient(135deg, #6b1a3a 0%, #480d25 100%)",
  },
  Election: {
    icon: "🗳️",
    path: "/election",
    gradient: "linear-gradient(135deg, #6b3a1a 0%, #482008 100%)",
  },
  "Greyhound Racing": {
    icon: "🐕",
    path: "/horse-racing",
    gradient: "linear-gradient(135deg, #3a6b1a 0%, #254800 100%)",
  },
  Kabaddi: {
    icon: "🤼",
    path: "/sports",
    gradient: "linear-gradient(135deg, #6b1a1a 0%, #480d0d 100%)",
  },
};

export const LIVE_CARD = {
  name: "In-Play",
  icon: "🔴",
  path: "/betting",
  gradient: "linear-gradient(135deg, #c0392b 0%, #7b1a14 100%)",
};

// LiveMatchCard replaced by shared EventMatchCard — imported above

const MainContent: React.FC = () => {
  const navigate = useNavigate();
  // Betting sports section state — sports from shared store
  const bettingSports = useBettingStore((s) => s.sports);
  const liveEvents = useBettingStore((s) => s.liveEvents);
  const [activeSportId, setActiveSportId] = useState<string | null>(null); // null = live
  const [sportEvents, setSportEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Banners State
  const [generalBanners, setGeneralBanners] = useState<any[]>([]);
  const [loadingGeneralBanners, setLoadingGeneralBanners] = useState(true);

  // Game States
  const [trendingGames, setTrendingGames] = useState<CasinoRawGame[]>([]);
  const [topGames, setTopGames] = useState<CasinoRawGame[]>([]);
  const [recommendedGames, setRecommendedGames] = useState<CasinoRawGame[]>([]);
  const [newGames, setNewGames] = useState<CasinoRawGame[]>([]);
  const [allGames, setAllGames] = useState<CasinoRawGame[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);

  // Helper to flatten categories into a game list
  const flattenGames = (categories: any): CasinoRawGame[] => {
    if (!Array.isArray(categories)) return [];
    return categories.flatMap((cat: any) =>
      (cat?.games || []).map((game: any) => ({
        id: game.game_id || game.game_code || game.id || "",
        title: game.game_name || game.title || game.name || "",
        image: game.url_thumb || game.image || game.thumbnail || "",
        provider: game.provider_name || game.provider || "",
        game_name: game.game_name,
        provider_name: game.provider_name,
        url_thumb: game.url_thumb,
      })),
    );
  };

  useEffect(() => {
    const fetchGames = async () => {
      setLoadingGames(true);
      try {
        const [trending, top, recommended, newItem, all] =
          await Promise.allSettled([
            casinoApi.getFranchiseCategoriesWithGames({
              include_games: true,
              default_category: "trending_games",
            }),
            casinoApi.getFranchiseCategoriesWithGames({
              include_games: true,
              default_category: "top_games",
            }),
            casinoApi.getFranchiseCategoriesWithGames({
              include_games: true,
              default_category: "middle_games",
            }),
            casinoApi.getFranchiseCategoriesWithGames({
              include_games: true,
              default_category: "bottom_games",
            }),
            casinoApi.getFranchiseCategoriesWithGames({ include_games: true }),
          ]);

        const cats = (v: any) =>
          v?.data?.categories ||
          v?.categories ||
          (Array.isArray(v?.data) ? v.data : []);
        if (trending.status === "fulfilled")
          setTrendingGames(flattenGames(cats(trending.value)));
        if (top.status === "fulfilled")
          setTopGames(flattenGames(cats(top.value)));
        if (recommended.status === "fulfilled")
          setRecommendedGames(flattenGames(cats(recommended.value)));
        if (newItem.status === "fulfilled")
          setNewGames(flattenGames(cats(newItem.value)));
        if (all.status === "fulfilled")
          setAllGames(flattenGames(cats(all.value)));
      } catch (error) {
        console.error("[MainContent] games fetch failed:", error);
        setLoadingGames(false);
      }
    };

    const fetchBanners = async () => {
      setLoadingGeneralBanners(true);
      try {
        const res: any = await bannerApi.getBannersByType("general");
        const b = res?.data?.banners || res?.data || [];
        if (Array.isArray(b)) setGeneralBanners(b);
      } catch (error) {
        console.error("[MainContent] banners fetch failed:", error);
        setLoadingGeneralBanners(false);
      }
    };

    fetchGames();
    fetchBanners();
  }, []);

  const handleGameClick = (game: CasinoRawGame) => {
    const gameId = game.id;

    if (gameId === "01") {
      navigate("/aura-casino-game");
    } else {
      localStorage.setItem("gameId", gameId);
      navigate(`/dream-casino-game`);
    }
  };

  const SPORT_ICONS: Record<string, string> = {
    Cricket: "🏏",
    Football: "⚽",
    Tennis: "🎾",
    Soccer: "⚽",
    Hockey: "🏒",
  };

  // Auto-select first sport once sports load from the shared store
  const displaySports = bettingSports.length > 0 ? bettingSports : [];

  useEffect(() => {
    if (displaySports.length > 0 && activeSportId === null) {
      setActiveSportId(String(displaySports[0].sportId));
    }
  }, [displaySports]);

  useEffect(() => {
    if (!activeSportId) return;
    setEventsLoading(true);
    bettingApi
      .getEventsBySport(activeSportId)
      .then((res: any) => {
        const list = res?.data || res || [];
        const filtered = Array.isArray(list)
          ? list.filter((e: any) => !e.isGameOver)
          : [];
        setSportEvents(filtered);
      })
      .catch((error) => {
        console.error("Failed to fetch events:", error);
        setSportEvents([]);
      })
      .finally(() => setEventsLoading(false));
  }, [activeSportId]);

  const renderPariMatchCard = (event: any) => {
    const teamNames = event.name.split(/ v | vs /i);
    const team1 = teamNames[0]?.trim() || event.name;
    const team2 = teamNames[1]?.trim() || "";

    const isLive = !!(
      event.isInPlay ||
      event.matchStatus === "LIVE" ||
      event.matchStatus === "in_play"
    );

    // Format date like "APR 01, 19:30"
    let timeLabel = "";
    if (event.startTime) {
      const d = new Date(event.startTime);
      const isToday = new Date().toDateString() === d.toDateString();
      const monthDay = d
        .toLocaleDateString("en-US", { month: "short", day: "2-digit" })
        .toUpperCase();
      const timeStr = d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      timeLabel = isToday ? `TODAY, ${timeStr}` : `${monthDay}, ${timeStr}`;
    }

    const runners = event.matchOdds?.runners || [];

    return (
      <div
        key={event.eventId}
        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-bg-card cursor-pointer"
        onClick={() => navigate(`/betting/event/${event.eventId}`)}
      >
        {/* Left Side: Time, Teams */}
        <div className="flex-1 flex flex-col gap-1.5 mb-4 sm:mb-0">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-gray-500 uppercase tracking-wide">
            {isLive ? (
              <span className="flex items-center gap-1 text-accent-red font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-red animate-pulse" />
                In-Play
              </span>
            ) : (
              <span>{timeLabel}</span>
            )}
            <span className="text-brand-primary text-sm flex items-center">
              📊
            </span>
          </div>

          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-center gap-3">
              {/* Fake jersey icon as placeholder since backend doesn't have it */}
              <span className="w-4 h-4 rounded text-xs flex items-center justify-center bg-accent-red/20 text-transparent border border-accent-red/50">
                👕
              </span>
              <span className="text-[13px] font-semibold text-brand-text">
                {team1}
              </span>
            </div>
            {team2 && (
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded text-xs flex items-center justify-center bg-accent-yellow/20 text-transparent border border-accent-yellow/50">
                  👕
                </span>
                <span className="text-[13px] font-semibold text-brand-text">
                  {team2}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Odds and Star */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          {runners.slice(0, 3).map((runner: any, idx: number) => {
            const label =
              idx === 0 ? "1" : idx === 1 && runners.length === 3 ? "X" : "2";
            return (
              <button
                key={idx}
                className="flex flex-col items-center justify-center w-[105px] sm:w-[135px] h-14 bg-neutral-gray-50 hover:bg-neutral-gray-200 transition-colors rounded-md border border-neutral-gray-300 hover:border-neutral-gray-300 group"
                onClick={(e) => {
                  e.stopPropagation(); /* handle bet */
                }}
              >
                <span className="text-[16px] font-bold text-accent-blue group-hover:text-brand-text transition-colors">
                  {runner?.back ? Number(runner.back).toFixed(2) : "-"}
                </span>
                <span className="text-[11px] font-semibold text-neutral-gray-500 group-hover:text-brand-text transition-colors pt-0.5">
                  {label}
                </span>
              </button>
            );
          })}
          <button
            className="p-2 text-neutral-gray-400 hover:text-accent-yellow transition-colors ml-2 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    );
  };

  const groupedEvents = sportEvents.reduce((acc: any, event: any) => {
    const league = event.league || "Other Events";
    if (!acc[league]) acc[league] = [];
    acc[league].push(event);
    return acc;
  }, {});

  return (
    <div className="w-full max-w-[1920px] mx-auto">
      <div className="space-y-0">
        <MobileSubMenu />

        {/* Hero Banner */}
        <div className="bg-bg-white">
          <HeroBanner />
        </div>
        <div className="bg-bg-white px-2 sm:px-4 lg:px-6 space-y-2">
          {(loadingGames || trendingGames.length > 0) && (
            <RecommendedGameSection
              title="Treding Games"
              games={trendingGames}
              isLoading={loadingGames}
              onGameClick={handleGameClick}
              onViewAll={() => navigate("/casino")}
            />
          )}
        </div>

        {/* Game Providers */}
        <ProviderList />
        {/* Live Match Ticker */}
        <LiveTicker />

        {/* Popular Sports Cards */}
        <PopularSports />

        {/* ── Sports / Betting Section ── */}
        <div className="bg-bg-white mt-2">
          {/* Sport tabs — populated from /demoapi/betting/sports */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide px-3 py-2">
            {displaySports.length === 0 ? (
              <span className="text-xs text-neutral-gray-600 px-2">
                Loading sports...
              </span>
            ) : (
              displaySports.map((sport: any) => (
                <button
                  key={sport.sportId}
                  onClick={() => setActiveSportId(String(sport.sportId))}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-display text-sm font-bold whitespace-nowrap shrink-0 transition-all ${
                    String(sport.sportId) === activeSportId
                      ? "bg-neutral-gray-50 text-brand-text shadow-sm"
                      : "text-neutral-gray-700 hover:bg-bg-light-blue"
                  }`}
                >
                  <span className="text-lg leading-none">
                    {SPORT_ICONS[sport.name] ?? "🏆"}
                  </span>
                  {sport.name}
                </button>
              ))
            )}
          </div>

          {/* Events structured by League */}
          <div className="bg-brand-primary-dark flex flex-col pt-1 pb-4">
            {eventsLoading ? (
              <Loader text="Loading events..." />
            ) : sportEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <span className="text-4xl">📡</span>
                <p className="text-neutral-gray-700 text-md">
                  {activeSportId === null
                    ? "No live events right now"
                    : "No events found for this sport"}
                </p>
              </div>
            ) : (
              Object.entries(groupedEvents).map(([leagueName, events]: any) => (
                <div
                  key={leagueName}
                  className="mb-0 last:border-0 object-cover"
                >
                  {/* League Header */}
                  <div className="px-4 py-3 text-[12px] font-medium text-neutral-gray-600 bg-bg-secondary">
                    {leagueName}{" "}
                    {displaySports.find(
                      (s: any) => String(s.sportId) === String(activeSportId),
                    )?.name || ""}
                  </div>
                  {/* Events mapped inside this league */}
                  <div className="flex flex-col">
                    {events.map((event: any) => renderPariMatchCard(event))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cricket Events — fetches from sports/4/events automatically */}
        <SportsEventsSection sportId={4} />
        <SportsEventsSection sportId={1} />

        {/* Casino Game Sections */}
        <div className="bg-bg-white px-3 sm:px-4 lg:px-6 space-y-2">
          {(loadingGames || topGames.length > 0) && (
            <RecommendedGameSection
              title="Top Games"
              games={topGames}
              isLoading={loadingGames}
              onGameClick={handleGameClick}
              onViewAll={() => navigate("/casino")}
            />
          )}
        </div>

        {/* Promo Banner Section (middone / middtwo / middthree) */}
        <div className="bg-bg-white">
          <PromoBannerSection />
        </div>

        {/* General Banner (mid-page carousel) */}
        {generalBanners.length > 0 && (
          <div className="bg-bg-white px-3 sm:px-4 lg:px-6 py-3">
            <HeroBanner type="general" staticBanners={generalBanners} />
          </div>
        )}

        {/* Casino Game Sections (continued) */}
        <div className="bg-bg-white px-3 sm:px-4 lg:px-6 space-y-2">
          {(loadingGames || trendingGames.length > 0) && (
            <RecommendedGameSection
              title="Recommended Games"
              games={trendingGames}
              isLoading={loadingGames}
              onGameClick={handleGameClick}
              onViewAll={() => navigate("/casino")}
            />
          )}
        </div>

        {/* Casino Game Sections */}
        <div className="bg-bg-white px-3 sm:px-4 lg:px-6 space-y-2">
          {(loadingGames || newGames.length > 0) && (
            <RecommendedGameSection
              title="New Games"
              games={newGames}
              isLoading={loadingGames}
              onGameClick={handleGameClick}
              onViewAll={() => navigate("/casino")}
            />
          )}
          {!loadingGames && allGames.length > 0 && (
            <RecommendedGameSection
              title="All Games"
              games={allGames}
              isLoading={false}
              onGameClick={handleGameClick}
              onViewAll={() => navigate("/casino")}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MainContent;
