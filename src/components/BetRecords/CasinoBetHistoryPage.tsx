import React, { useEffect, useState } from 'react';
import { useToastStore } from '../../store/toastStore';
import { casinoApi } from '../../api/client';
import Loader from '../Common/Loader';
import EmptyState from '../Common/EmptyState';
import Pagination from '../Common/Pagination';
import { FiArrowUpRight, FiArrowDownLeft, FiGrid } from 'react-icons/fi';

const CasinoBetHistoryPage: React.FC = () => {
    // STATE — KEEP IDENTICAL
    const toast = useToastStore();
    const [bets, setBets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // FETCH — KEEP IDENTICAL
    useEffect(() => {
        setLoading(true);
        casinoApi.getCasinoBets({ page, limit: 20 }).then((res: any) => {
            const data = res?.data?.data || res?.data || {};
            setBets(Array.isArray(data) ? data : data.bets || data.items || []);
            setTotalPages(data.totalPages || data.total_pages || 1);
        }).catch((e: any) => toast.error(e?.message || 'Failed to load casino bets')).finally(() => setLoading(false));
    }, [page]);

    return (
        <div className="min-h-screen bg-bg-primary">
            {/* Page header */}
            <div className="bg-brand-primary px-6 py-5">
                <h1 className="text-xl font-display font-bold text-white tracking-wide">Casino Bet History</h1>
                <p className="text-sm text-white/60 mt-0.5">All your casino game bets</p>
            </div>

            <div className="p-4 md:p-6">
                <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card overflow-hidden">
                    {/* Card header */}
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-stroke-light bg-bg-light-blue">
                        <FiGrid className="w-4 h-4 text-brand-text" />
                        <h3 className="text-xs font-semibold text-brand-text uppercase tracking-wider">Casino Bets</h3>
                    </div>

                    {loading ? (
                        <div className="py-12 flex justify-center">
                            <Loader text="Loading casino bets..." />
                        </div>
                    ) : bets.length === 0 ? (
                        <EmptyState title="No Casino Bets" description="You haven't placed any casino bets yet." />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm min-w-[560px]">
                                    <thead>
                                        <tr className="border-b border-stroke-light bg-bg-light-blue/50">
                                            {['Game', 'Bet Amount', 'Win Amount', 'Result', 'Date'].map(h => (
                                                <th key={h} className="text-left py-2.5 px-4 text-xs font-semibold text-brand-text uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stroke-light/50">
                                        {bets.map((bet: any, i: number) => {
                                            const isWin = (bet.win_amount || bet.winAmount || 0) > 0;
                                            const gameName = bet.game_name || bet.gameName || 'Casino';
                                            const firstLetter = gameName.charAt(0).toUpperCase();
                                            return (
                                                <tr key={bet._id || i} className="hover:bg-bg-light-blue transition-colors">
                                                    {/* Game with avatar */}
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                                                                <span className="text-xs font-bold text-brand-text">{firstLetter}</span>
                                                            </div>
                                                            <span className="font-medium text-brand-text text-xs truncate max-w-[100px]">{gameName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 font-mono text-neutral-gray-600 text-xs">
                                                        ₹{bet.bet_amount || bet.betAmount || 0}
                                                    </td>
                                                    <td className={`py-3 px-4 font-mono font-semibold text-xs ${isWin ? 'text-accent-green' : 'text-neutral-gray-600'}`}>
                                                        ₹{bet.win_amount || bet.winAmount || 0}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${isWin ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'}`}>
                                                            {isWin
                                                                ? <><FiArrowUpRight className="w-3 h-3" />WIN</>
                                                                : <><FiArrowDownLeft className="w-3 h-3" />LOSS</>
                                                            }
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-neutral-gray-600 text-xs">
                                                        {bet.createdAt ? new Date(bet.createdAt).toLocaleDateString('en-IN') : '—'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-4 py-3 border-t border-stroke-light">
                                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CasinoBetHistoryPage;
