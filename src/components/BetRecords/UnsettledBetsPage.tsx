import React, { useEffect } from 'react';
import { useToastStore } from '../../store/toastStore';
import { userApi } from '../../api/client';
import { useBetStore } from '../../store/betStore';
import Loader from '../Common/Loader';
import EmptyState from '../Common/EmptyState';
import { FiRefreshCw, FiClock } from 'react-icons/fi';
import { clsx } from 'clsx';

const UnsettledBetsPage: React.FC = () => {
    // STATE — KEEP IDENTICAL
    const { unsettledBets, setUnsettledBets, isLoading, setLoading } = useBetStore();
    const toast = useToastStore();

    // FETCH — KEEP IDENTICAL
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await userApi.getUnsettledBets() as any;
                const data = res?.data?.data || res?.data || [];
                setUnsettledBets(Array.isArray(data) ? data : []);
            } catch (e: any) {
                toast.error(e.message || 'Failed to load unsettled bets');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="min-h-screen bg-bg-primary">
            {/* Page header */}
            <div className="bg-brand-primary px-6 py-5">
                <h1 className="text-xl font-display font-bold text-white tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
                    Unsettled Bets
                </h1>
                <p className="text-sm text-white/60 mt-0.5">Currently open bets awaiting settlement</p>
            </div>

            <div className="p-4 md:p-6">
                <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card overflow-hidden">
                    {/* Card header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-stroke-light bg-bg-light-blue">
                        <div className="flex items-center gap-2">
                            <FiClock className="w-4 h-4 text-brand-text" />
                            <h3 className="text-xs font-semibold text-brand-text uppercase tracking-wider">
                                Open Bets ({unsettledBets.length})
                            </h3>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="py-12 flex justify-center">
                            <Loader text="Loading unsettled bets..." />
                        </div>
                    ) : unsettledBets.length === 0 ? (
                        <EmptyState title="No Unsettled Bets" description="All your bets have been settled." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[600px]">
                                <thead>
                                    <tr className="border-b border-stroke-light bg-bg-light-blue/50">
                                        {['Market', 'Runner', 'Type', 'Odds', 'Stake', 'Placed'].map(h => (
                                            <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold text-brand-text uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {unsettledBets.map((bet: any) => (
                                        <tr key={bet._id}
                                            className={clsx(
                                                'border-b border-stroke-light/50 hover:bg-bg-light-blue transition-colors',
                                                'border-l-2',
                                                bet.side === 'BACK' ? 'border-l-odds-back' : 'border-l-odds-lay'
                                            )}>
                                            <td className="py-2.5 px-3 text-neutral-gray-600 text-xs">{bet.market_name || '-'}</td>
                                            <td className="py-2.5 px-3 font-medium text-neutral-gray-800 text-xs">{bet.runner_name || '-'}</td>
                                            <td className="py-2.5 px-3">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${bet.side === 'BACK' ? 'bg-odds-back/20 text-odds-back' : 'bg-odds-lay/20 text-odds-lay'}`}>
                                                    {bet.side}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 font-mono text-brand-text text-xs">{bet.odds}</td>
                                            <td className="py-2.5 px-3 font-mono text-brand-text text-xs">₹{bet.stake}</td>
                                            <td className="py-2.5 px-3 text-neutral-gray-600 text-xs">
                                                {bet.createdAt ? new Date(bet.createdAt).toLocaleDateString() : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UnsettledBetsPage;
