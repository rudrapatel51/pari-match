import React, { useEffect, useState, useCallback } from 'react';
import { clsx } from 'clsx';
import { affiliateApi } from '../../api/client';
import { useToastStore } from '../../store/toastStore';
import Loader from '../Common/Loader';
import DateRangeFilter from '../Common/DateRangeFilter';
import { FiTrendingUp, FiTrendingDown, FiArrowDownLeft, FiDollarSign, FiClock, FiCheckCircle } from 'react-icons/fi';
import { EarningsBreakdown, CommissionTypeStats } from '../../types/affiliate';

const formatCurrency = (n: number) =>
    `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type BreakdownType = 'deposit' | 'loss' | 'profit';

const TYPE_CONFIG: Record<BreakdownType, {
    label: string;
    Icon: React.ElementType;
    color: string;
    bg: string;
}> = {
    deposit: { label: 'Deposit Commission', Icon: FiArrowDownLeft, color: 'text-brand-primary',   bg: 'bg-brand-primary/10'   },
    loss:    { label: 'Loss Commission',    Icon: FiTrendingDown,   color: 'text-accent-orange',   bg: 'bg-accent-orange/10'   },
    profit:  { label: 'Profit Commission',  Icon: FiTrendingUp,     color: 'text-accent-green',    bg: 'bg-accent-green/10'    },
};

const EMPTY_STATS: CommissionTypeStats = { count: 0, total: 0, pending: 0, settled: 0 };

const AffiliateEarnings: React.FC = () => {
    const [data, setData] = useState<EarningsBreakdown | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const toast = useToastStore();

    const load = useCallback(async (start: string, end: string) => {
        setLoading(true);
        try {
            const payload: any = {};
            if (start) payload.start_date = start + 'T00:00:00.000Z';
            if (end)   payload.end_date   = end   + 'T23:59:59.999Z';

            // res IS the parsed API body — interceptor returns response.data directly
            // Shape: { success, breakdown: { deposit, loss, profit }, total_earnings, total_pending, total_settled }
            const res: any = await affiliateApi.getEarningsBreakdown(payload);
            setData(res as EarningsBreakdown);
        } catch (e: any) {
            toast.error(e.message || 'Failed to load earnings');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { load(dateRange.start, dateRange.end); }, []);  // eslint-disable-line react-hooks/exhaustive-deps

    const handleApply = () => load(dateRange.start, dateRange.end);

    if (loading) return <Loader text="Loading earnings…" />;

    return (
        <div className="space-y-5">

            {/* Date range filter */}
            <DateRangeFilter
                fromDate={dateRange.start}
                toDate={dateRange.end}
                onFromChange={v => setDateRange(r => ({ ...r, start: v }))}
                onToChange={v => setDateRange(r => ({ ...r, end: v }))}
                onApply={handleApply}
            />

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                    { label: 'Total Earned',   value: data?.total_earnings  ?? 0, Icon: FiDollarSign,    color: 'text-brand-primary',  bg: 'bg-brand-primary/10'  },
                    { label: 'Total Pending',  value: data?.total_pending   ?? 0, Icon: FiClock,         color: 'text-accent-yellow',  bg: 'bg-accent-yellow/10'  },
                    { label: 'Total Settled',  value: data?.total_settled   ?? 0, Icon: FiCheckCircle,   color: 'text-accent-green',   bg: 'bg-accent-green/10'   },
                ].map(c => (
                    <div key={c.label} className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card p-4 flex items-center gap-3">
                        <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', c.bg)}>
                            <c.Icon className={clsx('w-5 h-5', c.color)} />
                        </div>
                        <div>
                            <p className="text-xs text-neutral-gray-700">{c.label}</p>
                            <p className={clsx('font-mono font-bold text-base mt-0.5', c.color)}>
                                {formatCurrency(c.value)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Breakdown cards — one per commission type */}
            <div className="space-y-3">
                <p className="text-xs font-semibold text-neutral-gray-700 uppercase tracking-wider">Breakdown by Type</p>
                {(Object.keys(TYPE_CONFIG) as BreakdownType[]).map(type => {
                    const stats: CommissionTypeStats = data?.breakdown?.[type] ?? EMPTY_STATS;
                    const cfg = TYPE_CONFIG[type];
                    const { Icon } = cfg;

                    return (
                        <div
                            key={type}
                            className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-stroke-light bg-bg-light-blue">
                                <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', cfg.bg)}>
                                    <Icon className={clsx('w-4 h-4', cfg.color)} />
                                </div>
                                <h3 className="text-sm font-semibold text-brand-text font-display">{cfg.label}</h3>
                                <span className="ml-auto text-xs text-neutral-gray-700 font-mono">
                                    {stats.count} record{stats.count !== 1 ? 's' : ''}
                                </span>
                            </div>

                            {/* Stats grid */}
                            <div className="grid grid-cols-3 divide-x divide-stroke-light">
                                <div className="px-4 py-3 text-center">
                                    <p className="text-xs text-neutral-gray-700 mb-1">Total</p>
                                    <p className="font-mono font-bold text-brand-text text-sm">{formatCurrency(stats.total)}</p>
                                </div>
                                <div className="px-4 py-3 text-center">
                                    <p className="text-xs text-neutral-gray-700 mb-1">Pending</p>
                                    <p className="font-mono font-bold text-accent-yellow text-sm">{formatCurrency(stats.pending)}</p>
                                </div>
                                <div className="px-4 py-3 text-center">
                                    <p className="text-xs text-neutral-gray-700 mb-1">Settled</p>
                                    <p className="font-mono font-bold text-accent-green text-sm">{formatCurrency(stats.settled)}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AffiliateEarnings;
