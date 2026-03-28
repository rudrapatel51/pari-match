import { create } from 'zustand';
import type { BetRecord, BetSelection } from '../types/domain';

export type { BetRecord, BetSelection };

interface BetState {
    betHistory: BetRecord[];
    unsettledBets: BetRecord[];
    profitLoss: unknown[];
    totalPages: number;
    isLoading: boolean;

    setBetHistory: (bets: BetRecord[], totalPages?: number) => void;
    setUnsettledBets: (bets: BetRecord[]) => void;
    setProfitLoss: (data: unknown[]) => void;
    setLoading: (loading: boolean) => void;

    reset: () => void;
}

const INITIAL_STATE = {
    betHistory: [] as BetRecord[],
    unsettledBets: [] as BetRecord[],
    profitLoss: [] as unknown[],
    totalPages: 1,
    isLoading: false,
};

export const useBetStore = create<BetState>((set) => ({
    ...INITIAL_STATE,

    setBetHistory: (bets, totalPages = 1) => set({ betHistory: bets, totalPages }),
    setUnsettledBets: (bets) => set({ unsettledBets: bets }),
    setProfitLoss: (data) => set({ profitLoss: data }),
    setLoading: (loading) => set({ isLoading: loading }),

    reset: () => set(INITIAL_STATE),
}));
