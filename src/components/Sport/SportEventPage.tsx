import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiChevronRight as FiArrow,
} from "react-icons/fi";

import { usePolling } from "../../hooks/usePolling";
import { bannerApi } from "../../api/client";
import { bettingApi } from "../../api/bettingClient";

import EventMatchCard from "../shared/EventMatchCard";
import SportsEventsSection from "../shared/SportsEventsSection";
import LeagueCompetitionCard from "../shared/LeagueCompetitionCard";
import EventCardGrid from "../shared/EventCardGrid";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SportRunner {
  runnerId: number;
  name: string;
  back: string;
  lay: string;
}

interface SportEvent {
  _id: string;
  eventId: number;
  league: string;
  leagueId: string;
  matchStatus: string;
  name: string;
  isInPlay: boolean;
  isGameOver: boolean;
  startTime: string;
  score: string;
  matchOdds: {
    marketId: string;
    runners: SportRunner[];
  } | null;
  hasBookmaker: boolean;
}

interface Banner {
  _id?: string;
  image?: string;
  image_url?: string;
  title?: string;
}

interface SportEventPageProps {
  sportId: string;
  sportName: string;
  sportIcon: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
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

function getTeamNames(event: SportEvent): { home: string; away: string } {
  const r = event.matchOdds?.runners;
  if (r && r.length >= 2) return { home: r[0].name, away: r[1].name };
  const parts = event.name.split(" v ");
  return { home: parts[0]?.trim() || event.name, away: parts[1]?.trim() || "" };
}

// LeagueCard, EventListRow, LiveBadge, EventCard replaced by shared components above

// ─── Hero Banner ──────────────────────────────────────────────────────────────

const SportHeroBanner: React.FC<{ sportName: string; sportIcon: string }> = ({
  sportName,
  sportIcon,
}) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bannerApi
      .getBannersByType("hero")
      .then((res: any) => {
        const data = res?.data?.banners || res?.data || [];
        if (Array.isArray(data) && data.length > 0) setBanners(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const prev = useCallback(
    () =>
      setCurrentIndex(
        (i) =>
          (i - 1 + Math.max(banners.length, 1)) % Math.max(banners.length, 1),
      ),
    [banners.length],
  );
  const next = useCallback(
    () => setCurrentIndex((i) => (i + 1) % Math.max(banners.length, 1)),
    [banners.length],
  );

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(next, 4000);
    return () => clearInterval(t);
  }, [next, banners.length]);

  if (loading)
    return (
      <div className="h-36 sm:h-44 md:h-52 bg-brand-primary-dark animate-pulse w-full" />
    );

  if (banners.length === 0) {
    return (
      <div className="relative h-36 sm:h-44 md:h-52 overflow-hidden select-none bg-gradient-to-r from-brand-primary-dark to-brand-primary">
        <div className="relative z-10 flex flex-col justify-center h-full px-6 sm:px-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl">{sportIcon}</span>
            <h2 className="text-brand-text font-extrabold text-2xl sm:text-3xl uppercase drop-shadow">
              {sportName}
            </h2>
          </div>
          <p className="text-brand-text/80 text-sm max-w-sm">
            Live odds and real-time markets. Bet now!
          </p>
          <button className="mt-3 bg-bg-card text-brand-primary font-bold text-xs sm:text-sm px-4 py-2 rounded w-fit hover:bg-bg-light-blue transition-colors">
            VIEW EVENTS
          </button>
        </div>
      </div>
    );
  }

  const banner = banners[currentIndex];
  const imgSrc = banner.image_url || banner.image || "";
  return (
    <div className="relative h-36 sm:h-44 md:h-52 overflow-hidden select-none">
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={banner.title || sportName}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-brand-primary to-brand-secondary" />
      )}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-neutral-gray-900/40 hover:bg-neutral-gray-900/60 text-brand-text rounded-full p-1.5"
            aria-label="Previous"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-neutral-gray-900/40 hover:bg-neutral-gray-900/60 text-brand-text rounded-full p-1.5"
            aria-label="Next"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`rounded-full transition-all ${i === currentIndex ? "w-4 h-2 bg-white" : "w-2 h-2 bg-white/50"}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Main SportEventPage ───────────────────────────────────────────────────────

const SportEventPage: React.FC<SportEventPageProps> = ({
  sportId,
  sportName,
  sportIcon,
}) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchEvents = useCallback(async () => {
    try {
      const res = (await bettingApi.getEventsBySport(sportId)) as any;
      const data: SportEvent[] = res?.data || [];
      if (Array.isArray(data)) setEvents(data.filter((e) => !e.isGameOver));
    } catch {
      // keep existing events on error
    }
  }, [sportId]);

  useEffect(() => {
    setLoading(true);
    setEvents([]);
    setActiveFilter("All");
    setSearchQuery("");
    fetchEvents().finally(() => setLoading(false));
  }, [fetchEvents]);

  usePolling(fetchEvents, 15000);

  // ── Derived data ──────────────────────────────────────────────────────────

  const liveCount = events.filter(
    (e) => e.isInPlay || e.matchStatus === "LIVE",
  ).length;

  // Top events: live first, then with odds
  const topEvents = [
    ...events.filter((e) => e.isInPlay || e.matchStatus === "LIVE"),
    ...events.filter(
      (e) => !(e.isInPlay || e.matchStatus === "LIVE") && e.matchOdds,
    ),
    ...events.filter(
      (e) => !(e.isInPlay || e.matchStatus === "LIVE") && !e.matchOdds,
    ),
  ].slice(0, 6);

  // Unique leagues with count + live flag
  const leagueMap = events.reduce<
    Record<string, { count: number; isLive: boolean }>
  >((acc, e) => {
    if (!acc[e.league]) acc[e.league] = { count: 0, isLive: false };
    acc[e.league].count++;
    if (e.isInPlay || e.matchStatus === "LIVE") acc[e.league].isLive = true;
    return acc;
  }, {});
  const leagues = Object.entries(leagueMap).slice(0, 6);

  // Top 4 unique leagues for filter tabs
  const topLeagues = Object.keys(leagueMap).slice(0, 4) as string[];
  const filterTabs = ["All", "Live", ...topLeagues];

  // Filtered events
  const filteredEvents = events.filter((e) => {
    if (activeFilter === "Live") return e.isInPlay || e.matchStatus === "LIVE";
    if (activeFilter === "All") return true;
    return e.league === activeFilter;
  });

  const searchedEvents = filteredEvents.filter(
    (e) =>
      !searchQuery ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.league.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Group by league
  const leagueGroups = searchedEvents.reduce<Record<string, SportEvent[]>>(
    (acc, e) => {
      if (!acc[e.league]) acc[e.league] = [];
      acc[e.league].push(e);
      return acc;
    },
    {},
  );

  return (
    <div className="w-full max-w-[1920px] mx-auto">
      {/* 1. Hero Banner */}
      <SportHeroBanner sportName={sportName} sportIcon={sportIcon} />

      {/* 3. TOP EVENTS */}
      <SportsEventsSection
        externalEvents={topEvents as any}
        totalCount={topEvents.length}
      />

      {/* 4. PROMO BANNER SLOT */}
      {/* 4. PROMO BANNER SLOT */}
      <div
        className="
    px-4 py-5 flex items-center justify-between gap-3
    bg-gradient-to-r from-brand-primary-dark to-brand-primary
"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-3xl flex-shrink-0">🎁</span>
          <div className="min-w-0">
            {/*
              text-brand-text always reads on bg-brand-primary gradient.
              Never use text-brand-text here — on bg-brand-primary
              surfaces, text must always be text-brand-text.
            */}
            <h3 className="text-brand-text font-bold text-sm leading-tight">
              {sportName} Welcome Bonus
            </h3>
            <p className="text-brand-text/70 text-xs mt-0.5 truncate">
              Get up to 100% bonus on your first bet!
            </p>
          </div>
        </div>

        {/*
      Button fix:
      BEFORE: bg-bg-card text-brand-primary
        Dark mode: bg-bg-card = #1e3347 (dark), text-brand-primary = #1a3a5c (dark navy)
        Result: near-invisible dark text on dark card = broken

      AFTER: bg-accent-green text-brand-text
        Works in ALL themes — accent-green is vivid (#4caf50), text-brand-text
        always readable on it. This also matches the 1xBet CTA button style.
        Hover: slightly darker green via opacity.
    */}
        <button
          onClick={() => navigate("/wallet")}
          className="
            bg-accent-green text-brand-text font-bold text-xs
            px-4 py-2 rounded-lg flex-shrink-0
            hover:opacity-90 active:opacity-80
            transition-opacity whitespace-nowrap
        "
        >
          CLAIM NOW
        </button>
      </div>

      {/* 5. TOP COMPETITIONS */}
      {leagues.length > 0 && (
        <div className="px-3 sm:px-4 pt-3 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-accent-yellow text-base">🏆</span>
              <h2 className="text-sm font-bold text-brand-text uppercase tracking-wide">
                Top Competitions
              </h2>
            </div>
            <a
              href="#all-events"
              className="text-brand-text/80 text-xs font-semibold hover:text-brand-text underline"
            >
              All leagues
            </a>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible">
            {leagues.map(([league, info], idx) => (
              <LeagueCompetitionCard
                key={league}
                league={league}
                count={info.count}
                isLive={info.isLive}
                index={idx}
              />
            ))}
          </div>
        </div>
      )}

      {/* 6. ALL EVENTS — league-grouped */}
      <div id="all-events" className="bg-bg-light-blue">
        <div className="bg-brand-primary px-3 sm:px-4 py-2.5 flex items-center gap-2">
          <span className="text-accent-yellow text-sm">{sportIcon}</span>
          <h2 className="text-brand-text font-bold text-sm uppercase tracking-wide">
            {sportName} — All Events
          </h2>
          <span className="text-brand-text/60 text-xs ml-auto">
            {events.length} events
          </span>
        </div>

        {/* Filter tabs + search */}
        <div className="flex items-center bg-bg-white border-b border-stroke-light">
          <div className="flex items-center overflow-x-auto scrollbar-hide flex-1">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`flex items-center gap-1 px-3 sm:px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-r border-stroke-light transition-colors flex-shrink-0 ${
                  activeFilter === tab
                    ? "text-brand-text border-b-2 border-b-accent-green bg-bg-light-blue"
                    : "text-neutral-gray-700 hover:bg-bg-light-blue hover:text-brand-text"
                }`}
              >
                {tab === "Live" && (
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${activeFilter === "Live" ? "bg-accent-green animate-pulse" : "bg-neutral-gray-300"}`}
                  />
                )}
                {tab}
                {tab === "Live" && liveCount > 0 && (
                  <span className="bg-accent-green text-brand-text text-[8px] font-bold px-1 rounded-full ml-0.5">
                    {liveCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center border-l border-stroke-light px-3 flex-shrink-0 bg-brand-primary">
            <FiSearch className="w-3.5 h-3.5 text-brand-text/70" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-brand-text placeholder-white/50 outline-none w-20 sm:w-28 ml-1.5 py-2"
            />
          </div>
        </div>

        {/* Column headers */}
        {searchedEvents.length > 0 && (
          <div className="flex items-center px-3 py-1.5 bg-bg-card border-b border-stroke-light">
            <div className="flex-1 text-[9px] text-neutral-gray-500 font-semibold uppercase tracking-wide">
              Match
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[9px] text-neutral-gray-500 font-semibold uppercase min-w-[80px] text-center">
                1 (Back / Lay)
              </span>
              <span className="text-[9px] text-neutral-gray-500 font-semibold uppercase min-w-[80px] text-center">
                2 (Back / Lay)
              </span>
            </div>
          </div>
        )}

        {/* Event list */}
        <div className="pb-4">
          {loading ? (
            <div className="px-3 pt-3 space-y-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-stroke-light animate-pulse rounded"
                />
              ))}
            </div>
          ) : searchedEvents.length === 0 ? (
            <div className="text-center py-16 text-neutral-gray-500">
              <span className="text-5xl block mb-3">{sportIcon}</span>
              <p className="text-sm font-medium">No {sportName} events found</p>
              <p className="text-xs mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "Check back later for upcoming events"}
              </p>
            </div>
          ) : (
            <EventCardGrid
              events={searchedEvents}
              groupByLeague={true}
              loading={false}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SportEventPage;
