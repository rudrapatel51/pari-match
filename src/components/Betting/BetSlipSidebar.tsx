import { useState } from 'react';
import { FiX, FiTrash2, FiTv } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useBettingStore } from '../../store/bettingStore';
import { useToastStore } from '../../store/toastStore';
import { userApi } from '../../api/client';

const QUICK_STAKES = [100, 500, 1000, 5000];

const SESSION_MARKET_TYPES = [
    'session', 'fancy', 'fancy1', 'ball-by-ball',
    'meter', 'bookmaker', 'bookmaker2', 'khado',
];

export default function BetSlipSidebar() {
    const {
        betItems, isBetSlipOpen, isSubmitting, lastResult, betError, availableBalance,
        removeFromBetSlip, updateStake, clearBetSlip, toggleBetSlip,
        setSubmitting, setLastResult, setBetError,
    } = useBettingStore();

    // Read currentEvent.tvStream from store — mirrors old-code useSelector(s => s.bettingEvents.currentEvent)
    const currentEvent = useBettingStore((s) => s.currentEvent);
    const location = useLocation();
    const isEventPage = /\/betting\/event\//.test(location.pathname);

    const [acceptOddsChanges, setAcceptOddsChanges] = useState(false);
    const [tvExpanded, setTvExpanded] = useState(true);

    const totalStake = betItems.reduce((s, i) => s + (Number(i.stake) || 0), 0);
    const totalReturn = betItems.reduce((sum, i) => {
        const isSession = SESSION_MARKET_TYPES.includes((i.marketType || '').toLowerCase());
        if (isSession) return i.betType === 'BACK' ? sum + (i.odds * i.stake) / 100 + i.stake : sum + i.stake;
        return i.betType === 'BACK' ? sum + (i.odds - 1) * i.stake + i.stake : sum + i.stake;
    }, 0);
    const totalLiability = betItems.reduce((sum, i) => {
        const isSession = SESSION_MARKET_TYPES.includes((i.marketType || '').toLowerCase());
        if (isSession) return i.betType === 'BACK' ? sum + i.stake : sum + (i.odds * i.stake) / 100;
        return i.betType === 'LAY' ? sum + (i.odds - 1) * i.stake : sum + i.stake;
    }, 0);

    const hasOddsChanged = betItems.some((i) => i.oddsChanged);
    const canSubmit =
        betItems.length > 0 &&
        totalStake > 0 &&
        (!hasOddsChanged || acceptOddsChanges) &&
        !isSubmitting;

    const handlePlaceBets = async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        setBetError(null);
        try {
            const results = await Promise.all(
                betItems.map((bet) => {
                    const isSession = SESSION_MARKET_TYPES.includes((bet.marketType || '').toLowerCase());
                    const payload: Record<string, any> = {
                        market_id:   bet.marketId,
                        event_id:    bet.eventId,
                        m_type:      bet.marketType,
                        market_name: bet.marketName,
                        side:        bet.betType,
                        stake:       bet.stake,
                        odds:        bet.odds,
                        runner_id:   bet.runnerId,
                        selectionId: bet.runnerId,
                        runner_name: bet.runnerName,
                        line:        bet.line ?? 0,
                    };
                    if (isSession) {
                        payload.selection = bet.betType === 'BACK' ? 'YES' : 'NO';
                        payload.rate = bet.odds;
                    }
                    return userApi.placeBet(payload);
                })
            );
            setLastResult(results);
            useBettingStore.getState().clearBetSlip();
            useToastStore.getState().success(`${betItems.length} bet${betItems.length > 1 ? 's' : ''} placed successfully`);
        } catch (err: any) {
            const msg = err.message || 'Bet placement failed';
            setBetError(msg);
            useToastStore.getState().error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* Float button */}
            {betItems.length > 0 && !isBetSlipOpen && (
                <button
                    onClick={toggleBetSlip}
                    className="fixed bottom-20 right-4 z-50 bg-brand-primary text-white rounded-full px-4 py-2.5 shadow-elevated font-display text-sm font-bold flex items-center gap-2 hover:bg-brand-primary-light transition-colors"
                >
                    <span className="bg-accent-yellow text-neutral-gray-900 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
                        {betItems.length}
                    </span>
                    BET SLIP
                </button>
            )}

            {/* Overlay */}
            {isBetSlipOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={toggleBetSlip}
                />
            )}

            {/* Sidebar */}
            <aside
                className={clsx(
                    'fixed right-0 top-0 h-full w-80 bg-bg-card shadow-elevated z-50 flex flex-col transition-transform duration-300',
                    isBetSlipOpen ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                {/* ── Live TV panel (top of aside) — mirrors old-code LiveTV component ─ */}
                {isEventPage && currentEvent?.tvStream && (
                    /* Use --color-surface-dark: always dark in both light and dark mode.
                       neutral-gray-900 inverts (becomes near-white in dark mode), so we
                       use the non-inverting surface-dark token instead. */
                    <div style={{ background: 'var(--color-surface-dark)' }} className="overflow-hidden">
                        {/* Header bar — click to toggle */}
                        <div
                            style={{ background: 'rgba(255,255,255,0.07)' }}
                            className="flex items-center justify-between px-3 py-2 cursor-pointer"
                            onClick={() => setTvExpanded((v) => !v)}
                        >
                            <span className="text-xs font-semibold tracking-wide" style={{ color: 'rgba(255,255,255,0.85)' }}>Live TV</span>
                            <FiTv size={14} style={{ color: 'rgba(255,255,255,0.45)' }} />
                        </div>
                        {/* iframe embed */}
                        {tvExpanded && (
                            <div
                                className="w-full bg-black"
                                dangerouslySetInnerHTML={{ __html: currentEvent.tvStream }}
                            />
                        )}
                    </div>
                )}

                {/* ── Bet Slip Header ── */}
                <div className="flex items-center justify-between px-4 py-3 text-white shrink-0 bg-brand-primary">
                    <h2 className="font-display font-semibold text-base tracking-wide flex items-center gap-2">
                        BET SLIP
                        <span className="bg-accent-yellow text-neutral-gray-900 text-xs font-black px-2 py-0.5 rounded-full">
                            {betItems.length}
                        </span>
                    </h2>
                    <div className="flex items-center gap-2">
                        {betItems.length > 0 && (
                            <button onClick={clearBetSlip} className="text-white/70 hover:text-white text-xs flex items-center gap-1 transition-colors">
                                <FiTrash2 size={14} /> Clear
                            </button>
                        )}
                        <button onClick={toggleBetSlip} className="text-white/80 hover:text-white transition-colors">
                            <FiX size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Success screen */}
                    {lastResult && (
                        <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
                            <div className="w-16 h-16 bg-accent-green rounded-full flex items-center justify-center">
                                <span className="text-white text-2xl">✓</span>
                            </div>
                            <h3 className="font-display text-lg font-bold text-neutral-gray-900">Bets Placed!</h3>
                            <p className="text-neutral-gray-700 text-sm">
                                {Array.isArray(lastResult) ? lastResult.length : 1} bet(s) placed successfully
                            </p>
                            <button onClick={() => { useBettingStore.getState().setLastResult(null); toggleBetSlip(); }} className="btn-primary w-full">
                                Done
                            </button>
                        </div>
                    )}

                    {/* Empty */}
                    {!lastResult && betItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 gap-3 p-6 text-center">
                            <span className="text-4xl">🎯</span>
                            <p className="text-neutral-gray-700 text-sm">Click any odds to add selections</p>
                        </div>
                    )}

                    {/* Bet items */}
                    {!lastResult && betItems.length > 0 && (
                        <div className="p-3 space-y-3">
                            {betItems.map((item) => {
                                const isSessionItem = SESSION_MARKET_TYPES.includes((item.marketType || '').toLowerCase());
                                const potentialReturn = isSessionItem
                                    ? (item.betType === 'BACK' ? (item.odds * item.stake) / 100 + item.stake : item.stake)
                                    : (item.betType === 'BACK' ? (item.odds - 1) * item.stake + item.stake : item.stake);
                                const liability = isSessionItem
                                    ? (item.betType === 'BACK' ? item.stake : (item.odds * item.stake) / 100)
                                    : (item.betType === 'LAY' ? (item.odds - 1) * item.stake : item.stake);

                                return (
                                    <div key={item.id} className={clsx('bg-bg-light-blue rounded-lg p-3 border', item.oddsChanged ? 'border-accent-orange' : 'border-stroke-light')}>
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1 min-w-0">
                                                <span className={clsx('text-xs font-bold px-2 py-0.5 rounded uppercase mr-2', item.betType === 'BACK' ? 'bg-odds-back text-neutral-gray-900' : 'bg-odds-lay text-neutral-gray-900')}>
                                                    {item.betType}
                                                </span>
                                                <span className="text-xs font-semibold text-brand-text">{item.runnerName}</span>
                                            </div>
                                            <button onClick={() => removeFromBetSlip(item.id)} className="text-neutral-gray-600 hover:text-accent-red transition-colors ml-2 shrink-0">
                                                <FiX size={14} />
                                            </button>
                                        </div>
                                        <p className="text-xs text-neutral-gray-700 mb-2 truncate">{item.marketName}</p>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={clsx('text-sm font-bold font-mono', item.oddsChanged ? 'text-accent-orange' : 'text-white')}>
                                                {SESSION_MARKET_TYPES.includes((item.marketType || '').toLowerCase()) && item.line !== undefined
                                                    ? `Line: ${item.line} @ `
                                                    : '@ '}
                                                {Number(item.odds).toFixed(2)}
                                                {item.oddsChanged && <span className="ml-1 text-xs">↕</span>}
                                            </span>
                                        </div>

                                        {/* Stake */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-neutral-gray-700 text-sm font-mono">₹</span>
                                            <input
                                                type="number"
                                                className="input-field py-1.5 text-sm"
                                                value={item.stake}
                                                min={10}
                                                max={100000}
                                                onChange={(e) => updateStake(item.id, Number(e.target.value))}
                                                placeholder="Stake"
                                            />
                                        </div>

                                        {/* Quick stakes */}
                                        <div className="grid grid-cols-4 gap-1 mb-2">
                                            {QUICK_STAKES.map((amount) => (
                                                <button
                                                    key={amount}
                                                    className="text-xs bg-bg-card border border-stroke-light hover:bg-brand-primary hover:text-white hover:border-brand-primary rounded py-1 transition-colors font-mono"
                                                    onClick={() => updateStake(item.id, item.stake + amount)}
                                                >
                                                    +{amount >= 1000 ? `${amount / 1000}K` : amount}
                                                </button>
                                            ))}
                                        </div>

                                        {/* P&L */}
                                        <div className="flex justify-between text-xs">
                                            <span className="text-neutral-gray-700">{item.betType === 'BACK' ? 'Return' : 'Liability'}</span>
                                            <span className={item.betType === 'LAY' ? 'text-accent-red font-bold' : 'text-accent-green font-bold'}>
                                                ₹{(item.betType === 'BACK' ? potentialReturn : liability).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer — totals + place bets */}
                {!lastResult && betItems.length > 0 && (
                    <div className="shrink-0 border-t border-stroke-light bg-bg-card p-4 space-y-2">
                        {hasOddsChanged && (
                            <label className="flex items-center gap-2 text-xs text-accent-orange cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={acceptOddsChanges}
                                    onChange={(e) => setAcceptOddsChanges(e.target.checked)}
                                    className="rounded"
                                />
                                Accept all odds changes
                            </label>
                        )}
                        {betError && <p className="text-xs text-accent-red">{betError}</p>}
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between"><span className="text-neutral-gray-700">Total Stake</span><span className="font-mono font-bold text-neutral-gray-800">₹{totalStake.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-neutral-gray-700">Potential Return</span><span className="font-mono font-bold text-accent-green">₹{totalReturn.toFixed(2)}</span></div>
                            <div className="flex justify-between">
                                <span className="text-neutral-gray-700">Liability</span>
                                <span className={clsx('font-mono font-bold', totalLiability > availableBalance ? 'text-accent-red' : 'text-neutral-gray-800')}>
                                    ₹{totalLiability.toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handlePlaceBets}
                            disabled={!canSubmit}
                            className={clsx(
                                'w-full py-2.5 rounded font-display font-bold text-sm tracking-wide transition-all',
                                canSubmit
                                    ? 'bg-cta-gradient text-white hover:opacity-90'
                                    : 'bg-stroke-light text-neutral-gray-600 cursor-not-allowed'
                            )}
                        >
                            {isSubmitting ? 'Placing...' : `Place ${betItems.length} Bet${betItems.length > 1 ? 's' : ''}`}
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
}
