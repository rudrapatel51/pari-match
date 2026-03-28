import React, { useState, useEffect, useCallback } from 'react';
import { useToastStore } from '../../store/toastStore';
import { userApi } from '../../api/client';
import { useBetStore } from '../../store/betStore';
import Loader from '../Common/Loader';
import EmptyState from '../Common/EmptyState';
import DateRangeFilter from '../Common/DateRangeFilter';
import { clsx } from 'clsx';
import { FiTrendingUp, FiTrendingDown, FiBarChart2 } from 'react-icons/fi';

/** Returns "YYYY-MM-DD" for a date `daysAgo` days before today — KEEP IDENTICAL */
function daysAgoISO(daysAgo: number): string {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
}

const ProfitLossPage: React.FC = () => {
    // STATE — KEEP IDENTICAL
    const { profitLoss, setProfitLoss, isLoading, setLoading } = useBetStore();
    const [fromDate, setFromDate] = useState(daysAgoISO(30));
    const [toDate, setToDate] = useState(daysAgoISO(0));
    const toast = useToastStore();

    // FETCH — KEEP IDENTICAL
    const loadData = useCallback(async (from: string, to: string) => {
        setLoading(true);
        try {
            const res = await userApi.getProfitLoss({ from_date: from, to_date: to }) as any;
            const data = res?.data?.data || res?.data || [];
            setProfitLoss(Array.isArray(data) ? data : []);
        } catch (e: any) {
            toast.error(e.message || 'Failed to load P&L data');
        } finally {
            setLoading(false);
        }
    }, [setLoading, setProfitLoss]);

    useEffect(() => {
        loadData(fromDate, toDate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleApply = () => loadData(fromDate, toDate);

    // TOTAL P&L — KEEP IDENTICAL
    const totalPL = profitLoss.reduce((sum: number, r: any) => sum + (parseFloat(r.profit_loss) || 0), 0);
    const maxAbsPL = profitLoss.length > 0
        ? Math.max(...profitLoss.map((r: any) => Math.abs(parseFloat(r.profit_loss) || 0)))
        : 1;

    return (
        <div className="min-h-screen bg-bg-primary">
            {/* Page header */}
            <div className="bg-brand-primary px-6 py-5">
                <h1 className="text-xl font-display font-bold text-white tracking-wide">Profit &amp; Loss</h1>
                <p className="text-sm text-white/60 mt-0.5">Track your betting performance over time</p>
            </div>

            <div className="p-4 md:p-6">
                {/* Date filter card */}
                <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card p-4 md:p-5 mb-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                            <FiBarChart2 className="w-4 h-4 text-brand-text" />
                        </div>
                        <h2 className="font-display font-semibold text-base text-neutral-gray-800">Date Range</h2>
                    </div>
                    <DateRangeFilter
                        fromDate={fromDate} toDate={toDate}
                        onFromChange={setFromDate} onToChange={setToDate}
                        onApply={handleApply}
                    />
                </div>

                {/* Total P&L summary card */}
                {profitLoss.length > 0 && (
                    <div className={clsx(
                        'mb-5 p-5 rounded-xl border flex items-center gap-4',
                        totalPL >= 0
                            ? 'bg-accent-green/10 border-accent-green/30'
                            : 'bg-accent-red/10 border-accent-red/30'
                    )}>
                        <div className={clsx(
                            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                            totalPL >= 0 ? 'bg-accent-green/20' : 'bg-accent-red/20'
                        )}>
                            {totalPL >= 0
                                ? <FiTrendingUp className="w-6 h-6 text-accent-green" />
                                : <FiTrendingDown className="w-6 h-6 text-accent-red" />
                            }
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-brand-text uppercase tracking-wider mb-0.5">Total P&amp;L</p>
                            <p className={clsx(
                                'text-2xl font-bold font-mono',
                                totalPL >= 0 ? 'text-accent-green' : 'text-accent-red'
                            )}>
                                {totalPL >= 0 ? '+' : ''}₹{Math.abs(totalPL).toFixed(2)}
                            </p>
                        </div>
                    </div>
                )}

                {/* Table card */}
                <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card overflow-hidden">
                    {isLoading ? (
                        <div className="py-12 flex justify-center">
                            <Loader text="Loading profit &amp; loss..." />
                        </div>
                    ) : profitLoss.length === 0 ? (
                        <EmptyState
                            title="No Data"
                            description="No P&L records found for the selected date range."
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[520px]">
                                <thead>
                                    <tr className="bg-bg-light-blue border-b border-stroke-light">
                                        {['Event / Market', 'Bets', 'Stake', 'P&L', 'Date'].map(h => (
                                            <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold text-brand-text uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stroke-light/50">
                                    {profitLoss.map((r: any, i: number) => {
                                        const pl = parseFloat(r.profit_loss) || 0;
                                        const barWidth = maxAbsPL > 0 ? Math.round((Math.abs(pl) / maxAbsPL) * 100) : 0;
                                        return (
                                            <tr key={i} className="hover:bg-bg-light-blue transition-colors">
                                                <td className="py-2.5 px-3 text-brand-text max-w-[200px] truncate text-xs">
                                                    {r.event_name || r.market_name || '—'}
                                                </td>
                                                <td className="py-2.5 px-3 text-brand-text text-xs">{r.bets_count || '—'}</td>
                                                <td className="py-2.5 px-3 font-mono text-neutral-gray-600 text-xs">
                                                    ₹{parseFloat(r.total_stake || 0).toFixed(2)}
                                                </td>
                                                <td className="py-2.5 px-3 text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className={clsx('font-mono font-semibold', pl >= 0 ? 'text-accent-green' : 'text-accent-red')}>
                                                            {pl >= 0 ? '+' : ''}₹{Math.abs(pl).toFixed(2)}
                                                        </span>
                                                        {barWidth > 0 && (
                                                            <div className="flex-1 max-w-[60px] h-1.5 bg-bg-light-blue rounded-full overflow-hidden">
                                                                <div
                                                                    className={clsx('h-full rounded-full', pl >= 0 ? 'bg-accent-green' : 'bg-accent-red')}
                                                                    style={{ width: `${barWidth}%` }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-2.5 px-3 text-neutral-gray-600 text-xs">
                                                    {r.date ? new Date(r.date).toLocaleDateString('en-IN') : '—'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfitLossPage;
