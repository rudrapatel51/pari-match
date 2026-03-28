import React, { useRef, useEffect, useState } from 'react';
import clsx from 'clsx';

interface OddsButtonProps {
    odds?: number | string | null;
    volume?: number | string | null;
    type: 'back' | 'lay' | 'no' | 'yes';
    size?: 'sm' | 'md';
    active?: boolean;
    suspended?: boolean;
    onClick?: () => void;
}

/**
 * formatVolume — matches old-code exactly:
 *   >= 10,000,000 → Cr  (1 Crore)
 *   >= 100,000    → L   (1 Lakh)
 *   >= 1,000      → K   (1 Thousand)
 */
function formatVolume(vol: number | string | null | undefined): string {
    const num = Number(vol);
    if (isNaN(num) || num === 0) return '';
    if (num >= 10_000_000) return (num / 10_000_000).toFixed(1) + 'Cr';
    if (num >= 100_000) return (num / 100_000).toFixed(1) + 'L';
    if (num >= 1_000) return (num / 1_000).toFixed(0) + 'K';
    return String(Math.floor(num));
}

/**
 * OddsButton
 *
 * Displays a single price cell (odds + optional volume).
 * Flashes green (up) or red (down) for 600 ms when odds change.
 * Supports a `suspended` prop that disables click and dims the button
 * (used when an overlay cannot be shown, e.g. inside a wider suspension panel).
 */
export default function OddsButton({
    odds,
    volume,
    type,
    size = 'md',
    active,
    suspended,
    onClick,
}: OddsButtonProps) {
    const [flash, setFlash] = useState<'up' | 'down' | null>(null);
    const prevOdds = useRef<typeof odds>(odds);

    useEffect(() => {
        // Skip the very first render
        if (prevOdds.current === undefined || prevOdds.current === odds) {
            prevOdds.current = odds;
            return;
        }

        const prev = Number(prevOdds.current);
        const curr = Number(odds);
        if (!isNaN(prev) && !isNaN(curr) && prev !== curr) {
            setFlash(curr > prev ? 'up' : 'down');
            const t = setTimeout(() => setFlash(null), 600);
            prevOdds.current = odds;
            return () => clearTimeout(t);
        }
        prevOdds.current = odds;
    }, [odds]);

    const numOdds = Number(odds);
    const hasOdds =
        odds !== undefined &&
        odds !== null &&
        odds !== '' &&
        !isNaN(numOdds) &&
        numOdds > 0;

    const isDisabled = !hasOdds || !!suspended;
    const isBack = type === 'back';
    const isYes = type === 'yes';
    const isBullish = isBack || isYes; // blue family

    return (
        <button
            className={clsx(
                // Base
                'relative flex flex-col items-center justify-center rounded transition-all duration-150 font-mono select-none',
                // Size
                size === 'sm'
                    ? 'px-2 py-1.5 min-w-[40px] text-[11px]'
                    : 'px-3 py-2 min-w-[54px] text-sm',
                // Colour
                isBullish
                    ? 'bg-odds-back text-neutral-gray-900 hover:brightness-110'
                    : 'bg-odds-lay  text-neutral-gray-900 hover:brightness-110',
                // Active selection solid fill
                active && '!bg-brand-accent !text-black shadow-odds-hover scale-95',
                // Flash states — override bg momentarily
                flash === 'up' && 'animate-odds-change !bg-accent-green/60',
                flash === 'down' && 'animate-odds-change !bg-accent-red/60',
                // Disabled / suspended
                isDisabled && 'opacity-40 cursor-not-allowed bg-accent-red-dark'
            )}
            onClick={isDisabled ? undefined : onClick}
            disabled={isDisabled}
        >
            <span className="font-bold leading-none">
                {hasOdds ? numOdds.toFixed(2) : '—'}
            </span>
            {hasOdds && volume != null && volume !== '' && formatVolume(volume) && (
                <span className="text-[10px] leading-none opacity-70 mt-0.5">
                    {formatVolume(volume)}
                </span>
            )}
        </button>
    );
}
