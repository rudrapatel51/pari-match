import React, { useState } from "react";
import { FiPlay } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { useUiStore } from "../../store/uiStore";
import type { CasinoGame } from "../../types/casino";
export type { CasinoGame };

interface CasinoGameCardProps {
  game: CasinoGame;
  onPlay?: (game: CasinoGame) => void;
  className?: string; // Allow custom classes for sizing
}

const CasinoGameCard: React.FC<CasinoGameCardProps> = ({
  game,
  onPlay,
  className = "",
}) => {
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
      openModal("login");
      return;
    }
  };

  return (
    <div
      className={`group relative flex flex-col rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer ${className}`}
      onClick={handlePlay}
    >
      {/* Image Section */}
      <div className="relative w-full aspect-square overflow-hidden bg-bg-card">
        <img
          src={game.image}
          alt={game.title}
          className="w-full h-full object-cover transition-all duration-500 group-hover:blur-sm"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/300x300?text=Game";
          }}
        />

        {/* Promo Badges (Right corner of Image) */}
        <div className="absolute top-1.5 right-1.5 flex flex-col items-end gap-0.5 z-10">
          {game.hasPromo && (
            <span className="bg-brand-primary text-brand-text text-[8px] font-bold px-1 py-0.5 rounded shadow-sm uppercase">
              PROMO
            </span>
          )}
          {game.hasCashback && (
            <span className="bg-brand-accent text-black text-[8px] font-bold px-1 py-0.5 rounded shadow-sm uppercase">
              CASHBACK
            </span>
          )}
        </div>

        {/* Hover Play Overlay with Pause Button */}
        <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
          <button className="bg-brand-accent text-black rounded-full p-2.5 transform scale-0 group-hover:scale-100 transition-all duration-300 shadow-lg border-2 border-brand-accent/20 flex items-center justify-center">
            <FiPlay className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Title Section - Below Image, Smaller */}
      <div className="px-2 py-1.5 bg-gradient-to-t from-black/20 to-transparent">
        <h3
          className="text-brand-text text-xs font-medium truncate hover:line-clamp-2"
          title={game.title}
        >
          {game.title}
        </h3>

        {/* Bet Limits */}
        {game.minBet !== undefined &&
          game.maxBet !== undefined &&
          game.maxBet > 0 && (
            <span className="text-brand-text/60 text-[9px] font-medium block mt-0.5">
              {game.minBet} - {game.maxBet} {game.currency || "INR"}
            </span>
          )}
      </div>
    </div>
  );
};

export default CasinoGameCard;
