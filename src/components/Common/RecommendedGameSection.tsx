import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CasinoRawGame as Game } from '../../types/casino';

interface GameSectionProps {
    title: string;
    games: Game[];
    onGameClick?: (game: Game) => void;
    onViewAll?: () => void;
    isLoading?: boolean;
}

const RecommendedGameSection: React.FC<GameSectionProps> = ({ title, games, onGameClick, onViewAll, isLoading }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            // Scroll by exactly one card width (half the container) on mobile
            const cardWidth = current.clientWidth / 2;
            const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (isLoading) {
        return (
            <div className="py-6 space-y-4">
                <div className="h-8 bg-stroke-light dark:bg-neutral-gray-700 rounded w-48 animate-pulse" />
                <div className="flex space-x-4 overflow-hidden">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="min-w-[calc(50%-6px)] md:min-w-[180px] h-48 bg-stroke-light dark:bg-neutral-gray-700 rounded-[14px] animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!games || games.length === 0) return null;

    return (
        <div className="py-2 sm:py-4">
            <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-brand-text font-display uppercase truncate min-w-0">
                    {title}
                </h2>
                <div className="flex items-center gap-2 shrink-0">
                    <div className="flex md:hidden gap-0.5">
                        <button
                            onClick={() => scroll('left')}
                            className="p-2 rounded-full bg-stroke-light hover:bg-stroke-primary text-brand-text transition-colors touch-manipulation"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="p-2 rounded-full bg-stroke-light hover:bg-stroke-primary text-brand-text transition-colors touch-manipulation"
                            aria-label="Scroll right"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory
                           md:overflow-visible md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {games.map((game) => {
                    return (
                        <div
                            key={game.id}
                            className="w-[calc(50%-6px)] shrink-0 snap-start md:w-full md:shrink md:min-w-0"
                            onClick={() => onGameClick && onGameClick(game)}
                        >
                            {/* Card container — rounded corners, white bg, subtle shadow, border */}
                            <div
                                className="rounded-[14px] overflow-hidden cursor-pointer border border-stroke-light
                                           shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200
                                           flex flex-col bg-bg-card"
                            >
                                {/* Image block: perfectly square */}
                                <div className="relative w-full" style={{ paddingBottom: '100%' /* 1:1 ratio */ }}>
                                    <img
                                        src={game.image || game.url_thumb || '/placeholder-game.png'}
                                        alt={game.title || game.game_name || ''}
                                        className="absolute inset-0 w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>

                                {/* Title area — white background, vertically centered, green text */}
                               <div className="bg-brand-card dark:bg-brand-primary py-4 px-2 flex items-center justify-center">
                                <span
                                    className="text-brand-text font-bold text-center leading-tight text-sm"
                                >
                                    {game.title || game.game_name}
                                </span>
                            </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RecommendedGameSection;