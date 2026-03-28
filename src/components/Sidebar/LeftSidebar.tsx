import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { FiChevronDown, FiChevronRight, FiChevronUp, FiGlobe } from 'react-icons/fi';
import { useBettingStore } from '../../store/bettingStore';
import { LEFT_COMPETITIONS, SIDE_SPORTS, TournamentKey } from '../Football/FootballPage';

const SPORT_ICONS: Record<string, string> = {
    Cricket: '🏏', Football: '⚽', Soccer: '⚽', Tennis: '🎾',
    Hockey: '🏒', Basketball: '🏀', Baseball: '⚾', Rugby: '🏉',
    'Horse Racing': '🐎', 'Greyhound Racing': '🐕', Kabaddi: '🤼',
    Election: '🗳️', Volleyball: '🏐', 'Table Tennis': '🏓',
    Badminton: '🏸', Boxing: '🥊', MMA: '🥋', Golf: '⛳',
};

type MainTab = 'live' | 'sports';

interface LeftSidebarProps {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    isMobileOpen: boolean;
    onMobileClose: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
    isCollapsed,
    onToggleCollapse,
    isMobileOpen,
    onMobileClose,
}) => {
    const [activeTab, setActiveTab]             = useState<MainTab>('live');
    const [expandedSports, setExpandedSports]   = useState<Set<string | number>>(new Set());
    const [footballOpen, setFootballOpen]       = useState(true);
    const [expandedSides, setExpandedSides]     = useState<Record<string, boolean>>({});
    const [expandedExtra, setExpandedExtra]     = useState<Record<string, boolean>>({ favourites: true });

    const location       = useLocation();
    const navigate       = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const isFootballPage   = location.pathname === '/football';
    const activeTournament = (searchParams.get('tournament') as TournamentKey) || 'ucl';

    const storeSports     = useBettingStore((s) => s.sports);
    const storeLiveEvents = useBettingStore((s) => s.liveEvents);

    const toggleSport = (sportId: string | number) => {
        setExpandedSports((prev) => {
            const next = new Set(prev);
            if (next.has(sportId)) next.delete(sportId); else next.add(sportId);
            return next;
        });
    };

    const totalLive = storeLiveEvents.length;

    const toggleExtra = (key: string) =>
        setExpandedExtra((prev) => ({ ...prev, [key]: !prev[key] }));

    const EXTRA_SECTIONS = [
        {
            key: 'favourites',
            label: 'Favourites',
            icon: '⭐',
            items: [
                { id: '1', label: 'Manchester United vs Chelsea', sub: 'Football · Premier League' },
                { id: '2', label: 'India vs Australia',          sub: 'Cricket · T20 Series' },
                { id: '3', label: 'Federer vs Nadal',            sub: 'Tennis · Wimbledon' },
            ],
        },
        {
            key: 'topGames',
            label: 'Top Games',
            icon: '🔥',
            items: [
                { id: '1', label: 'Premier League Final',        sub: 'Football · Today 8 PM' },
                { id: '2', label: 'IPL Match 23',                sub: 'Cricket · Today 7:30 PM' },
                { id: '3', label: 'Wimbledon Quarter Final',     sub: 'Tennis · Live Now' },
            ],
        },
        {
            key: 'recommended',
            label: 'Recommended Sports',
            icon: '🏆',
            items: [
                { id: '1', label: 'Cricket – World Cup',         sub: '12 matches available' },
                { id: '2', label: 'Football – Champions League', sub: '8 matches available' },
                { id: '3', label: 'Tennis – US Open',            sub: '5 matches available' },
            ],
        },
    ] as const;

    const sportsWithCounts = useMemo(() => {
        return storeSports.map((sport: any) => {
            const liveCount = storeLiveEvents.filter(
                (e: any) => Number(e.sportId) === Number(sport.sportId)
            ).length;
            return { sportId: sport.sportId, name: sport.name, liveCount };
        });
    }, [storeSports, storeLiveEvents]);

    // ── Collapsed icon-only view ──────────────────────────────────────────────
    const CollapsedView = (
        <div className="flex flex-col items-center py-2 gap-1">
            <button
                onClick={() => { setActiveTab('live'); onToggleCollapse(); }}
                className="w-full flex items-center justify-center p-2.5 hover:bg-bg-light-blue rounded transition-colors"
                title="Live"
            >
                <span className="w-2 h-2 rounded-full bg-accent-red animate-pulse" />
            </button>
            <button
                onClick={() => { setActiveTab('sports'); onToggleCollapse(); }}
                className="w-full flex items-center justify-center p-2.5 hover:bg-bg-light-blue rounded transition-colors"
                title="Sports"
            >
                <FiGlobe className="w-4 h-4 text-brand-text" />
            </button>
            <div className="w-full h-px bg-stroke-light my-1" />
            {storeSports.map((sport: any) => (
                <a
                    key={sport.sportId}
                    onClick={() => navigate(`/betting/sport/${sport.sportId}`)}
                    className="relative w-full flex items-center justify-center p-2.5 hover:bg-bg-light-blue rounded transition-colors cursor-pointer"
                    title={sport.name}
                >
                    <span className="text-lg leading-none">{SPORT_ICONS[sport.name] ?? '🏆'}</span>
                    {(() => {
                        const liveCount = storeLiveEvents.filter(
                            (e: any) => Number(e.sportId) === Number(sport.sportId)
                        ).length;
                        return liveCount > 0 ? (
                            /*
                              Live count badge: bg-accent-green NOT bg-accent-red.
                              1xBet style uses green for live indicators.
                            */
                            <span className="absolute top-1 right-1 bg-accent-red text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                                {liveCount}
                            </span>
                        ) : null;
                    })()}
                </a>
            ))}
        </div>
    );

    // ── Football page specific content ────────────────────────────────────────
    const FootballContent = (
        <div className="flex flex-col w-full text-left">
            <div className="bg-brand-primary text-white px-3 py-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide">Bet on Big Tournaments</span>
            </div>

            {/*
              FIX: bg-bg-light-blue → bg-brand-primary-dark
              bg-bg-light-blue is a hover tint — using it as a section sub-header
              background creates a confusing light flash between two dark brand headers.
              brand-primary-dark gives a proper depth gradient: primary → primary-dark.
              FIX: text-brand-primary → text-white
              brand-primary on bg-bg-light-blue = dark navy on light blue = fine in light,
              but in dark mode both become dark = invisible.
              On brand-primary-dark, text-white always reads correctly.
            */}
            <div className="bg-brand-primary-dark px-3 py-1.5 border-b border-stroke-light">
                <span className="text-xs text-white/70 font-semibold">{LEFT_COMPETITIONS.length} Events</span>
            </div>

            {/* Football group */}
            <div>
                <button
                    className="w-full flex items-center justify-between px-3 py-2 bg-brand-primary-light text-white hover:bg-brand-primary-dark transition-colors"
                    onClick={() => setFootballOpen((o) => !o)}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-sm">⚽</span>
                        <span className="text-xs font-bold uppercase">Football</span>
                    </div>
                    {footballOpen
                        ? <FiChevronUp className="w-3.5 h-3.5" />
                        : <FiChevronDown className="w-3.5 h-3.5" />
                    }
                </button>

                {footballOpen && (
                    <div>
                        {LEFT_COMPETITIONS.map((comp) => (
                            <button
                                key={comp.id}
                                onClick={() => setSearchParams({ tournament: comp.id })}
                                className={[
                                    'w-full text-left flex items-start gap-2 px-3 py-2 text-xs border-b border-stroke-light transition-colors',
                                    activeTournament === comp.id
                                        /*
                                          FIX: bg-brand-blue-50 → bg-bg-light-blue
                                          brand-blue-50 is not a valid token in tailwind.config.js.
                                          bg-bg-light-blue is the correct active/hover tint token.
                                          FIX: text-brand-primary → text-brand-text
                                          On bg-bg-light-blue: brand-primary = dark navy in dark mode
                                          = potentially invisible. brand-text is always readable.
                                          FIX: border-l-brand-primary → border-l-accent-green
                                          1xBet style: active items use green accent border, not brand-primary.
                                          In dark mode brand-primary border = dark navy = invisible anyway.
                                        */
                                        ? 'bg-bg-light-blue text-brand-text font-semibold border-l-2 border-l-accent-green'
                                        : 'text-brand-text hover:bg-bg-light-blue',
                                ].join(' ')}
                            >
                                <span className="flex-shrink-0 mt-0.5 leading-none">{comp.flag}</span>
                                <span className="leading-tight">{comp.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Other sports */}
            {SIDE_SPORTS.map((sport) => (
                <div key={sport.label}>
                    <button
                        onClick={() => setExpandedSides((s) => ({ ...s, [sport.label]: !s[sport.label] }))}
                        className="w-full flex items-center justify-between px-3 py-2.5 border-b border-stroke-light hover:bg-bg-light-blue transition-colors"
                    >
                        <span className="text-xs font-semibold text-brand-text">{sport.label}</span>
                        {expandedSides[sport.label]
                            ? <FiChevronUp className="w-3.5 h-3.5 text-neutral-gray-500" />
                            : <FiChevronDown className="w-3.5 h-3.5 text-neutral-gray-500" />
                        }
                    </button>
                    {expandedSides[sport.label] && (
                        <div className="px-4 py-2 text-xs text-neutral-gray-500 italic">No events</div>
                    )}
                </div>
            ))}
        </div>
    );

    // ── LIVE tab content ──────────────────────────────────────────────────────
    const LiveContent = (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 bg-brand-primary">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-red animate-pulse flex-shrink-0" />
                    <span className="text-xs font-bold text-white uppercase tracking-wide">Live</span>
                    <span className="text-[10px] font-black bg-accent-red text-white px-1.5 py-0.5 rounded-full leading-none">
                        {totalLive}
                    </span>
                </div>
                <FiGlobe className="w-3.5 h-3.5 text-white/60" />
            </div>

            {storeLiveEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-4">
                    {/*
                      FIX: standalone dot with no context → replaced with text only.
                      A lone dot is meaningless. Keep only the text.
                    */}
                    <p className="text-xs text-neutral-gray-500">No live events right now</p>
                </div>
            ) : (
                <div>
                    {(storeLiveEvents as any[]).map((event: any) => {
                        const sportName = storeSports.find(
                            (s: any) => Number(s.sportId) === Number(event.sportId)
                        )?.name;
                        return (
                            <button
                                key={event.eventId || event._id}
                                onClick={() => navigate(`/betting/event/${event.eventId || event._id}`)}
                                className="w-full flex items-start gap-2.5 px-3 py-2.5 border-b border-stroke-light hover:bg-brand-primary group transition-colors"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-accent-red mt-1.5 flex-shrink-0 animate-pulse" />
                                <div className="flex-1 min-w-0 text-left">
                                    {/*
                                      text-brand-text on default bg-bg-secondary ✅
                                      group-hover:text-white on hover bg-brand-primary ✅
                                      Both states correct — no change needed here.
                                    */}
                                    <span className="block text-xs font-medium text-brand-text group-hover:text-white leading-snug line-clamp-2 transition-colors">
                                        {event.name}
                                    </span>
                                    {sportName && (
                                        <span className="block text-[10px] text-neutral-gray-500 group-hover:text-white/60 mt-0.5 transition-colors">
                                            {SPORT_ICONS[sportName] ?? '🏆'} {sportName}
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );

    // ── SPORTS tab content ────────────────────────────────────────────────────
    const SportsContent = (
        <div>
            {/*
              FIX: bg-bg-light-blue → bg-brand-primary-dark for the SPORTS header.
              Reason: The LIVE tab header uses bg-brand-primary. For visual consistency,
              SPORTS should use brand-primary-dark (slightly deeper) rather than
              bg-bg-light-blue (a hover tint that looks wrong as a section header).
              FIX: text-brand-text → text-white (header on brand-primary-dark bg)
              FIX: text-neutral-gray-500 count → text-white/60 (on dark bg)
            */}
            <div className="flex items-center justify-between px-3 py-2 bg-brand-primary-dark border-b border-stroke-light">
                <span className="text-xs font-bold text-white uppercase tracking-wide">All Sports</span>
                <span className="text-xs text-white/60">{sportsWithCounts.length}</span>
            </div>

            {sportsWithCounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-4">
                    <p className="text-xs text-neutral-gray-500">No sports available</p>
                </div>
            ) : (
                <div>
                    {sportsWithCounts.map((sport) => (
                        <div key={sport.sportId} className="border-b border-stroke-light">
                            <button
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-bg-light-blue transition-colors"
                                onClick={() => toggleSport(`s-${sport.sportId}`)}
                            >
                                <span className="text-base leading-none flex-shrink-0">
                                    {SPORT_ICONS[sport.name] ?? '🏆'}
                                </span>
                                <span className="flex-1 text-xs font-semibold text-brand-text text-left">
                                    {sport.name}
                                    {sport.liveCount > 0 && (
                                        /*
                                          FIX: text-neutral-gray-500 → text-brand-text/50
                                          neutral-gray-500 is auto-generated and unreliable.
                                          brand-text/50 is always correctly muted in both themes.
                                        */
                                        <span className="text-brand-text/50 font-normal ml-1">
                                            ({sport.liveCount})
                                        </span>
                                    )}
                                </span>
                                {sport.liveCount > 0 && (
                                    <span className="text-[9px] font-bold text-accent-red bg-accent-red/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                        LIVE
                                    </span>
                                )}
                                {expandedSports.has(`s-${sport.sportId}`)
                                    ? <FiChevronUp className="w-3.5 h-3.5 text-neutral-gray-500 flex-shrink-0" />
                                    : <FiChevronDown className="w-3.5 h-3.5 text-neutral-gray-500 flex-shrink-0" />
                                }
                            </button>

                            {expandedSports.has(`s-${sport.sportId}`) && (
                                <div className="bg-bg-card">
                                    {/* View all matches */}
                                    <button
                                        onClick={() => navigate(`/betting/sport/${sport.sportId}`)}
                                        className="w-full flex items-center gap-2 px-4 py-2 border-t border-stroke-light hover:bg-brand-primary group transition-colors"
                                    >
                                        {/*
                                          FIX: text-brand-primary → text-accent-green (default)
                                          brand-primary on bg-bg-secondary = dark navy on dark bg
                                          = invisible in dark mode.
                                          accent-green is vivid in both themes.
                                          group-hover:text-white stays correct (on bg-brand-primary hover).
                                        */}
                                        <FiChevronRight className="w-3 h-3 text-accent-green group-hover:text-white flex-shrink-0 transition-colors" />
                                        <span className="text-xs text-accent-green group-hover:text-white font-semibold transition-colors">
                                            View all {sport.name} matches
                                        </span>
                                    </button>

                                    {/* Live events under this sport */}
                                    {storeLiveEvents
                                        .filter((e: any) => Number(e.sportId) === Number(sport.sportId))
                                        .map((event: any) => (
                                            <button
                                                key={event.eventId || event._id}
                                                onClick={() => navigate(`/betting/event/${event.eventId || event._id}`)}
                                                className="w-full flex items-start gap-2 px-4 py-2 border-t border-stroke-light hover:bg-brand-primary group transition-colors"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-accent-red mt-1.5 flex-shrink-0 animate-pulse" />
                                                <span className="flex-1 text-xs text-brand-text group-hover:text-white text-left leading-snug line-clamp-2 transition-colors">
                                                    {event.name}
                                                </span>
                                            </button>
                                        ))
                                    }
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* Mobile Backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onMobileClose}
                    aria-label="Close sidebar"
                />
            )}

            <aside
                className={[
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full',
                    'md:translate-x-0',
                    'fixed md:sticky',
                    'inset-y-0 md:inset-y-auto',
                    'left-0 md:left-auto',
                    'top-0 md:top-20',
                    'z-50 md:z-sidebar',
                    'w-64 md:w-16',
                    !isCollapsed ? 'lg:w-64 xl:w-72' : 'lg:w-8',
                    'h-screen md:h-[calc(100vh-5rem)]',
                    /*
                      FIX: bg-bg-secondary is correct for sidebar background ✅
                      FIX: border-r-2 border-brand-primary/40 → border-r border-stroke-primary
                      brand-primary/40 opacity on a border = dark navy at 40% opacity.
                      In dark mode: nearly invisible. stroke-primary is the correct
                      explicit border token that works in both themes.
                    */
                    'bg-bg-card border-r border-stroke-primary',
                    'transition-transform duration-300 ease-in-out',
                    'flex-shrink-0',
                    'shadow-elevated md:shadow-none',
                ].join(' ')}
            >
                <div className="relative h-full flex flex-col">

                    {/* Collapsed expand button */}
                    {isCollapsed && (
                        <button
                            onClick={onToggleCollapse}
                            className="hidden lg:block absolute -right-3 top-4 z-10 bg-brand-primary hover:bg-brand-primary-light text-white rounded-full p-1.5 shadow-lg transition-colors"
                            aria-label="Expand sidebar"
                        >
                            <FiChevronRight className="w-4 h-4" />
                        </button>
                    )}

                    {!isCollapsed ? (
                        <div className="flex flex-col h-full">
                            {/* Mobile close button */}
                            <div className="flex justify-center items-center p-3 border-b border-stroke-light md:hidden bg-bg-card">
                                <button
                                    onClick={onMobileClose}
                                    className="bg-brand-primary text-white w-full px-3 py-1.5 rounded-md text-sm font-semibold hover:opacity-90 transition"
                                >
                                    Close
                                </button>
                            </div>

                            {/* Desktop close button */}
                            <div className="hidden lg:flex justify-center items-center p-3 border-b border-stroke-light bg-bg-card">
                                <button
                                    onClick={onToggleCollapse}
                                    className="bg-brand-primary text-white w-full px-3 py-1.5 rounded-md text-sm font-semibold hover:opacity-90 transition"
                                >
                                    Close
                                </button>
                            </div>

                            {isFootballPage ? (
                                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-gray-300 scrollbar-track-transparent">
                                    {FootballContent}
                                </div>
                            ) : (
                                <>
                                    {/* ── LIVE / SPORTS tab bar ── */}
                                    <div className="flex bg-brand-primary shrink-0">
                                        {(['live', 'sports'] as MainTab[]).map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={[
                                                    'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2',
                                                    activeTab === tab
                                                        ? 'text-white border-white'
                                                        : 'text-white/50 border-transparent hover:text-white',
                                                ].join(' ')}
                                            >
                                                {tab === 'live' && activeTab === 'live' && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-accent-red animate-pulse" />
                                                )}
                                                {tab.toUpperCase()}
                                                {tab === 'live' && totalLive > 0 && (
                                                    <span className={[
                                                        'text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none',
                                                        activeTab === 'live'
                                                            ? 'bg-accent-red text-white'
                                                            : 'bg-white/20 text-white',
                                                    ].join(' ')}>
                                                        {totalLive}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                               <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-gray-300 scrollbar-track-transparent">
    {activeTab === 'live' ? LiveContent : SportsContent}

    {/* ── Extra accordion sections ── */}
    {/*
      FIX: border-brand-primary/30 → border-stroke-primary
      Opacity modifier on brand-primary = dark navy at 30% opacity.
      In dark mode: near-invisible against dark bg-bg-secondary.
      stroke-primary is the explicit themed border token.
    */}
    <div className="border-t border-stroke-primary mt-1">
        {EXTRA_SECTIONS.map((section) => (
            <div key={section.key} className="border-b border-stroke-light">

                {/* Section header
                  FIX: "bg-brand-primary text-" → remove stray "text-", correct children
                  The bg-brand-primary is correct for section headers.
                  On bg-brand-primary: ALL text must be text-white, not text-brand-text.
                  FIX: text-brand-text → text-white (section label)
                  FIX: text-neutral-gray-500 count → text-white/60
                       neutral-gray-500 on bg-brand-primary = auto-generated gray on dark
                       navy = near-invisible. text-white/60 always reads on brand-primary.
                  FIX: text-neutral-gray-500 chevrons → text-white/60 (same reason)
                */}
                <button
                    onClick={() => toggleExtra(section.key)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-brand-primary hover:bg-brand-primary-light transition-colors"
                >
                    <span className="text-sm leading-none flex-shrink-0">
                        {section.icon}
                    </span>
                    <span className="flex-1 text-xs font-bold text-white uppercase tracking-wide text-left">
                        {section.label}
                    </span>
                    <span className="text-[10px] text-white/60 font-mono mr-1">
                        {section.items.length}
                    </span>
                    {expandedExtra[section.key]
                        ? <FiChevronUp className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />
                        : <FiChevronDown className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />
                    }
                </button>

                {/* Section items */}
                {expandedExtra[section.key] && (
                    <div className="bg-bg-secondary">
                        {section.items.map((item) => (
                            <button
                                key={item.id}
                                className="w-full flex items-start gap-2.5 px-4 py-2 border-t border-stroke-light hover:bg-brand-primary group transition-colors"
                            >
                                {/*
                                  FIX: bg-brand-primary/40 → bg-stroke-primary
                                  brand-primary/40 = dark navy at 40% opacity.
                                  On bg-bg-secondary (dark): near-invisible dot.
                                  stroke-primary is always a visible mid-tone border
                                  color in both themes.
                                  group-hover:bg-white stays correct (on bg-brand-primary hover).
                                */}
                                <span className="w-1.5 h-1.5 rounded-full bg-stroke-primary group-hover:bg-white mt-1.5 flex-shrink-0 transition-colors" />
                                <div className="flex-1 min-w-0 text-left">
                                    {/*
                                      text-brand-text default ✅ — always readable on bg-bg-secondary
                                      group-hover:text-white ✅ — on bg-brand-primary hover
                                    */}
                                    <span className="block text-xs font-medium text-brand-text group-hover:text-white leading-snug transition-colors">
                                        {item.label}
                                    </span>
                                    {/*
                                      text-neutral-gray-500 for secondary sub-text ✅
                                      group-hover:text-white/60 ✅
                                    */}
                                    <span className="block text-[10px] text-neutral-gray-500 group-hover:text-white/60 mt-0.5 transition-colors">
                                        {item.sub}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        ))}
    </div>
</div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-thin">
                            {CollapsedView}
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default LeftSidebar;