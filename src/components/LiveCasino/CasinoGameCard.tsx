import React, { useState } from 'react';
import { FiPlay } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useUiStore } from '../../store/uiStore';
import type { CasinoGame } from '../../types/casino';
export type { CasinoGame };

interface CasinoGameCardProps {
    game: CasinoGame;
    onPlay?: (game: CasinoGame) => void;
    className?: string; // Allow custom classes for sizing
}

const CasinoGameCard: React.FC<CasinoGameCardProps> = ({ game, onPlay, className = "" }) => {
    const [launching, setLaunching] = useState(false);
    const { isAuthenticated } = useAuth();
    const { openModal } = useUiStore();

    const handlePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onPlay) {
            onPlay(game);
            return;
        }
        if (!isAuthenticated) {
            openModal('login');
            return;
        }
        // If no onPlay provided, maybe default logic here or just do nothing (parent handles)
    };

    return (
        <div
            className={`group relative flex flex-col rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-bg-card border border-stroke-light ${className}`}
            onClick={handlePlay}
        >
            {/* Image Section */}
            <div className="relative w-full aspect-[4/3] overflow-hidden">
                <img
                    src={game.image}
                    alt={game.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Game';
                    }}
                />



                {/* Promo Badges (Right or Bottom Right of Image) */}
                <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1 z-10">
                    {game.hasPromo && (
                        <span className="bg-brand-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm uppercase">
                            PROMO
                        </span>
                    )}
                    {game.hasCashback && (
                        <span className="bg-brand-accent text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm uppercase">
                            VIP CASHBACK 5%
                        </span>
                    )}
                </div>

                {/* Hover Play Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                    <button className="bg-brand-accent text-black rounded-full p-3 transform scale-0 group-hover:scale-100 transition-all duration-300 shadow-lg border-2 border-brand-accent/20">
                        <FiPlay className="w-6 h-6 ml-1" />
                    </button>
                </div>
            </div>

            {/* Footer Section (Dark Blue Bar) */}
            <div className="flex items-center justify-between px-3 py-2 bg-brand-primary h-10 md:h-12 border-t border-stroke-light">
                {/* Title */}
                <div className="flex-1 min-w-0 pr-2">
                    <h3 className="text-white text-xs md:text-sm font-medium truncate" title={game.title}>
                        {game.title}
                    </h3>
                </div>

                {/* Bet Limits */}
                <div className="flex-shrink-0 text-right">
                    {(game.minBet !== undefined && game.maxBet !== undefined && game.maxBet > 0) ? (
                        <span className="text-white/70 text-[10px] md:text-[11px] font-medium whitespace-nowrap">
                            {game.minBet} - {game.maxBet} {game.currency || 'INR'}
                        </span>
                    ) : (
                        // Fallback or empty if no limits
                        <span className="text-white/70 text-[10px] font-medium hidden">Play Now</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CasinoGameCard;
