import React from 'react';
import { Market, Runner } from '../../types/domain';
import { RunnerRow } from './RunnerRow';
import { clsx } from 'clsx';

interface MarketCardProps {
    market: Market;
    onBetClick: (runner: Runner, price: number, side: 'BACK' | 'LAY', market: Market) => void;
}

export const MarketCard: React.FC<MarketCardProps> = ({ market, onBetClick }) => {
    if (!market) return null;

    // KEEP IDENTICAL: suspension detection
    const statusUpper = String(market.status || '').toUpperCase();
    const isSuspended = statusUpper !== 'OPEN' && statusUpper !== 'ACTIVE';

    // KEEP IDENTICAL: session type detection
    const isSessionType = ['session', 'ballbyball', 'meter', 'khado'].includes(market.marketType);

    return (
        <div className="bg-bg-card rounded-xl border border-stroke-light shadow-betting-card overflow-hidden">
            {/* Market Header */}
            <div className={clsx(
                'px-4 py-2.5 flex items-center justify-between border-b border-stroke-light',
                isSuspended ? 'bg-accent-red/5' : 'bg-bg-light-blue'
            )}>
                <h3 className="font-display font-semibold text-sm text-neutral-gray-800 truncate mr-2">
                    {market.marketName}
                </h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {isSuspended && (
                        <span className="text-[10px] font-bold text-accent-red bg-accent-red/10 border border-accent-red/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
                            Suspended
                        </span>
                    )}
                    {market.totalMatched > 0 && (
                        <span className="text-[10px] text-brand-text font-mono">
                            ₹{market.totalMatched.toLocaleString()}
                        </span>
                    )}
                </div>
            </div>

            {/* Column Labels — bg-bg-light-blue adapts correctly in both modes */}
            <div className="flex items-center px-4 py-1.5 bg-bg-light-blue border-b border-stroke-light">
                <div className="flex-1" />
                {isSessionType ? (
                    <>
                        <div className="w-16 text-center text-[11px] font-semibold text-odds-lay mx-0.5">No</div>
                        <div className="w-16 text-center text-[11px] font-semibold text-odds-back mx-0.5 ml-2">Yes</div>
                    </>
                ) : (
                    <>
                        <div className="w-16 text-center text-[11px] font-semibold text-odds-back mx-0.5">Back</div>
                        <div className="w-16 text-center text-[11px] font-semibold text-odds-lay mx-0.5 ml-2">Lay</div>
                    </>
                )}
            </div>

            {/* Runner Rows */}
            <div className="divide-y divide-stroke-light">
                {market.runners && market.runners.map((runner) => (
                    <RunnerRow
                        key={runner.selectionId}
                        runner={runner}
                        isSuspended={isSuspended}
                        onBetClick={(r, p, s) => onBetClick(r, p, s, market)}
                    />
                ))}
            </div>
        </div>
    );
};
