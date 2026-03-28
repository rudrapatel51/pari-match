import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { FiChevronRight } from 'react-icons/fi';

import { bettingApi } from '../../api/bettingClient';
import { casinoApi, bannerApi } from '../../api/client';
import { useBettingStore } from '../../store/bettingStore';
import type { CasinoRawGame } from '../../types/casino';

import HeroBanner from '../Common/HeroBanner';
import Loader from '../Common/Loader';
import LiveTicker from '../Common/LiveTicker';
import PromoBannerSection from '../Common/PromoBannerSection';
import ProviderList from '../Common/ProviderList';
import RecommendedGameSection from '../Common/RecommendedGameSection';
import MobileSubMenu from '../Header/MobileSubMenu';
import EventMatchCard from '../shared/EventMatchCard';
import SportsEventsSection from '../shared/SportsEventsSection';
import PopularSports from './PopularSports';
export type Game = CasinoRawGame;



export const SPORT_META: Record<string, { icon: string; path: string; gradient: string }> = {
  'Cricket': { icon: '🏏', path: '/cricket', gradient: 'linear-gradient(135deg, #1a6b3a 0%, #0d4a28 100%)' },
  'Football': { icon: '⚽', path: '/football', gradient: 'linear-gradient(135deg, #1a3a6b 0%, #0d2048 100%)' },
  'Soccer': { icon: '⚽', path: '/soccer', gradient: 'linear-gradient(135deg, #1a3a6b 0%, #0d2048 100%)' },
  'Tennis': { icon: '🎾', path: '/tennis', gradient: 'linear-gradient(135deg, #7b6a00 0%, #4a4000 100%)' },
  'Hockey': { icon: '🏒', path: '/hockey', gradient: 'linear-gradient(135deg, #2d1a6b 0%, #1a0d48 100%)' },
  'Horse Racing': { icon: '🐎', path: '/horse-racing', gradient: 'linear-gradient(135deg, #6b1a3a 0%, #480d25 100%)' },
  'Election': { icon: '🗳️', path: '/election', gradient: 'linear-gradient(135deg, #6b3a1a 0%, #482008 100%)' },
  'Greyhound Racing': { icon: '🐕', path: '/horse-racing', gradient: 'linear-gradient(135deg, #3a6b1a 0%, #254800 100%)' },
  'Kabaddi': { icon: '🤼', path: '/sports', gradient: 'linear-gradient(135deg, #6b1a1a 0%, #480d0d 100%)' },
};

export const LIVE_CARD = { name: 'In-Play', icon: '🔴', path: '/betting', gradient: 'linear-gradient(135deg, #c0392b 0%, #7b1a14 100%)' };

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
        id: game.game_id || game.game_code || game.id || '',
        title: game.game_name || game.title || game.name || '',
        image: game.url_thumb || game.image || game.thumbnail || '',
        provider: game.provider_name || game.provider || '',
        game_name: game.game_name,
        provider_name: game.provider_name,
        url_thumb: game.url_thumb
      }))
    );
  };

  useEffect(() => {
    const fetchGames = async () => {
      setLoadingGames(true);
      try {
        const [trending, top, recommended, newItem, all] = await Promise.allSettled([
          casinoApi.getFranchiseCategoriesWithGames({ include_games: true, default_category: 'trending_games' }),
          casinoApi.getFranchiseCategoriesWithGames({ include_games: true, default_category: 'top_games' }),
          casinoApi.getFranchiseCategoriesWithGames({ include_games: true, default_category: 'middle_games' }),
          casinoApi.getFranchiseCategoriesWithGames({ include_games: true, default_category: 'bottom_games' }),
          casinoApi.getFranchiseCategoriesWithGames({ include_games: true }),
        ]);

        const cats = (v: any) => v?.data?.categories || v?.categories || (Array.isArray(v?.data) ? v.data : []);
        if (trending.status === 'fulfilled') setTrendingGames(flattenGames(cats(trending.value)));
        if (top.status === 'fulfilled') setTopGames(flattenGames(cats(top.value)));
        if (recommended.status === 'fulfilled') setRecommendedGames(flattenGames(cats(recommended.value)));
        if (newItem.status === 'fulfilled') setNewGames(flattenGames(cats(newItem.value)));
        if (all.status === 'fulfilled') setAllGames(flattenGames(cats(all.value)));

      } catch (error) {
        console.error('[MainContent] games fetch failed:', error);
      } finally {
        setLoadingGames(false);
      }
    };

    const fetchBanners = async () => {
      try {
        const res: any = await bannerApi.getBannersByType('general');
        const b = res?.data?.banners || res?.data || [];
        if (Array.isArray(b)) setGeneralBanners(b);
      } catch (error) {
        console.error('[MainContent] banners fetch failed:', error);
      } finally {
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
    Cricket: '🏏', Football: '⚽', Tennis: '🎾', Soccer: '⚽', Hockey: '🏒',
  };

  // Auto-select first sport once sports load from the shared store
  useEffect(() => {
    if (bettingSports.length > 0 && activeSportId === null) {
      setActiveSportId(String(bettingSports[0].sportId));
    }
  }, [bettingSports]);

  useEffect(() => {
    if (!activeSportId) return;
    setEventsLoading(true);
    bettingApi.getEventsBySport(activeSportId)
      .then((res: any) => {
        const list = res?.data || res || [];
        setSportEvents(Array.isArray(list) ? list.filter((e: any) => !e.isGameOver) : []);
      })
      .catch(() => setSportEvents([]))
      .finally(() => setEventsLoading(false));
  }, [activeSportId]);

  const renderOddsPair = (runner: any) => (
    <div className="flex flex-col items-center gap-0.5 min-w-[40px]">
      <span className="text-xs font-mono font-bold bg-odds-back text-neutral-gray-900 px-1.5 py-1 rounded w-full text-center">
        {runner?.back != null ? Number(runner.back).toFixed(2) : '—'}
      </span>
      <span className="text-xs font-mono font-bold bg-odds-lay text-neutral-gray-900 px-1.5 py-1 rounded w-full text-center">
        {runner?.lay != null ? Number(runner.lay).toFixed(2) : '—'}
      </span>
    </div>
  );

  const renderEventRow = (event: any) => (
    <div
      key={event.eventId}
      onClick={() => navigate(`/betting/event/${event.eventId}`)}
      className="flex items-center px-3 py-2.5 border-b border-stroke-light hover:bg-bg-light-blue transition-colors group cursor-pointer"
    >
      {/* Left: meta + name */}
      <div className="flex-1 flex flex-col gap-0.5 min-w-0 pr-2">
        {/* Row 1: date / time / status */}
        <div className="flex items-center gap-2">
          {activeSportId === null || event.matchStatus === 'LIVE' ? (
            <span className="flex items-center gap-1 text-md text-accent-red font-bold shrink-0">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-red opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-red" />
              </span>
              In-Play
            </span>
          ) : event.startTime ? (
            <>
              <span className="text-md text-neutral-gray-900 shrink-0">
                {new Date(event.startTime).toLocaleDateString([], { day: 'numeric', month: 'short' })}
              </span>
              <span className="text-md font-medium text-neutral-gray-900 shrink-0">
                {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </>
          ) : null}
          {event.league && (
            <span className="text-md text-neutral-gray-600 truncate">{event.league}</span>
          )}
        </div>
        {/* Row 2: event name + badges */}
        <div className="flex items-center gap-1.5">
          <span className="text-md font-semibold text-neutral-gray-800 group-hover:text-brand-primary dark:group-hover:text-brand-text transition-colors truncate leading-snug">
            {event.name}
          </span>
          {event.hasBookmaker && (
            <span className="text-md bg-brand-primary text-neutral-gray-900 font-bold px-1 py-0.5 rounded shrink-0 leading-none">BM</span>
          )}
        </div>
      </div>
      {/* Right: odds columns */}
      <div className="flex gap-1 shrink-0">
        {renderOddsPair(event.matchOdds?.runners?.[0])}
        {renderOddsPair(event.matchOdds?.runners?.[1])}
        {renderOddsPair(event.matchOdds?.runners?.[2])}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[1920px] mx-auto">
      <div className="space-y-0">
        <MobileSubMenu />

        {/* Hero Banner */}
        <div className="bg-bg-white border-b border-stroke-light">
          <HeroBanner />
        </div>
        <div className="bg-bg-white px-2 sm:px-4 lg:px-6 space-y-2">
         {(loadingGames || trendingGames.length > 0) && (
            <RecommendedGameSection title="Treding Games" games={trendingGames} isLoading={loadingGames}
              onGameClick={handleGameClick} onViewAll={() => navigate('/casino')} />
          )}
        </div>

           {/* Game Providers */}
        <ProviderList />
                {/* Live Match Ticker */}
        <LiveTicker />


        {/* Popular Sports Cards */}
        <PopularSports />

        {/* ── Sports / Betting Section ── */}
        <div className="bg-bg-white border-t border-stroke-light mt-2">
          {/* Sport tabs — populated from /demoapi/betting/sports */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide px-3 py-2 border-b border-stroke-light">
            {bettingSports.length === 0 ? (
              <span className="text-xs text-neutral-gray-600 px-2">Loading sports...</span>
            ) : bettingSports.map((sport: any) => (
              <button
                key={sport.sportId}
                onClick={() => setActiveSportId(String(sport.sportId))}
                className={`flex items-center gap-1.5 px-4 py-2 rounded font-display text-sm font-semibold whitespace-nowrap shrink-0 transition-all ${String(sport.sportId) === activeSportId
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-neutral-gray-600 hover:bg-bg-light-blue hover:text-brand-primary dark:hover:text-brand-text'
                  }`}
              >
                <span>{SPORT_ICONS[sport.name] ?? '🏆'}</span>
                {sport.name.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Events table */}
          <div className="bg-bg-card">
            {/* Table header */}
            <div className="flex items-center px-3 py-2 bg-brand-primary text-white text-xs font-display font-semibold">
              <span className="flex-1">SCHEDULE</span>
              <div className="flex gap-1 text-center">
                <span className="min-w-[40px]">1</span>
                <span className="min-w-[40px]">X</span>
                <span className="min-w-[40px]">2</span>
              </div>
            </div>

            {eventsLoading ? (
              <Loader text="Loading events..." />
            ) : sportEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <span className="text-4xl">📡</span>
                <p className="text-neutral-gray-700 text-md">
                  {activeSportId === null ? 'No live events right now' : 'No events found for this sport'}
                </p>
              </div>
            ) : (
              sportEvents.map(renderEventRow)
            )}
          </div>
        </div>

        {/* Cricket Events — fetches from sports/4/events automatically */}
        <SportsEventsSection sportId={4} />
        <SportsEventsSection sportId={1} />

        {/* Casino Game Sections */}
        <div className="bg-bg-white px-3 sm:px-4 lg:px-6 space-y-2">
          {(loadingGames || topGames.length > 0) && (
            <RecommendedGameSection title="Top Games" games={topGames} isLoading={loadingGames}
              onGameClick={handleGameClick} onViewAll={() => navigate('/casino')} />
          )}
        </div>

        {/* Promo Banner Section (middone / middtwo / middthree) */}
        <div className="bg-bg-white border-t border-stroke-light">
          <PromoBannerSection />
        </div>

        {/* General Banner (mid-page carousel) */}
        {generalBanners.length > 0 && (
          <div className="bg-bg-white border-t border-stroke-light px-3 sm:px-4 lg:px-6 py-3">
            <HeroBanner type="general" staticBanners={generalBanners} />
          </div>
        )}

        {/* Casino Game Sections (continued) */}
        <div className="bg-bg-white px-3 sm:px-4 lg:px-6 space-y-2">
          {(loadingGames || trendingGames.length > 0) && (
            <RecommendedGameSection title="Recommended Games" games={trendingGames} isLoading={loadingGames}
              onGameClick={handleGameClick} onViewAll={() => navigate('/casino')} />
          )}
        </div>

        {/* Casino Game Sections */}
        <div className="bg-bg-white px-3 sm:px-4 lg:px-6 space-y-2">
          {(loadingGames || newGames.length > 0) && (
            <RecommendedGameSection title="New Games" games={newGames} isLoading={loadingGames}
              onGameClick={handleGameClick} onViewAll={() => navigate('/casino')} />
          )}
          {!loadingGames && allGames.length > 0 && (
            <RecommendedGameSection title="All Games" games={allGames} isLoading={false}
              onGameClick={handleGameClick} onViewAll={() => navigate('/casino')} />
          )}
        </div>

      </div>
    </div>
  );
};

export default MainContent;