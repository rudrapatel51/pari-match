import React, { useState } from "react";
import { FiPlay } from "react-icons/fi";
import { casinoApi } from "../../api/client";
import { useToastStore } from "../../store/toastStore";
import { useAuth } from "../../hooks/useAuth";
import { useUiStore } from "../../store/uiStore";

interface LiveCasinoGame {
  id: string;
  title: string;
  provider: string;
  providerLogo: string;
  image: string;
  minBet: number;
  maxBet: number;
  currency: string;
  isLive?: boolean;
}

interface LiveCasinoCardProps {
  game: LiveCasinoGame;
  onPlay?: (game: LiveCasinoGame) => void;
}

const LiveCasinoCard: React.FC<LiveCasinoCardProps> = ({ game, onPlay }) => {
  const [launching, setLaunching] = useState(false);
  const { isAuthenticated } = useAuth();
  const { openModal } = useUiStore();
  const toast = useToastStore();

  const handlePlay = async () => {
    if (onPlay) {
      onPlay(game);
      return;
    }

    if (!isAuthenticated) {
      openModal("login");
      return;
    }
    if (launching) return;
    setLaunching(true);
    try {
      const res: any = await casinoApi.launchGame({ game_id: game.id });
      const url =
        res?.data?.data?.url || res?.data?.url || res?.data?.launch_url;
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      else toast.error("Game launch URL not available");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to launch game");
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div
      className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={handlePlay}
    >
      {/* Live Casino Game Image */}
      <div className="relative aspect-[3/2] overflow-hidden">
        <img
          src={game.image}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        {/* Gradient overlay at bottom */}

        {/* Provider Logo Badge (Top Left) */}
        <div className="absolute top-2 left-2 z-10">
          <div className="bg-white/95 rounded px-2 py-1">
            <img
              src={game.providerLogo}
              alt={game.provider}
              className="h-4 md:h-5 w-auto"
            />
          </div>
        </div>

        {/* Game Title and Bet Limits Overlay (Bottom) */}
        <div className="absolute inset-x-0 bottom-0 p-3 flex items-end justify-between">
          {/* Game Title (Bottom Left) */}
          <div className="flex-1">
            <h3 className="text-brand-text font-bold text-xs md:text-sm leading-tight line-clamp-2">
              {game.title}
            </h3>
          </div>

          {/* Bet Limits (Bottom Right) */}
          <div className="ml-3 flex-shrink-0">
            <div className="text-right">
              <p className="text-brand-text text-[10px] md:text-xs font-medium">
                {game.minBet} - {game.maxBet.toLocaleString()} {game.currency}
              </p>
            </div>
          </div>
        </div>

        {/* Hover Overlay with Play Button */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
          <button
            className="bg-bg-card hover:bg-bg-light-blue text-brand-text rounded-full p-4 transform scale-0 group-hover:scale-100 transition-all duration-300 shadow-lg"
            disabled={launching}
          >
            {launching ? (
              <span className="w-8 h-8 block border-2 border-brand-text border-t-transparent rounded-full animate-spin" />
            ) : (
              <FiPlay className="w-8 h-8" />
            )}
          </button>
        </div>

        {/* Live Badge (Optional) */}
        {game.isLive && (
          <div className="absolute top-2 right-2 z-10">
            <div className="flex items-center gap-1 bg-accent-red text-brand-text text-[10px] font-bold px-2 py-1 rounded">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              LIVE
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveCasinoCard;
