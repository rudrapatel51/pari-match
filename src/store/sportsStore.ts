import { create } from 'zustand';
import type { SportEvent } from '../types/domain';

export type { SportEvent };

interface SportsState {
    cricketMatches: SportEvent[];
    soccerMatches: SportEvent[];
    tennisMatches: SportEvent[];
    hockeyMatches: SportEvent[];
    inPlayEvents: SportEvent[];
    upcomingCricket: SportEvent[];
    isLoading: boolean;
    error: string | null;

    setCricketMatches: (matches: SportEvent[]) => void;
    setSoccerMatches: (matches: SportEvent[]) => void;
    setTennisMatches: (matches: SportEvent[]) => void;
    setHockeyMatches: (matches: SportEvent[]) => void;
    setInPlayEvents: (events: SportEvent[]) => void;
    setUpcomingCricket: (events: SportEvent[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    reset: () => void;
}

const INITIAL_STATE = {
    cricketMatches: [] as SportEvent[],
    soccerMatches: [] as SportEvent[],
    tennisMatches: [] as SportEvent[],
    hockeyMatches: [] as SportEvent[],
    inPlayEvents: [] as SportEvent[],
    upcomingCricket: [] as SportEvent[],
    isLoading: false,
    error: null as string | null,
};

export const useSportsStore = create<SportsState>((set) => ({
    ...INITIAL_STATE,

    setCricketMatches: (matches) => set({ cricketMatches: matches }),
    setSoccerMatches: (matches) => set({ soccerMatches: matches }),
    setTennisMatches: (matches) => set({ tennisMatches: matches }),
    setHockeyMatches: (matches) => set({ hockeyMatches: matches }),
    setInPlayEvents: (events) => set({ inPlayEvents: events }),
    setUpcomingCricket: (events) => set({ upcomingCricket: events }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),

    reset: () => set(INITIAL_STATE),
}));
