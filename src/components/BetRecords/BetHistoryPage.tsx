import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { FiActivity, FiInbox } from 'react-icons/fi';
import { userApi } from '../../api/client';
import { useBetStore } from '../../store/betStore';
import { useToastStore } from '../../store/toastStore';
import Loader from '../Common/Loader';
import Pagination from '../Common/Pagination';
import DateRangeFilter from '../Common/DateRangeFilter';
import EmptyState from '../Common/EmptyState';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format ISO date → "22 Mar 2026, 09:36" */
function formatDate(iso?: string): string {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleString('en-IN', {
            day:    '2-digit',
            month:  'short',
            year:   'numeric',
            hour:   '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    } catch {
        return iso;
    }
}

/** Human-readable market type label */
function getMarketLabel(mType: string): string {
    const MAP: Record<string, string> = {
        'match-odd': 'Match Odds',
        'session':   'Session',
        'odd-even':  'Odd / Even',
        'bookmaker': 'Bookmaker',
        'fancy1':    'Fancy',
    };
    return MAP[mType] ?? (mType || '—');
}

/** Derive display status from bet object */
function getStatus(bet: any): string {
    if (bet.result === 'pending') return 'PENDING';
    return bet.isWin ? 'WON' : 'LOST';
}

/** Net P&L value (positive = profit, negative = loss) */
function getProfitLoss(bet: any): number {
    if (bet.result === 'pending') return 0;
    return bet.isWin ? Number(bet.profit) : -Number(bet.loss);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** BACK / LAY pill badge */
const BetTypePill: React.FC<{ type: string }> = ({ type }) => (
    <span className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase',
        type === 'BACK'
            ? 'bg-odds-back text-white'
            : 'bg-odds-lay text-white'
    )}>
        {type}
    </span>
);

/** WON / LOST / PENDING / VOID status badge */
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const styles: Record<string, string> = {
        WON:     'bg-accent-green/15 text-accent-green border border-accent-green/30',
        LOST:    'bg-accent-red/15 text-accent-red border border-accent-red/30',
        /*
          VOID: use brand-text/40 bg + brand-text/60 text so it reads in both themes.
          neutral-gray tokens are unreliable due to auto-generated scale from applyTheme.ts.
        */
        VOID:    'bg-brand-text/10 text-brand-text/60 border border-brand-text/20',
        PENDING: 'bg-accent-yellow/15 text-accent-yellow border border-accent-yellow/30',
    };
    return (
        <span className={clsx(
            'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase',
            styles[status.toUpperCase()] ?? styles.PENDING
        )}>
            {status}
        </span>
    );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const BetHistoryPage: React.FC = () => {
    const { betHistory, setBetHistory, totalPages, isLoading, setLoading } = useBetStore();
    const [page,     setPage]     = useState(1);
    const [fromDate, setFromDate] = useState('');
    const [toDate,   setToDate]   = useState('');
    const toast = useToastStore();

    const loadBets = async (p = page) => {
        setLoading(true);
        try {
            const res   = await userApi.getBetHistory({ page: p, from_date: fromDate, to_date: toDate }) as any;
            const data  = res?.table?.data || [];
            const pages = res?.table?.pagination?.totalPages || 1;
            setBetHistory(Array.isArray(data) ? data : [], pages);
        } catch (e: any) {
            toast.error(e.message || 'Failed to load bet history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadBets(1); }, []);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-bg-primary">

            {/* ── Page header ── */}
            <div className="bg-brand-primary px-6 py-5">
                <h1 className="text-xl font-display font-bold text-white tracking-wide">
                    Bet History
                </h1>
                <p className="text-sm text-white/70 mt-0.5">
                    View all your settled sports bets
                </p>
            </div>

            <div className="p-4 md:p-6 space-y-4">

                {/* ── Filter card ── */}
                <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card p-4 md:p-5">
                    <div className="flex items-center gap-2 mb-4">
                        {/*
                          FIX: bg-brand-primary/10 → bg-brand-primary-dark
                          In dark mode brand-primary/10 = barely-there navy overlay = invisible.
                          brand-primary-dark is an explicit dark surface token = always visible.
                        */}
                        <div className="w-8 h-8 rounded-lg bg-brand-primary-dark flex items-center justify-center">
                            <FiActivity className="w-4 h-4 text-white" />
                        </div>
                        {/*
                          FIX: text-neutral-gray-800 → text-brand-text
                          neutral-gray-800 in dark mode = very light (near white) — fine.
                          But text-brand-text is the canonical "readable heading" token.
                        */}
                        <h2 className="font-display font-semibold text-base text-brand-text">
                            Filter Results
                        </h2>
                    </div>
                    <DateRangeFilter
                        fromDate={fromDate}
                        toDate={toDate}
                        onFromChange={setFromDate}
                        onToChange={setToDate}
                        onApply={() => { setPage(1); loadBets(1); }}
                    />
                </div>

                {/* ── Table card ── */}
                <div className="bg-bg-card border border-stroke-light rounded-xl shadow-betting-card overflow-hidden">

                    {isLoading ? (
                        <div className="py-16 flex justify-center">
                            <Loader text="Loading bet history..." />
                        </div>

                    ) : betHistory.length === 0 ? (
                        <EmptyState
                            title="No Bet History"
                            description="Your past bets will appear here."
                            icon={<FiInbox className="w-10 h-10" />}
                        />

                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm min-w-[720px]">

                                    {/* ── Table header ── */}
                                    <thead>
                                        <tr className="bg-brand-primary-dark border-b border-stroke-light">
                                            {['Event', 'Market', 'Runner', 'Type', 'Odds', 'Stake', 'P&L', 'Status', 'Date'].map(h => (
                                                <th
                                                    key={h}
                                                    className="text-left py-3 px-3 text-[10px] font-bold text-white/70 uppercase tracking-wider whitespace-nowrap"
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    {/* ── Table body ── */}
                                    <tbody className="divide-y divide-stroke-light">
                                        {betHistory.map((bet: any, idx: number) => (
                                            <tr
                                                key={bet.id ?? idx}
                                                className={clsx(
                                                    'transition-colors hover:bg-bg-light-blue',
                                                    /*
                                                      FIX: bg-bg-light-blue/30 alternate rows.
                                                      In dark mode /30 opacity = near-invisible.
                                                      Use bg-bg-primary (page canvas) for odd rows —
                                                      slight but always-visible contrast against bg-bg-card.
                                                    */
                                                    idx % 2 !== 0 ? 'bg-bg-primary' : 'bg-bg-card'
                                                )}
                                            >
                                                {/* Event / sport name */}
                                                <td className="py-3 px-3 max-w-[130px]">
                                                    <span className="text-brand-text font-medium text-xs truncate block">
                                                        {bet.sport_name || '—'}
                                                    </span>
                                                </td>

                                                {/* Market type */}
                                                <td className="py-3 px-3 text-brand-text text-xs whitespace-nowrap">
                                                    {getMarketLabel(bet.m_type)}
                                                </td>

                                                {/* Runner / description */}
                                                <td className="py-3 px-3 max-w-[140px]">
                                                    <span className="text-brand-text font-semibold text-xs truncate block">
                                                        {bet.description || '—'}
                                                    </span>
                                                </td>

                                                {/* Bet type pill */}
                                                <td className="py-3 px-3">
                                                    <BetTypePill type={bet.bet_type} />
                                                </td>

                                                {/* Odds */}
                                                <td className="py-3 px-3 font-mono text-brand-text text-xs tabular-nums">
                                                    {bet.rate ?? '—'}
                                                </td>

                                                {/* Stake */}
                                                <td className="py-3 px-3 font-mono text-brand-text text-xs tabular-nums">
                                                    ₹{bet.stake ?? '—'}
                                                </td>

                                                {/* P&L */}
                                                <td className={clsx(
                                                    'py-3 px-3 font-mono font-semibold text-xs tabular-nums',
                                                    getProfitLoss(bet) > 0
                                                        ? 'text-accent-green'
                                                        : getProfitLoss(bet) < 0
                                                            ? 'text-accent-red'
                                                            : 'text-brand-text/40'
                                                )}>
                                                    {getProfitLoss(bet) !== 0
                                                        ? `${getProfitLoss(bet) > 0 ? '+' : ''}₹${Math.abs(getProfitLoss(bet)).toFixed(2)}`
                                                        : '—'
                                                    }
                                                </td>

                                                {/* Status badge */}
                                                <td className="py-3 px-3">
                                                    <StatusBadge status={getStatus(bet)} />
                                                </td>

                                                {/* Date
                                                    FIX: text-neutral-gray-500 was invisible in light theme.
                                                    Root cause: applyTheme.ts generateNeutralScale() derives
                                                    grays from bgPrimary (#D4DEE8 in light theme), so
                                                    neutral-gray-500 becomes a light blue-gray that blends
                                                    into the white bgCard — near-invisible.
                                                    FIX: text-brand-text/60 — brand-text is always the
                                                    readable text color for the current theme (#09467B light,
                                                    #ffffff dark). At 60% opacity it reads as secondary/muted
                                                    while staying visible in BOTH themes.
                                                */}
                                                <td className="py-3 px-3 text-xs whitespace-nowrap tabular-nums text-brand-text/60">
                                                    {formatDate(bet.createdAt)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-4 py-3 border-t border-stroke-light bg-bg-card">
                                <Pagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    onPageChange={(p) => { setPage(p); loadBets(p); }}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BetHistoryPage;