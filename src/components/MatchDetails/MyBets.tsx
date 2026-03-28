import React, { useEffect, useState } from 'react';

import { FiActivity } from 'react-icons/fi';

import { userApi } from '../../api/client';

interface MyBetsProps {
    eventId: string;
}

interface Bet {
    id: string;
    selectionId: string;
    runnerName: string;
    marketName: string;
    side: 'BACK' | 'LAY';
    odds: number;
    stake: number;
    status?: string;
    createdAt?: string;
    eventId: string;
    matched?: boolean;
}

export const MyBets: React.FC<MyBetsProps> = ({ eventId }) => {
    // STATE — KEEP IDENTICAL
    const [bets, setBets] = useState<Bet[]>([]);
    const [loading, setLoading] = useState(true);

    // FETCH + POLLING — KEEP IDENTICAL
    const fetchBets = async () => {
        try {
            const response = await userApi.getUnsettledBets() as any;
            if (response.success || response.status === 200) {
                let allBets = response.data || [];
                if (!Array.isArray(allBets)) allBets = [];
                const eventBets = allBets.filter((b: any) => b.eventId === eventId || b.event_id === eventId);
                setBets(eventBets);
            }
        } catch (error) {
            console.error('[MyBets] fetch failed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBets();
        const interval = setInterval(fetchBets, 5000);
        return () => clearInterval(interval);
    }, [eventId]);

    if (loading && bets.length === 0) {
        return (
            <div className="bg-bg-card rounded-xl border border-stroke-light p-4 text-center">
                <div className="w-5 h-5 border-2 border-neutral-gray-200 border-t-brand-primary rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-brand-text">Loading bets...</p>
            </div>
        );
    }

    if (bets.length === 0) return null;   // KEEP IDENTICAL: hide when empty

    return (
        <div className="bg-bg-card rounded-xl border border-stroke-light shadow-betting-card overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-bg-light-blue border-b border-stroke-light">
                <div className="flex items-center gap-2">
                    <FiActivity className="w-4 h-4 text-brand-text" />
                    <span className="font-display font-semibold text-sm text-neutral-gray-800">My Bets</span>
                </div>
                <span className="bg-brand-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {bets.length}
                </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-stroke-light bg-bg-light-blue/50">
                            <th className="py-2 px-3 text-left font-semibold text-neutral-gray-700 uppercase tracking-wider">Runner</th>
                            <th className="py-2 px-3 text-center font-semibold text-neutral-gray-700 uppercase tracking-wider">Odds</th>
                            <th className="py-2 px-3 text-center font-semibold text-neutral-gray-700 uppercase tracking-wider">Stake</th>
                            <th className="py-2 px-3 text-right font-semibold text-neutral-gray-700 uppercase tracking-wider">P/L</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stroke-light">
                        {bets.map((bet, index) => (
                            <tr key={index} className="hover:bg-bg-light-blue transition-colors">
                                <td className={`py-2.5 px-3 border-l-2 ${bet.side === 'BACK' ? 'border-odds-back' : 'border-odds-lay'}`}>
                                    <p className="font-medium text-neutral-gray-800 truncate max-w-[100px]">{bet.runnerName}</p>
                                    <p className="text-[10px] text-brand-text truncate max-w-[100px]">{bet.marketName}</p>
                                </td>
                                <td className="py-2.5 px-3 text-center font-mono text-brand-text">{bet.odds}</td>
                                <td className="py-2.5 px-3 text-center font-mono text-brand-text">₹{bet.stake}</td>
                                {/* P&L calculation — KEEP IDENTICAL */}
                                <td className={`py-2.5 px-3 text-right font-mono font-bold ${bet.side === 'BACK' ? 'text-accent-green' : 'text-accent-red'}`}>
                                    {bet.side === 'BACK'
                                        ? `+${(bet.stake * (bet.odds - 1)).toFixed(2)}`
                                        : `-${(bet.stake * (bet.odds - 1)).toFixed(2)}`}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
