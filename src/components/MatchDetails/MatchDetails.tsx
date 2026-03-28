import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMatchData } from '../../hooks/useMatchData';
import { MarketCard } from './MarketCard';
import { Market, Runner } from '../../types/domain';
import { PlaceBetModal } from './PlaceBetModal';
import { MyBets } from './MyBets';
import Loader from '../Common/Loader';
import { FiRadio, FiCalendar } from 'react-icons/fi';

const MatchDetails: React.FC = () => {
    const { event_id } = useParams<{ event_id: string }>();
    const { matchData, scoreData, minMax, loading, error } = useMatchData({ eventId: event_id || '' });

    // Bet Modal State — KEEP IDENTICAL
    const [isBetModalOpen, setIsBetModalOpen] = useState(false);
    const [selectedBet, setSelectedBet] = useState<{ runner: Runner, price: number, side: 'BACK' | 'LAY', market: Market } | null>(null);

    // Handler — KEEP IDENTICAL
    const handleBetClick = (runner: Runner, price: number, side: 'BACK' | 'LAY', market: Market) => {
        setSelectedBet({ runner, price, side, market });
        setIsBetModalOpen(true);
    };

    if (loading) return <Loader text="Loading match details..." />;

    if (error) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center">
                <div className="bg-bg-card border border-accent-red/20 rounded-xl p-8 text-center max-w-sm mx-4">
                    <div className="w-12 h-12 rounded-full bg-accent-red/10 flex items-center justify-center mx-auto mb-3">
                        <FiRadio className="w-6 h-6 text-accent-red" />
                    </div>
                    <p className="font-display font-semibold text-neutral-gray-800 mb-1">Connection Error</p>
                    <p className="text-sm text-accent-red">{error}</p>
                </div>
            </div>
        );
    }

    if (!matchData && !loading) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center">
                <div className="text-center">
                    <p className="font-display font-semibold text-brand-text">Match not found.</p>
                </div>
            </div>
        );
    }

    const eventName = matchData?.event.name || matchData?.event.eventName || 'Match Details';
    const eventDate = matchData?.event.dateTime || matchData?.event.matchDate || matchData?.event.startTime;
    const isInPlay = matchData?.event.matchType === 'IN_PLAY';

    return (
        <div className="min-h-screen bg-bg-primary">
            {/* Event Header */}
            <div className="bg-card-gradient text-white px-4 sm:px-6 py-5 shadow-elevated">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            {isInPlay && (
                                <span className="inline-flex items-center gap-1.5 bg-accent-red text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                    LIVE
                                </span>
                            )}
                            <h1 className="text-xl font-display font-bold text-white truncate">{eventName}</h1>
                            {eventDate && (
                                <div className="flex items-center gap-1.5 mt-1 text-white/70 text-xs">
                                    <FiCalendar className="w-3.5 h-3.5" />
                                    {eventDate}
                                </div>
                            )}
                        </div>
                        {scoreData && (
                            <div className="text-right bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm">
                                <div
                                    className="font-mono text-base font-bold text-white"
                                    dangerouslySetInnerHTML={{ __html: scoreData.score }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Markets Column */}
                    <div className="lg:col-span-2 space-y-3">
                        {matchData?.markets && matchData.markets.length > 0 ? (
                            matchData.markets.map((marketGroup: any) => {
                                /* ── KEEP IDENTICAL: market mapping logic ── */
                                const events = marketGroup.match_data?.events;
                                const apiKey = marketGroup.api_key;
                                if (!Array.isArray(events)) return null;
                                return events.map((marketEvent: any) => {
                                    const market: Market = {
                                        marketId: marketEvent.marketId || marketEvent.eid || marketEvent.id,
                                        marketName: marketEvent.title || marketGroup.match_data.name,
                                        marketType: apiKey,
                                        status: marketEvent.status || 'OPEN',
                                        inplay: matchData.event.matchType === 'IN_PLAY',
                                        totalMatched: 0,
                                        runners: (marketEvent.runner || []).map((r: any) => {
                                            let back: any[] = [];
                                            let lay: any[] = [];
                                            if (['match_odd', 'winner', 'tied_match', 'completed_match', 'odd_even', 'line_market'].includes(apiKey)) {
                                                back = [{ price: r.backPrice1, size: r.backSize1 }, { price: r.backPrice2, size: r.backSize2 }, { price: r.backPrice3, size: r.backSize3 }];
                                                lay = [{ price: r.layPrice1, size: r.laySize1 }, { price: r.layPrice2, size: r.laySize2 }, { price: r.layPrice3, size: r.laySize3 }];
                                            } else if (['bookmaker', 'bookmaker2', 'toss'].includes(apiKey)) {
                                                back = [{ price: r.back, size: r.backSize || r.line || '' }];
                                                lay = [{ price: r.lay, size: r.laySize || r.line || '' }];
                                            } else if (['session', 'ballbyball', 'meter', 'khado'].includes(apiKey)) {
                                                back = [{ price: r.line1, size: r.back }];
                                                lay = [{ price: r.line2, size: r.lay }];
                                            } else if (apiKey === 'other_market') {
                                                back = [{ price: r.back, size: '' }];
                                                lay = [{ price: r.lay, size: '' }];
                                            } else {
                                                back = [{ price: r.backPrice1 || r.back, size: r.backSize1 || r.backSize }];
                                                lay = [{ price: r.layPrice1 || r.lay, size: r.laySize1 || r.laySize }];
                                            }
                                            return {
                                                selectionId: r.secId || r.selectionId || r.id,
                                                runnerName: r.name || r.runnerName,
                                                handicap: r.handicap || 0,
                                                status: r.status || 'ACTIVE',
                                                line1: r.line1, line2: r.line2, back: r.back, lay: r.lay,
                                                price: { back, lay }
                                            };
                                        })
                                    };
                                    return <MarketCard key={market.marketId} market={market} onBetClick={handleBetClick} />;
                                });
                            })
                        ) : (
                            <div className="bg-bg-card rounded-xl border border-stroke-light p-10 text-center">
                                <p className="text-neutral-gray-600 font-medium">No markets available</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Column */}
                    <div className="hidden lg:flex flex-col gap-4">
                        {/* Stream placeholder */}
                        <div className="bg-neutral-gray-900 rounded-xl aspect-video flex items-center justify-center overflow-hidden relative shadow-elevated">
                            <div className="absolute inset-0 bg-card-gradient opacity-60" />
                            <div className="relative text-center">
                                <FiRadio className="w-8 h-8 text-white/40 mx-auto mb-2" />
                                <span className="text-white/50 text-xs font-medium">Live Stream</span>
                            </div>
                        </div>
                        <MyBets eventId={event_id || ''} />
                    </div>
                </div>
            </div>

            {/* Place Bet Modal — KEEP IDENTICAL props */}
            <PlaceBetModal
                isOpen={isBetModalOpen}
                onClose={() => setIsBetModalOpen(false)}
                betDetails={selectedBet}
                eventId={event_id || ''}
                sportName={matchData?.event.type || matchData?.event.seriesKey?.split('_')[0] || 'cricket'}
                sportId={matchData?.event.sportId ? Number(matchData.event.sportId) : 4}
                minMax={minMax}
            />
        </div>
    );
};

export default MatchDetails;
