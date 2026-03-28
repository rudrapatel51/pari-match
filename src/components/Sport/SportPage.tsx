import React, { useState, useEffect, useCallback } from 'react';

import { usePolling } from '../../hooks/usePolling';
import { bettingApi } from '../../api/bettingClient';
import { BETTING_SPORT_IDS } from '../../api/endpoints';
import { Event } from '../../types/domain';

import Loader from '../Common/Loader';
import EmptyState from '../Common/EmptyState';
import { EventRow } from '../shared/EventRow';

interface SportPageProps {
    slug: string;
    title: string;
}

export const SportPage: React.FC<SportPageProps> = ({ slug, title }) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [seriesFilter, setSeriesFilter] = useState<string>('all');

    const fetchEvents = useCallback(async () => {
        try {
            const sportId = BETTING_SPORT_IDS[slug];
            if (!sportId) { setEvents([]); setLoading(false); return; }
            const res = await bettingApi.getEventsBySport(sportId) as any;
            // bettingClient interceptor returns response.data directly
            const data = res?.data || res || [];
            setEvents(Array.isArray(data) ? data.filter((e: any) => !e.isGameOver) : []);
        } catch (error) {
            console.error(`[SportPage] fetch failed for ${slug}:`, error);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    usePolling(fetchEvents, 10000);

    useEffect(() => {
        setLoading(true);
        setEvents([]);
        setSeriesFilter('all');
        fetchEvents();
    }, [slug]);

    // Group events by series
    const seriesGroups = events.reduce((acc: Record<string, Event[]>, event: any) => {
        const key = event.seriesKey || event.competition_name || event.league || 'Other';
        if (!acc[key]) acc[key] = [];
        acc[key].push(event);
        return acc;
    }, {});

    const seriesKeys = Object.keys(seriesGroups);
    const filteredEvents = seriesFilter === 'all' ? events : (seriesGroups[seriesFilter] || []);
    const liveCount = events.filter((e: any) => e.inPlay || e.status === 'IN_PLAY').length;

    if (loading) return <Loader text={`Loading ${title} matches...`} />;

    return (
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold font-display text-brand-text capitalize">{title}</h1>
                    <span className="text-sm text-brand-text">({events.length} matches)</span>
                    {liveCount > 0 && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-accent-green text-white text-xs font-bold rounded animate-pulse">
                            LIVE {liveCount}
                        </span>
                    )}
                </div>
            </div>

            {/* Series Filter */}
            {seriesKeys.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                    <button
                        onClick={() => setSeriesFilter('all')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${seriesFilter === 'all'
                                ? 'bg-brand-primary text-white'
                                : 'bg-bg-light-blue text-brand-text hover:bg-brand-primary/10'
                            }`}
                    >
                        All Competitions
                    </button>
                    {seriesKeys.map(key => (
                        <button
                            key={key}
                            onClick={() => setSeriesFilter(key)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${seriesFilter === key
                                    ? 'bg-brand-primary text-white'
                                    : 'bg-bg-light-blue text-brand-text hover:bg-brand-primary/10'
                                }`}
                        >
                            {key} ({seriesGroups[key].length})
                        </button>
                    ))}
                </div>
            )}

            {/* Events */}
            {filteredEvents.length === 0 ? (
                <EmptyState
                    title={`No ${title} Matches`}
                    description={`No upcoming ${title} matches are available right now.`}
                />
            ) : (
                <div className="bg-bg-card rounded-lg shadow-sm border border-stroke-light overflow-hidden">
                    {seriesFilter === 'all' && seriesKeys.length > 1 ? (
                        // Grouped by series
                        seriesKeys.map(seriesKey => (
                            <div key={seriesKey}>
                                <div className="px-4 py-2 bg-bg-light-blue border-b border-stroke-light">
                                    <h3 className="text-xs font-bold text-neutral-gray-400 uppercase tracking-wide">{seriesKey}</h3>
                                </div>
                                {seriesGroups[seriesKey].map((event: any) => (
                                    <EventRow key={event.id || event.eventId} event={{
                                        ...event,
                                        eventId: event.id || event.eventId,
                                        eventName: event.name || event.eventName,
                                        dateTime: event.startTime || event.matchDate,
                                    }} />
                                ))}
                            </div>
                        ))
                    ) : (
                        filteredEvents.map((event: any) => (
                            <EventRow key={event.id || event.eventId} event={{
                                ...event,
                                eventId: event.id || event.eventId,
                                eventName: event.name || event.eventName,
                                dateTime: event.startTime || event.matchDate,
                            }} />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
