import React, { useState, useEffect } from 'react';
import { userApi } from '../../api/client';
import { Runner, Market, calculateDisplayOdds, calculateProfit, calculateLiability } from '../../types/domain';
import { clsx } from 'clsx';
import { FiX } from 'react-icons/fi';

interface PlaceBetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    eventId: string;
    sportName: string;
    sportId?: number;
    betDetails: { runner: Runner; price: number; side: 'BACK' | 'LAY'; market: Market } | null;
    minMax?: { min_stake?: number; max_stake?: number } | null;
}

export const PlaceBetModal: React.FC<PlaceBetModalProps> = ({
    isOpen, onClose, onSuccess, betDetails, eventId, sportName, sportId = 4, minMax
}) => {
    // STATE — KEEP IDENTICAL
    const [stake, setStake] = useState<number>(0);
    const [odds, setOdds] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // EFFECT — KEEP IDENTICAL
    useEffect(() => {
        if (betDetails) {
            const displayOdds = calculateDisplayOdds(betDetails.price, betDetails.market.marketType);
            setOdds(displayOdds);
            setStake(0);
            setErrorMsg(null);
            setSuccessMsg(null);
        }
    }, [betDetails, isOpen]);

    if (!isOpen || !betDetails) return null;

    // BUSINESS LOGIC — KEEP IDENTICAL
    const minStake = minMax?.min_stake ?? 100;
    const maxStake = minMax?.max_stake ?? 500000;
    const profit = betDetails.side === 'BACK'
        ? calculateProfit(stake, odds, 'BACK', betDetails.market.marketType)
        : 0;
    const liability = betDetails.side === 'LAY'
        ? calculateLiability(stake, odds, betDetails.market.marketType)
        : 0;

    // HANDLER — KEEP IDENTICAL
    const handlePlaceBet = async () => {
        if (!betDetails || !stake || stake <= 0) return;
        if (stake < minStake) { setErrorMsg(`Minimum stake is ${minStake}`); return; }
        if (stake > maxStake) { setErrorMsg(`Maximum stake is ${maxStake}`); return; }

        setLoading(true);
        setErrorMsg(null);
        try {
            const payload = {
                market_id: betDetails.market.marketId,
                selectionId: betDetails.runner.selectionId,
                runner_id: betDetails.runner._id || betDetails.runner.selectionId,
                stake,
                odds,
                side: betDetails.side,
                event_id: eventId,
                m_type: betDetails.market.marketType,
                market_name: betDetails.market.marketName,
                sport_id: sportId,
                sport_name: sportName,
                runner_name: betDetails.runner.runnerName || betDetails.runner.name || '',
                line: betDetails.runner.line1 ?? 0,
            };
            const response = await userApi.placeBet(payload) as any;
            if (response?.success || response?.status === 200) {
                setSuccessMsg(`Bet Placed: ${betDetails.side} on ${betDetails.runner.runnerName || betDetails.runner.name}`);
                if (onSuccess) onSuccess();
                setTimeout(() => onClose(), 1500);
            } else {
                setErrorMsg(response?.error?.message || response?.message || 'Failed to place bet');
            }
        } catch (error: any) {
            setErrorMsg(error.message || 'Failed to place bet');
        } finally {
            setLoading(false);
        }
    };

    // QUICK STAKE BUTTONS — KEEP IDENTICAL values
    const stakeButtons = [100, 500, 1000, 5000, 10000, 25000];
    const isBack = betDetails.side === 'BACK';
    const runnerName = betDetails.runner.runnerName || betDetails.runner.name || '';

    return (
        // Overlay
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Modal panel */}
            <div className={clsx(
                'bg-bg-card w-full sm:max-w-md shadow-elevated overflow-hidden',
                'rounded-t-2xl sm:rounded-2xl'
            )}>
                {/* Top accent bar */}
                <div className={clsx('h-1 w-full', isBack ? 'bg-odds-back' : 'bg-odds-lay')} />

                {/* Header */}
                <div className="px-5 py-4 flex justify-between items-center border-b border-stroke-light">
                    <div className="flex items-center gap-3">
                        <span className={clsx(
                            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide',
                            isBack ? 'bg-odds-back/20 text-odds-back' : 'bg-odds-lay/20 text-odds-lay'
                        )}>
                            {betDetails.side}
                        </span>
                        <h2 className="font-display font-bold text-base text-neutral-gray-800">Place Bet</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-light-blue transition-colors text-neutral-gray-700"
                    >
                        <FiX className="w-4 h-4" />
                    </button>
                </div>

                {/* Runner info */}
                <div className="px-5 pt-4">
                    <p className="text-lg font-bold text-neutral-gray-800 truncate">{runnerName}</p>
                    <p className="text-sm text-brand-text mt-0.5 truncate">{betDetails.market.marketName}</p>
                    {minMax && (
                        <p className="text-xs text-neutral-gray-600 mt-1 font-mono">
                            Min: ₹{minStake.toLocaleString()} &nbsp;·&nbsp; Max: ₹{maxStake.toLocaleString()}
                        </p>
                    )}
                </div>

                {/* Inputs */}
                <div className="px-5 mt-4 flex gap-3">
                    <div className="w-1/3">
                        <label className="block text-xs font-semibold text-neutral-gray-700 uppercase tracking-wider mb-1.5">Odds</label>
                        <input
                            type="number"
                            value={odds}
                            onChange={(e) => setOdds(parseFloat(e.target.value) || 0)}
                            step="0.01"
                            className="input-field text-center font-mono font-bold"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-neutral-gray-700 uppercase tracking-wider mb-1.5">Stake (₹)</label>
                        <input
                            type="number"
                            value={stake || ''}
                            onChange={(e) => setStake(parseFloat(e.target.value) || 0)}
                            placeholder={`Min ₹${minStake}`}
                            min={minStake}
                            max={maxStake}
                            className="input-field text-center font-mono font-bold"
                        />
                    </div>
                </div>

                {/* Quick stake grid — KEEP IDENTICAL values + logic */}
                <div className="px-5 mt-3 grid grid-cols-4 gap-1.5">
                    {stakeButtons.map(amt => (
                        <button
                            key={amt}
                            onClick={() => setStake(prev => prev + amt)}
                            className="py-2 text-xs font-bold rounded-lg bg-bg-light-blue hover:bg-brand-primary/10 text-brand-text transition-colors font-mono"
                        >
                            +{amt >= 1000 ? `${amt / 1000}K` : amt}
                        </button>
                    ))}
                    <button
                        onClick={() => setStake(prev => prev * 2)}
                        className="col-span-2 py-2 text-xs font-bold rounded-lg bg-bg-light-blue hover:bg-brand-primary/10 text-brand-text transition-colors"
                    >
                        × 2
                    </button>
                    <button
                        onClick={() => setStake(0)}
                        className="col-span-2 py-2 text-xs font-bold rounded-lg bg-bg-light-blue hover:bg-brand-primary/10 text-neutral-gray-700 transition-colors"
                    >
                        Clear
                    </button>
                </div>

                {/* Profit / Liability panel */}
                <div className="mx-5 mt-3 p-3 rounded-xl bg-bg-light-blue border border-stroke-light">
                    {isBack ? (
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-neutral-gray-600">Potential Profit</span>
                            <span className={clsx('font-mono font-bold', profit > 0 ? 'text-accent-green' : 'text-neutral-gray-700')}>
                                ₹{(profit || 0).toFixed(2)}
                            </span>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-neutral-gray-600">Liability</span>
                            <span className="font-mono font-bold text-accent-red">
                                ₹{(liability || 0).toFixed(2)}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between items-center text-xs mt-1.5 text-neutral-gray-700">
                        <span>Stake</span>
                        <span className="font-mono">₹{(stake || 0).toFixed(2)}</span>
                    </div>
                </div>

                {/* Error / Success messages */}
                {errorMsg && (
                    <div className="mx-5 mt-3 p-3 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm">
                        {errorMsg}
                    </div>
                )}
                {successMsg && (
                    <div className="mx-5 mt-3 p-3 rounded-xl bg-accent-green/10 border border-accent-green/20 text-accent-green text-sm font-medium">
                        {successMsg}
                    </div>
                )}

                {/* Action buttons */}
                <div className="p-5 pt-3 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl bg-bg-light-blue hover:bg-brand-primary/10 text-brand-text font-bold text-sm transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePlaceBet}
                        disabled={loading || !stake || stake <= 0}
                        className={clsx(
                            'flex-1 py-3 rounded-xl font-bold text-sm text-neutral-gray-900 transition-all shadow-sm',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            isBack ? 'bg-odds-back hover:brightness-110' : 'bg-odds-lay hover:brightness-110'
                        )}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-neutral-gray-600 border-t-transparent rounded-full animate-spin" />
                                Placing...
                            </span>
                        ) : `Place ${betDetails.side}`}
                    </button>
                </div>
            </div>
        </div>
    );
};
