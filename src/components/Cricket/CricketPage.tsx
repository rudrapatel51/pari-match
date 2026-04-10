import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi';

import { usePolling } from '../../hooks/usePolling';
import { bannerApi } from '../../api/client';
import { bettingApi } from '../../api/bettingClient';
import { BETTING_SPORT_IDS } from '../../api/endpoints';

import EventMatchCard from '../shared/EventMatchCard';
import SportsEventsSection from '../shared/SportsEventsSection';
import LeagueCompetitionCard from '../shared/LeagueCompetitionCard';
import EventCardGrid from '../shared/EventCardGrid';

interface CricketRunner {
    runnerId: number;
    name: string;
    back: string;
    lay: string;
}

interface CricketEvent {
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
        runners: CricketRunner[];
    } | null;
    hasBookmaker: boolean;
}

interface Banner {
    _id?: string;
    image?: string;
    image_url?: string;
    title?: string;
    subtitle?: string;
    link?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectFormat(league: string, name: string): string {
    const text = (league + ' ' + name).toLowerCase();
    if (text.includes('t20') || text.includes('twenty20')) return 'T20';
    if (text.includes('test')) return 'Test';
    if (text.includes('odi') || text.includes('one day') || text.includes('one-day')) return 'ODI';
    if (text.includes('t10')) return 'T10';
    return 'Others';
}

const GAME_FILTERS = ['Live', 'Sports', 'T20', 'Test', 'ODI', 'T10', 'Others'] as const;
type GameFilter = typeof GAME_FILTERS[number];

const CricketHeroBanner: React.FC = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate() 
    useEffect(() => {
        bannerApi.getBannersByType('hero').then((res: any) => {
            const data = res?.data?.banners || res?.data || [];
            if (Array.isArray(data) && data.length > 0) setBanners(data);
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const prev = useCallback(() => setCurrentIndex(i => (i - 1 + Math.max(banners.length, 1)) % Math.max(banners.length, 1)), [banners.length]);
    const next = useCallback(() => setCurrentIndex(i => (i + 1) % Math.max(banners.length, 1)), [banners.length]);

    useEffect(() => {
        if (banners.length <= 1) return;
        const t = setInterval(next, 4000);
        return () => clearInterval(t);
    }, [next, banners.length]);

    if (loading) return <div className="h-36 sm:h-44 md:h-56 bg-brand-primary-dark animate-pulse w-full" />;

    const fallbackSlides = [
        {
            title: 'CRICKET FREE BET',
            subtitle: 'Bet on your favourite cricket matches and win big!',
            cta: 'BET NOW',
            bg: 'from-brand-primary-dark to-brand-primary',
            img: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
        },
        {
            title: 'DOWNLOAD WLS APP',
            subtitle: 'Get an easy access to your favorite betting and casino platform!',
            cta: 'DOWNLOAD THE APP',
            bg: 'from-brand-secondary to-brand-primary',
            img: 'https://images.unsplash.com/photo-1540747913346-19212a4b423b?auto=format&fit=crop&w=1200&q=80',
        },
    ];

    if (banners.length === 0) {
        const slide = fallbackSlides[currentIndex % fallbackSlides.length];
        return (
            <div className={`relative h-36 sm:h-44 md:h-56 overflow-hidden select-none bg-gradient-to-r ${slide.bg}`}>
                <img src={slide.img} alt={slide.title} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                <div className="relative z-10 flex flex-col justify-center h-full px-6 sm:px-10">
                    <h2 className="text-white font-extrabold text-xl sm:text-3xl md:text-4xl uppercase drop-shadow mb-1">{slide.title}</h2>
                    <p className="text-white/80 text-xs sm:text-sm mb-3 max-w-sm">{slide.subtitle}</p>
                    <button className="bg-bg-card text-white font-bold text-xs sm:text-sm px-4 py-2 rounded w-fit hover:bg-bg-light-blue transition-colors">
                        {slide.cta}
                    </button>
                </div>
                <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-neutral-gray-900/30 hover:bg-neutral-gray-900/50 text-white rounded-full p-1.5" aria-label="Previous">
                    <FiChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-neutral-gray-900/30 hover:bg-neutral-gray-900/50 text-white rounded-full p-1.5" aria-label="Next">
                    <FiChevronRight className="w-4 h-4" />
                </button>
            </div>
        );
    }

    const banner = banners[currentIndex];
    const imgSrc = banner.image_url || banner.image || '';
    return (
        <div className="relative h-36 sm:h-44 md:h-56 overflow-hidden select-none">
            {imgSrc ? (
                <img src={imgSrc} alt={banner.title || 'Banner'} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-gradient-to-r from-brand-primary to-brand-secondary" />
            )}
            {banners.length > 1 && (
                <>
                    <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-neutral-gray-900/40 hover:bg-neutral-gray-900/60 text-white rounded-full p-1.5" aria-label="Previous">
                        <FiChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-neutral-gray-900/40 hover:bg-neutral-gray-900/60 text-white rounded-full p-1.5" aria-label="Next">
                        <FiChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {banners.map((_, i) => (
                            <button key={i} onClick={() => setCurrentIndex(i)}
                                className={`rounded-full transition-all ${i === currentIndex ? 'w-4 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`}
                                aria-label={`Slide ${i + 1}`} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
const CricketPage: React.FC = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<CricketEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<GameFilter>('Sports');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchEvents = useCallback(async () => {
        try {
            const res = await bettingApi.getEventsBySport(BETTING_SPORT_IDS.cricket) as any;
            const data: CricketEvent[] = Array.isArray(res?.data) ? res.data : [];
            if (Array.isArray(data)) {
                setEvents(data.filter(e => !e.isGameOver));
            }
        } catch (error) {
            console.error('[CricketPage] fetch failed:', error);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchEvents().finally(() => setLoading(false));
    }, [fetchEvents]);

    usePolling(fetchEvents, 15000);

    // ── Derived data ──────────────────────────────────────────────────────────

    const liveCount = events.filter(e => e.isInPlay || e.matchStatus === 'LIVE').length;

    // Top games: prefer live events first, then upcoming with odds
    const topGames = [
        ...events.filter(e => e.isInPlay || e.matchStatus === 'LIVE'),
        ...events.filter(e => !(e.isInPlay || e.matchStatus === 'LIVE') && e.matchOdds),
        ...events.filter(e => !(e.isInPlay || e.matchStatus === 'LIVE') && !e.matchOdds),
    ].slice(0, 6);

    // Unique leagues with event counts + live flag
    const leagueMap = events.reduce<Record<string, { count: number; isLive: boolean }>>((acc, e) => {
        if (!acc[e.league]) acc[e.league] = { count: 0, isLive: false };
        acc[e.league].count++;
        if (e.isInPlay || e.matchStatus === 'LIVE') acc[e.league].isLive = true;
        return acc;
    }, {});
    const leagues = Object.entries(leagueMap).slice(0, 6);

    // Filtered events
    const filteredEvents = events.filter(e => {
        const fmt = detectFormat(e.league, e.name);
        if (activeFilter === 'Live') return e.isInPlay || e.matchStatus === 'LIVE';
        if (activeFilter === 'Sports') return true;
        if (activeFilter === 'Others') return !['T20', 'Test', 'ODI', 'T10'].includes(fmt);
        return fmt === activeFilter;
    });

    const searchedEvents = filteredEvents.filter(e =>
        !searchQuery ||
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.league.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group by league for "All Games"
    const leagueGroups = searchedEvents.reduce<Record<string, CricketEvent[]>>((acc, e) => {
        if (!acc[e.league]) acc[e.league] = [];
        acc[e.league].push(e);
        return acc;
    }, {});

    return (
        <div className="w-full max-w-[1920px] mx-auto bg-bg-light-blue pb-4">
            {/* 1. Hero Banner — full width, no rounding */}
            <CricketHeroBanner />

            {/* 2. TOP GAMES */}
            <SportsEventsSection externalEvents={topGames as any} totalCount={topGames.length} />

            {/* 3. TOP COMPETITIONS */}
            {leagues.length > 0 && (
                <div className="rounded-xl overflow-hidden shadow-sm">
                    {/* Section header */}
                    <div className="bg-brand-primary px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-accent-yellow text-base">🏆</span>
                            <h2 className="text-sm font-bold text-white uppercase tracking-wide">Top Competitions</h2>
                        </div>
                        <a href="#all-games" className="text-white/80 text-xs font-semibold hover:text-white underline">
                            All leagues
                        </a>
                    </div>
                    {/* Cards area */}
                    <div className="bg-brand-primary/90 px-3 pb-4 pt-2">
                        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible">
                            {leagues.map(([league, info], idx) => (
                                <LeagueCompetitionCard key={league} league={league} count={info.count} isLive={info.isLive} index={idx} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 4. PROMO BANNER SLOT */}
<div className="
    px-4 py-5 flex items-center justify-between gap-3
    bg-gradient-to-r from-brand-primary-dark to-brand-primary
">
    <div className="flex items-center gap-3 min-w-0">
        <span className="text-3xl flex-shrink-0">🎁</span>
        <div className="min-w-0">
            {/*
              text-white always reads on bg-brand-primary gradient.
              Never use text-brand-text here — on bg-brand-primary
              surfaces, text must always be text-white.
            */}
            <h3 className="text-white font-bold text-sm leading-tight">
                Cricket Welcome Bonus
            </h3>
            <p className="text-white/70 text-xs mt-0.5 truncate">
                Get up to 100% bonus on your first bet!
            </p>
        </div>
    </div>

    {/*
      Button fix:
      BEFORE: bg-bg-card text-brand-primary
        Dark mode: bg-bg-card = #1e3347 (dark), text-brand-primary = #1a3a5c (dark navy)
        Result: near-invisible dark text on dark card = broken

      AFTER: bg-accent-green text-white
        Works in ALL themes — accent-green is vivid (#4caf50), text-white
        always readable on it. This also matches the 1xBet CTA button style.
        Hover: slightly darker green via opacity.
    */}
    <button
        onClick={() => navigate('/wallet')}
        className="
            bg-accent-green text-white font-bold text-xs
            px-4 py-2 rounded-lg flex-shrink-0
            hover:opacity-90 active:opacity-80
            transition-opacity whitespace-nowrap
        "
    >
        CLAIM NOW
    </button>
</div>

            {/* 4. ALL GAMES */}
            <div id="all-games" className="rounded-xl overflow-hidden border border-stroke-light shadow-sm">
                {/* Section header */}
                <div className="bg-brand-primary px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-accent-yellow text-sm">⚡</span>
                        <h2 className="text-white font-bold text-sm uppercase tracking-wide">All Games</h2>
                    </div>
                    <span className="text-white/60 text-xs">{events.length} events</span>
                </div>

                {/* Filters + Search */}
                <div className="flex items-center bg-bg-white border-b border-stroke-light">
                    <div className="flex items-center overflow-x-auto scrollbar-hide flex-1">
                        {GAME_FILTERS.map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`flex items-center gap-1 px-3 sm:px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-r border-stroke-light transition-colors flex-shrink-0 ${activeFilter === filter
                                    ? 'text-white border-b-2 border-b-accent-green bg-bg-light-blue'
                                    : 'text-neutral-gray-700 hover:bg-bg-light-blue hover:text-white'
                                    }`}
                            >
                                {filter === 'Live' && (
                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${activeFilter === 'Live' ? 'bg-accent-green animate-pulse' : 'bg-neutral-gray-300'}`} />
                                )}
                                {filter}
                                {filter === 'Live' && liveCount > 0 && (
                                    <span className="bg-accent-green text-white text-[8px] font-bold px-1 rounded-full ml-0.5">{liveCount}</span>
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center border-l border-stroke-light px-3 flex-shrink-0 bg-brand-primary">
                        <FiSearch className="w-3.5 h-3.5 text-white/70" />
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="bg-transparent text-xs text-white placeholder-white/50 outline-none w-20 sm:w-28 ml-1.5 py-2"
                        />
                    </div>
                </div>

                {/* Odds column header */}
                {searchedEvents.length > 0 && (
                    <div className="flex items-center px-4 py-1.5 bg-bg-card border-b border-stroke-light">
                        <div className="flex-1 text-[9px] text-neutral-gray-500 font-semibold uppercase tracking-wide">Match</div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="text-[9px] text-neutral-gray-500 font-semibold uppercase min-w-[80px] text-center">1 (Back / Lay)</span>
                            <span className="text-[9px] text-neutral-gray-500 font-semibold uppercase min-w-[80px] text-center">2 (Back / Lay)</span>
                        </div>
                    </div>
                )}

                {/* Event list */}
                <div className="bg-bg-white">
                    <EventCardGrid events={searchedEvents} groupByLeague={true} loading={loading} />
                </div>
            </div>
        </div>
    );
};

export default CricketPage;
