import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { bettingApi } from '../../api/bettingClient';
import { useBettingStore } from '../../store/bettingStore';
import { bettingSocketService } from '../../services/bettingSocketService';
import MarketCard from './MarketCard';

// ─── Constants — identical to old-code BettingEventPage.jsx ──────────────────

/** Human-readable labels for market type groups */
const MARKET_TYPE_LABELS: Record<string, string> = {
    'match-odd': 'MATCH ODDS',
    bookmaker: 'BOOKMAKER',
    bookmaker2: 'MATCH ODDS (BM2)',
    session: 'SESSION',
    fancy1: 'FANCY',
    'ball-by-ball': 'BALL BY BALL',
    'odd-even': 'ODD EVEN MARKET',
    khado: 'KHADO',
    meter: 'METER',
    'player-race': 'PLAYER RACE',
    'cricket-casino': 'CRICKET CASINO',
    jackpot: 'JACKPOT',
    'virtual-match': 'VIRTUAL MATCH',
    'tied-match': 'TIED MATCH',
    'completed-match': 'COMPLETED MATCH',
    goals: 'GOALS',
    'super-over': 'SUPER OVER',
    'winner-market': 'WINNER MARKET',
    'line-market': 'LINE MARKET',
    'other-market': 'OTHER MARKET',
};

/**
 * Priority order for group rendering.
 * Types not in this list are rendered after in their original order.
 */
const MARKET_TYPE_ORDER = [
    'match-odd',
    'bookmaker',
    'bookmaker2',
    'line-market',
    'session',
    'odd-even',
    'ball-by-ball',
    'completed-match',
    'tied-match',
];

/**
 * Session-style market types where each market is its own compacted row.
 * The parent renders a single section header, not individual card headers.
 */
const SESSION_TYPES = [
    'session', 'fancy', 'fancy1', 'ball-by-ball', 'khado',
    'meter', 'player-race', 'odd-even', 'other-market', 'line-market',
];

/**
 * Session sub-types whose column headers read NO / YES instead of BACK / LAY.
 */
const NO_YES_TYPES = ['session', 'fancy1', 'ball-by-ball', 'khado', 'meter', 'player-race'];

function getTypeLabel(marketType: string): string {
    return MARKET_TYPE_LABELS[marketType] || marketType.replace(/-/g, ' ').toUpperCase();
}

/** Returns { left, right } column header strings for a session-type section. */
function getColumnHeaders(marketType: string): { left: string; right: string } {
    if (NO_YES_TYPES.includes(marketType)) return { left: 'NO', right: 'YES' };
    return { left: 'BACK', right: 'LAY' };
}

// ─── Session section header bar ───────────────────────────────────────────────

function SessionSectionHeader({
    marketType,
    collapsed,
    onToggle,
}: {
    marketType: string;
    collapsed: boolean;
    onToggle: () => void;
}) {
    const { left, right } = getColumnHeaders(marketType);
    const isNoYes = NO_YES_TYPES.includes(marketType);
    return (
        <div
            className="flex items-center justify-between px-3 py-2 text-white text-xs font-display font-semibold sticky top-0 z-10 bg-brand-primary-dark"
        >
            <span>{getTypeLabel(marketType)}</span>
            <div className="flex items-center gap-2 shrink-0">
                {/* Column header labels — NO/YES: left=NO(pink), right=YES(blue). BACK/LAY: left=BACK(blue), right=LAY(pink) */}
                <span className={`${isNoYes ? 'bg-odds-lay' : 'bg-odds-back'} text-neutral-gray-900 px-2 py-0.5 rounded font-bold`}>{left}</span>
                <span className={`${isNoYes ? 'bg-odds-back' : 'bg-odds-lay'} text-neutral-gray-900 px-2 py-0.5 rounded font-bold`}>{right}</span>
                <button
                    onClick={onToggle}
                    className="text-white/80 hover:text-white transition-colors w-5 text-center"
                    aria-label={collapsed ? 'Expand section' : 'Collapse section'}
                >
                    {collapsed ? '+' : '−'}
                </button>
            </div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function BettingEventPage() {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();

    // Collapsed state per section type — identical to old-code collapsedSections
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

    const toggleSection = (marketType: string) => {
        setCollapsedSections((prev) => ({ ...prev, [marketType]: !prev[marketType] }));
    };

    // Zustand — replaces Redux selectors
    const currentEvent = useBettingStore((s) => s.currentEvent);
    const grouped = useBettingStore((s) => s.grouped);
    const marketIds = useBettingStore((s) => s.marketIds);
    const loading = useBettingStore((s) => s.grouped !== null && Object.keys(s.grouped).length === 0 && !s.currentEvent);
    const setCurrentEvent = useBettingStore((s) => s.setCurrentEvent);
    const setMarkets = useBettingStore((s) => s.setMarkets);
    const clearMarkets = useBettingStore((s) => s.clearMarkets);

    /**
     * Fetch markets for the event — mirrors old-code marketsSlice.fetchEventMarkets.
     * 1. GET /events/:id/markets  → { data: { grouped, marketIds } }
     * 2. Pre-seed oddsMap from market.liveOdds  (done inside setMarkets in the store)
     * 3. Subscribe to WebSocket for real-time updates
     */
    const fetchMarkets = useCallback(
        async (eid: string) => {
            try {
                const res: any = await bettingApi.getEventMarkets(eid);
                const data = res?.data ?? res;
                const g = data?.grouped ?? {};
                const ids = data?.marketIds ?? [];

                setMarkets(g, ids);

                // Subscribe WebSocket — mirrors marketsSlice which calls bettingWsService.subscribeToMarkets
                if (ids.length > 0) {
                    bettingSocketService.subscribeToMarkets(ids);
                }
            } catch {
                /* silent — page still renders with empty markets */
            }
        },
        [setMarkets]
    );

    useEffect(() => {
        if (!eventId) return;

        // 1) Fetch event details — mirrors old-code dispatch(fetchEventById(eventId))
        bettingApi.getEventById(eventId)
            .then((res: any) => {
                const d = res?.data ?? res;
                setCurrentEvent(d);
            })
            .catch(() => { });

        // 2) Fetch markets + subscribe WS — mirrors dispatch(fetchEventMarkets(eventId))
        fetchMarkets(eventId);

        // 3) Connect /events WS namespace — mirrors bettingWsService.connectEvent(eventId)
        bettingSocketService.connectEvent(eventId);

        // 4) Listen for markets:new browser event from socket service
        //    (fires when server emits 'markets:new', so we re-fetch all markets)
        const handleMarketsNew = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail?.eventId === eventId) fetchMarkets(eventId);
        };
        window.addEventListener('betting:markets-new', handleMarketsNew);

        // Cleanup — mirrors old-code leaveEvent + clearMarkets
        return () => {
            bettingSocketService.leaveEvent(eventId);
            bettingSocketService.unsubscribeFromMarkets(marketIds);
            clearMarkets();
            setCurrentEvent(null);
            window.removeEventListener('betting:markets-new', handleMarketsNew);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId]);

    // ── Sort group entries by MARKET_TYPE_ORDER — identical to old-code ──────
    const groupEntries = Object.entries(grouped).sort(([typeA], [typeB]) => {
        const idxA = MARKET_TYPE_ORDER.indexOf(typeA);
        const idxB = MARKET_TYPE_ORDER.indexOf(typeB);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
    });

    const hasMarkets = groupEntries.length > 0;

    // ── Loading screen — mirrors old-code (!event && loading) ────────────────
    if (!currentEvent && !hasMarkets) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    // ── Event not found — mirrors old-code (!event) ───────────────────────────
    if (!currentEvent) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
                <span className="text-4xl">🔍</span>
                <p className="text-neutral-gray-700 text-sm">Event not found</p>
            </div>
        );
    }

    return (
        <div className="ev-page flex flex-col min-h-full">
            {/* ── Event header bar (ev-top-bar) — dynamic primary color ─ */}
            <div
                className="sticky top-0 z-20 flex items-center gap-3 px-3 py-3 text-white shadow-betting-card bg-brand-primary"
            >
                <button
                    onClick={() => navigate(-1)}
                    className="text-white/80 hover:text-white transition-colors shrink-0 p-0.5"
                    aria-label="Go back"
                >
                    <FiArrowLeft size={20} />
                </button>
                <h1 className="font-display text-sm font-semibold flex-1 truncate leading-tight">
                    {currentEvent.name}
                </h1>
                {/* Live indicator */}
                {currentEvent.isInPlay && (
                    <span className="shrink-0 text-[10px] bg-accent-red text-white font-bold px-1.5 py-0.5 rounded animate-pulse">
                        LIVE
                    </span>
                )}
            </div>


            {/* ── Live scorecard (ev-scorecard) ───────────────────────── */}
            {currentEvent.scorecard && (
                <div
                    className="px-3 py-2 bg-bg-secondary text-white text-xs overflow-x-auto"
                    dangerouslySetInnerHTML={{ __html: currentEvent.scorecard }}
                />
            )}

            {/* ── Score summary — mirrors old-code ev-score-summary ───── */}
            {currentEvent.score && !currentEvent.scorecard && (
                <div className="px-3 py-2 bg-bg-secondary text-white text-xs font-mono">
                    {currentEvent.score}
                </div>
            )}

            {/* ── Market sections (ev-markets) ────────────────────────── */}
            <div className="flex-1 px-2 py-3 space-y-0">
                {groupEntries.map(([marketType, markets]) => {
                    const isSession = SESSION_TYPES.includes(marketType);
                    const collapsed = collapsedSections[marketType] ?? false;

                    /**
                     * Sort markets — mirrors old-code exactly:
                     *   if both have displayId AND both have ballNumber → sort by ballNumber
                     *   else sort by displayId
                     */
                    const sortedMarkets = [...markets].sort((a: any, b: any) => {
                        if (a.displayId !== undefined && b.displayId !== undefined) {
                            if (a.ballNumber !== '' && b.ballNumber !== '') {
                                return Number(a.ballNumber) - Number(b.ballNumber);
                            }
                            return a.displayId - b.displayId;
                        }
                        return 0;
                    });

                    return (
                        <div key={marketType} className="ev-market-section mb-3">
                            {/* Section header bar — ONLY for session types (mirrors old-code isSession check) */}
                            {isSession && (
                                <SessionSectionHeader
                                    marketType={marketType}
                                    collapsed={collapsed}
                                    onToggle={() => toggleSection(marketType)}
                                />
                            )}

                            {/* Market rows — mirrors old-code session vs non-session branching */}
                            {isSession ? (
                                !collapsed && (
                                    <div className="bg-bg-card rounded-b shadow-betting-card overflow-hidden">
                                        {sortedMarkets.map((market: any) =>
                                            market.isActive === true && (
                                                <MarketCard
                                                    key={market.marketId}
                                                    market={market}
                                                    marketType={marketType}
                                                />
                                            )
                                        )}
                                    </div>
                                )
                            ) : (
                                sortedMarkets.map((market: any) =>
                                    market.isActive === true && (
                                        <MarketCard
                                            key={market.marketId}
                                            market={market}
                                            marketType={marketType}
                                        />
                                    )
                                )
                            )}
                        </div>
                    );
                })}

                {/* Empty state — mirrors old-code (!hasMarkets && !loading) */}
                {!hasMarkets && !loading && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                        <span className="text-3xl">📊</span>
                        <p className="text-neutral-gray-700 text-sm">No markets available</p>
                    </div>
                )}
            </div>
        </div>
    );
}
