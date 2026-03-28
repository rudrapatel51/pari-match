import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBettingStore } from '../../store/bettingStore';

const LiveTicker: React.FC = () => {
    const navigate   = useNavigate();
    const liveEvents = useBettingStore((s) => s.liveEvents);

    const items = useMemo(() => {
        return liveEvents.slice(0, 20).map((event: any) => ({
            id:     event.eventId,
            sport:  event.sport?.name || 'Sport',
            league: event.league || '',
            name:   event.name || 'Match',
            status: event.matchStatus,
            path:   `/betting/event/${event.eventId}`,
        }));
    }, [liveEvents]);

    if (items.length === 0) return null;

    const ticker   = [...items, ...items];
    const duration = Math.max(items.length * 5, 25);

    return (
        <div className="w-full overflow-hidden select-none bg-brand-primary">
            <div className="flex items-stretch">
                <div className="flex-1 overflow-hidden relative">

                    {/* Right fade — matches ticker bg-brand-primary */}
                    <div className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none bg-gradient-to-l from-brand-primary to-transparent" />

                    <div
                        className="ticker-track flex items-center py-2.5"
                        style={{
                            animation: `tickerScroll ${duration}s linear infinite`,
                            width: 'max-content',
                        }}
                    >
                        {ticker.map((item, i) => (
                            <button
                                key={`${item.id}-${i}`}
                                onClick={() => navigate(item.path)}
                                className="flex items-center gap-2.5 shrink-0 hover:opacity-75 transition-opacity cursor-pointer px-5"
                            >
                                {/*
                                  Use text-white / opacity utilities — NOT neutral-gray-*.
                                  The neutral gray scale inverts in dark mode:
                                    light theme: neutral-100 = very light ✅ visible on dark bg
                                    dark theme:  neutral-100 = very dark  ❌ invisible on dark bg
                                  text-white is always #ffffff regardless of theme — guaranteed
                                  contrast on bg-brand-primary in both light and dark themes.
                                */}
                                <span className="w-1.5 h-1.5 rounded-full shrink-0 flex-shrink-0 bg-white opacity-40" />

                                {item.league && (
                                    <span className="text-sm font-medium whitespace-nowrap text-white opacity-70">
                                        {item.league}
                                    </span>
                                )}

                                {item.league && (
                                    <span className="text-sm text-white opacity-30">/</span>
                                )}

                                <span className="text-sm font-semibold whitespace-nowrap text-white">
                                    {item.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes tickerScroll {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .ticker-track:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};

export default LiveTicker;