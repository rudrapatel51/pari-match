import { create } from 'zustand';
import type {
    Sport,
    EventRunner,
    BettingEvent,
    MarketRunner,
    BettingMarket,
    BetItem,
    PlacedBet,
} from '../types/domain';

// Re-export for backward compat — components that previously imported these
// types from this file will still resolve correctly.
export type { Sport, EventRunner, BettingEvent, MarketRunner, BetItem, PlacedBet };
/** @deprecated Use BettingMarket from src/types/domain instead */
export type { BettingMarket as Market };

// ─── Store ────────────────────────────────────────────────────────────────────

interface BettingStoreState {
    // Sports tabs
    sports: Sport[];
    setSports: (sports: Sport[]) => void;

    // Home — live events
    liveEvents: BettingEvent[];
    setLiveEvents: (events: BettingEvent[]) => void;

    // Sport page events
    sportEvents: BettingEvent[];
    setSportEvents: (events: BettingEvent[]) => void;

    // Current event (event detail page)
    currentEvent: BettingEvent | null;
    setCurrentEvent: (event: BettingEvent | null) => void;
    updateScorecard: (eventId: string, html: string) => void;

    // Markets (event detail page)
    grouped: Record<string, BettingMarket[]>;
    marketIds: string[];
    oddsMap: Record<string, unknown>;
    setMarkets: (grouped: Record<string, BettingMarket[]>, ids: string[]) => void;
    setOdds: (marketId: string, data: unknown) => void;
    updateMarketStatus: (marketId: string, isActive: boolean, isGameOver: boolean) => void;
    clearMarkets: () => void;

    // Bet Slip
    betItems: BetItem[];
    isBetSlipOpen: boolean;
    isSubmitting: boolean;
    lastResult: unknown[] | null;
    betError: string | null;
    addToBetSlip: (item: Omit<BetItem, 'id' | 'stake'>) => void;
    removeFromBetSlip: (id: string) => void;
    updateStake: (id: string, stake: number) => void;
    updateOdds: (marketId: string, runnerId: string, betType: 'BACK' | 'LAY', newOdds: number, newLine?: number) => void;
    clearBetSlip: () => void;
    toggleBetSlip: () => void;
    setSubmitting: (v: boolean) => void;
    setLastResult: (result: unknown[] | null) => void;
    setBetError: (e: string | null) => void;

    // User balance
    availableBalance: number;
    setBalance: (b: number) => void;

    // My Bets
    activeBets: PlacedBet[];
    settledBets: PlacedBet[];
    setActiveBets: (bets: PlacedBet[]) => void;
    setSettledBets: (bets: PlacedBet[]) => void;

    // Reset all state (call on logout)
    reset: () => void;
}

const INITIAL_STATE = {
    sports: [] as Sport[],
    liveEvents: [] as BettingEvent[],
    sportEvents: [] as BettingEvent[],
    currentEvent: null as BettingEvent | null,
    grouped: {} as Record<string, BettingMarket[]>,
    marketIds: [] as string[],
    oddsMap: {} as Record<string, unknown>,
    betItems: [] as BetItem[],
    isBetSlipOpen: false,
    isSubmitting: false,
    lastResult: null as unknown[] | null,
    betError: null as string | null,
    availableBalance: 0,
    activeBets: [] as PlacedBet[],
    settledBets: [] as PlacedBet[],
};

export const useBettingStore = create<BettingStoreState>((set, get) => ({
    ...INITIAL_STATE,

    // Sports
    setSports: (sports) => set({ sports }),

    // Live events
    setLiveEvents: (events) => set({ liveEvents: events }),

    // Sport events
    setSportEvents: (events) => set({ sportEvents: events }),

    // Current event
    setCurrentEvent: (event) => set({ currentEvent: event }),
    updateScorecard: (eventId, html) =>
        set((s) => ({
            currentEvent:
                s.currentEvent?.eventId === eventId
                    ? { ...s.currentEvent, scorecard: html }
                    : s.currentEvent,
        })),

    // Markets
    setMarkets: (grouped, ids) => {
        const oddsMap: Record<string, unknown> = {};
        Object.values(grouped).forEach((markets) =>
            markets.forEach((m) => {
                if (m.liveOdds) oddsMap[m.marketId] = m.liveOdds;
            })
        );
        set({ grouped, marketIds: ids, oddsMap });
    },
    setOdds: (marketId, data) =>
        set((s) => ({ oddsMap: { ...s.oddsMap, [marketId]: data } })),
    updateMarketStatus: (marketId, isActive, isGameOver) =>
        set((s) => {
            const grouped = { ...s.grouped };
            for (const key of Object.keys(grouped)) {
                const idx = grouped[key].findIndex((m) => m.marketId === marketId);
                if (idx !== -1) {
                    if (isGameOver || !isActive) {
                        grouped[key] = grouped[key].filter((m) => m.marketId !== marketId);
                        if (grouped[key].length === 0) delete grouped[key];
                    } else {
                        grouped[key] = grouped[key].map((m) =>
                            m.marketId === marketId ? { ...m, isActive } : m
                        );
                    }
                    break;
                }
            }
            const oddsMap = { ...s.oddsMap };
            if (isGameOver) delete oddsMap[marketId];
            return { grouped, oddsMap };
        }),
    clearMarkets: () => set({ grouped: {}, marketIds: [], oddsMap: {} }),

    // Bet Slip
    addToBetSlip: (item) =>
        set((s) => {
            const exists = s.betItems.find(
                (i) => i.marketId === item.marketId && i.runnerId === item.runnerId && i.betType === item.betType
            );
            if (exists) return s;
            return {
                betItems: [...s.betItems, { ...item, id: crypto.randomUUID(), stake: 100 }],
                isBetSlipOpen: true,
            };
        }),
    removeFromBetSlip: (id) =>
        set((s) => ({ betItems: s.betItems.filter((i) => i.id !== id) })),
    updateStake: (id, stake) =>
        set((s) => ({
            betItems: s.betItems.map((i) => (i.id === id ? { ...i, stake } : i)),
        })),
    updateOdds: (marketId, runnerId, betType, newOdds, newLine?) =>
        set((s) => {
            const safeOdds = Number(newOdds);
            if (isNaN(safeOdds) || safeOdds <= 0) return s;
            return {
                betItems: s.betItems.map((i) => {
                    if (i.marketId === marketId && i.runnerId === runnerId && i.betType === betType) {
                        let changed = i.odds !== safeOdds;
                        const update: Partial<BetItem> = { odds: safeOdds };
                        if (newLine !== undefined) {
                            const safeLine = Number(newLine);
                            if (!isNaN(safeLine) && i.line !== safeLine) {
                                changed = true;
                                update.line = safeLine;
                            }
                        }
                        return { ...i, ...update, oddsChanged: changed };
                    }
                    return i;
                }),
            };
        }),
    clearBetSlip: () => set({ betItems: [], lastResult: null, betError: null }),
    toggleBetSlip: () => set((s) => ({ isBetSlipOpen: !s.isBetSlipOpen })),
    setSubmitting: (v) => set({ isSubmitting: v }),
    setLastResult: (result) => set({ lastResult: result }),
    setBetError: (e) => set({ betError: e }),

    // User balance
    setBalance: (b) => set({ availableBalance: b }),

    // My Bets
    setActiveBets: (bets) => set({ activeBets: bets }),
    setSettledBets: (bets) => set({ settledBets: bets }),

    // Reset
    reset: () => set(INITIAL_STATE),
}));
