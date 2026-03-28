/**
 * Raw game record as returned by the franchise/casino games API.
 * Used in casino page grids and game lists before UI enrichment.
 */
export interface CasinoRawGame {
    id: string;
    title: string;
    image: string;
    provider: string;
    url_thumb?: string;
    game_name?: string;
    provider_name?: string;
    min_bet?: string | number;
    max_bet?: string | number;
    currency?: string;
}

/**
 * Enriched game type consumed by CasinoGameCard and game-grid components.
 * Fields use camelCase and are normalised from CasinoRawGame or API data.
 */
export interface CasinoGame {
    id: string;
    title: string;
    image: string;
    provider?: string;
    providerLogo?: string;
    minBet?: number;
    maxBet?: number;
    currency?: string;
    isLive?: boolean;
    hasPromo?: boolean;
    hasCashback?: boolean;
}

/** Casino game category (id + display name) */
export interface CasinoCategory {
    id: string;
    name: string;
}

/** Casino / game provider (for filter dropdowns and provider lists) */
export interface CasinoProvider {
    name: string;
    logo?: string;
    gameCount?: number;
}
