// Type definitions for the sports betting application

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  isLive: boolean;
  startTime: string;
  sport: string;
  tournament: string;
  odds: OddsSet;
  flag?: string;
}

export interface OddsSet {
  home: number;
  draw?: number;
  away: number;
  homeX?: number;
  homeAway?: number;
  awayX?: number;
  over?: number;
  under?: number;
}

export interface Competition {
  id: string;
  name: string;
  icon: string;
  matchCount: number;
  isLive?: boolean;
}

export interface GameCategory {
  id: string;
  name: string;
  image: string;
  link: string;
}

export interface BetSlipItem {
  matchId: string;
  selection: string;
  odds: number;
  stake: number;
}

export interface AccumulatorBet {
  id: string;
  title: string;
  matches: {
    homeTeam: string;
    awayTeam: string;
    selection: string;
    odds: number;
  }[];
  totalOdds: number;
}

export interface NavigationItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
  badge?: string;
}

export interface SportFilter {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
}
