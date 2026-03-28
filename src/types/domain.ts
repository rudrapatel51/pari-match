export interface Event {
    id: string; // Changed from eventId to match some responses, or we map it
    eventId?: string; // Some headers use eventId
    name: string; // Changed from eventName
    eventName?: string;
    seriesKey?: string;
    matchType?: string;
    type?: string;
    matchDate?: string;
    startTime?: string; // Used in generic lists
    dateTime?: string;
    sportId?: string;
    score?: any;
    team_two?: string;
    odds?: {
        runner: {
            back_decimal: number;
            lay_decimal: number;
        }[];
    };
}

export interface Runner {
    selectionId: string;
    runnerName: string;
    handicap: number;
    status: string;
    price: {
        back: { price: number; size: number }[];
        lay: { price: number; size: number }[];
    };
    // Additional fields from old code
    backPrice1?: number;
    backSize1?: number;
    backPrice2?: number;
    backSize2?: number;
    backPrice3?: number;
    backSize3?: number;
    layPrice1?: number;
    laySize1?: number;
    layPrice2?: number;
    laySize2?: number;
    layPrice3?: number;
    laySize3?: number;
    secId?: string;
    marketId?: string;
    _id?: string;
    name?: string; // sometimes runnerName is name
    // New fields from socket/old code
    line1?: number;
    line2?: number;
    back?: number; // size for back? or price? In session it's size equivalent?
    lay?: number;
    back_decimal?: number;
    lay_decimal?: number;
}

export interface Market {
    marketId: string;
    marketName: string; // sometimes match_data.name
    marketType: string;
    status: string;
    inplay: boolean;
    totalMatched: number;
    runners: Runner[];
    // Structure from socket/api might differ
    api_key?: string;
    match_data?: {
        name: string;
        events: any[]; // The runners/events inside a market like goals
    };
}

// Old code uses 'match_data' array which contains objects with 'api_key' and 'match_data'
export interface OldCodeMarketObject {
    api_key: string;
    match_data: {
        name: string;
        events: any[]; // This seems to be the list of markets/runners? 
        // Wait, "val.match_data.events.map(i => ...)"
        // i has i.runner.map
    };
}

export interface MatchData {
    event: Event;
    markets: OldCodeMarketObject[]; // We will use the array structure from old code
}

export interface ScoreData {
    score: string; // Or a more specific structure if available
}

export interface PlaceBetRequest {
    stake: number;
    odds: number;
    side: 'BACK' | 'LAY';
    line?: number;
    selectionId: string;
    market_id: string;
    event_id: string;
    m_type: string;
    market_name: string;
    sport_id: number;
    sport_name: string;
    runner_name: string;
    runner_id?: string;
    channelId?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        totalPages: number;
        total: number;
        page?: number;
        limit?: number;
    };
}

// ─── Betting API (new) types ──────────────────────────────────────────────────
// These live here so components, stores and hooks all import from one place.

/** Sport entry returned by /betting/sports */
export interface Sport {
    sportId: number | string;
    name: string;
}

/** A single runner's back/lay odds on a BettingEvent */
export interface EventRunner {
    runnerId: string;
    name: string;
    back?: number | null;
    lay?: number | null;
}

/** Event entry from the betting API (/betting/sports/:id/events etc.) */
export interface BettingEvent {
    eventId: string;
    name: string;
    matchStatus: string;
    hasBookmaker?: boolean;
    tvStream?: string;
    scorecard?: string;
    score?: string;
    startTime?: string;
    isInPlay?: boolean;
    isGameOver?: boolean;
    streamHtml?: string;
    streamUrl?: string;
    matchOdds?: { runners: EventRunner[] };
    league?: string;
}

/** A runner inside a BettingMarket */
export interface MarketRunner {
    runnerId: string;
    name: string;
    metadata?: Record<string, number>;
}

/**
 * Market returned by the betting API.
 * Named BettingMarket to distinguish from the legacy Market type (old
 * cricket/sports API) also defined in this file.
 */
export interface BettingMarket {
    marketId: string;
    eventId: string;
    name: string;
    marketType: string;
    marketStatus?: string;
    isActive: boolean;
    isGameOver?: boolean;
    displayId?: number;
    ballNumber?: string | number;
    infoComments?: string;
    runners?: MarketRunner[];
    liveOdds?: unknown;
}

/** A single item in the bet slip */
export interface BetItem {
    id: string;
    eventId: string;
    marketId: string;
    marketName: string;
    marketType: string;
    runnerId: string;
    runnerName: string;
    betType: 'BACK' | 'LAY';
    odds: number;
    line?: number;
    stake: number;
    oddsChanged?: boolean;
}

/** A settled or active placed bet returned by the betting API */
export interface PlacedBet {
    betId?: string;
    betType: 'BACK' | 'LAY';
    status?: 'MATCHED' | 'WON' | 'LOST' | 'VOID' | 'PENDING';
    runnerName: string;
    marketType: string;
    odds: number;
    stake: number;
}

// ─── Sports store types ───────────────────────────────────────────────────────

/** Generic sport event used across cricket, soccer, tennis and hockey stores */
export interface SportEvent {
    id?: string;
    eventId?: string;
    name?: string;
    eventName?: string;
    seriesKey?: string;
    matchType?: string;
    startTime?: string;
    dateTime?: string;
    sportId?: string;
    score?: unknown;
    team_two?: string;
    inPlay?: boolean;
    odds?: unknown;
}

// ─── Bet records types ────────────────────────────────────────────────────────

/** Pending bet selection held in the old bet-slip flow */
export interface BetSelection {
    eventId: string;
    marketId: string;
    runnerId: string;
    runnerName: string;
    marketName: string;
    marketType: string;
    odds: number;
    side: 'BACK' | 'LAY';
    stake?: number;
}

/** A single bet record from the legacy bet history API */
export interface BetRecord {
    _id: string;
    event_id: string;
    market_id: string;
    runner_name: string;
    market_name: string;
    odds: number;
    stake: number;
    side: 'BACK' | 'LAY';
    status: 'PENDING' | 'WON' | 'LOST' | 'VOID';
    profit_loss?: number;
    createdAt: string;
}

// ─── Notification types ───────────────────────────────────────────────────────

export interface AppNotification {
    _id: string;
    title: string;
    message: string;
    /** Derived client-side: true when is_viewed === 1 */
    is_read: boolean;
    /** 0 = unread, 1 = read — matches API field */
    is_viewed: number;
    is_clicked: boolean;
    status: number;
    type?: string;
    category?: string;
    priority?: string;
    createdAt: string;
}

// ─── Legacy calculation helpers ───────────────────────────────────────────────

export function calculateDisplayOdds(odds: number, marketType: string): number {
    switch (marketType) {
        case 'session':
        case 'bookmaker':
        case 'bookmaker2':
        case 'khado':
            return (Number(odds) + 100) / 100;
        case 'toss':
            return Number(odds) / 100;
        case 'line_market':
            return 2;
        default:
            return Number(odds);
    }
}

export function calculateProfit(stake: number, odds: number, side: 'BACK' | 'LAY', marketType: string): number {
    const displayOdds = calculateDisplayOdds(odds, marketType);
    if (side === 'BACK') {
        return stake * displayOdds;
    } else {
        return stake * (displayOdds - 1);
    }
}

export function calculateLiability(stake: number, odds: number, marketType: string): number {
    const displayOdds = calculateDisplayOdds(odds, marketType);
    return stake * (displayOdds - 1);
}
