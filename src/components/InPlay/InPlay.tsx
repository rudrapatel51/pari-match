import React, { useState, useEffect, useCallback } from 'react';

import { clsx } from 'clsx';

import { usePolling } from '../../hooks/usePolling';
import { sportsApi } from '../../api/client';

import Loader from '../Common/Loader';
import EmptyState from '../Common/EmptyState';
import { EventRow } from '../shared/EventRow';

const SPORT_TABS = [
    { id: 'all', label: 'All' },
    { id: 'cricket', label: '🏏 Cricket' },
    { id: 'football', label: '⚽ Football' },
    { id: 'tennis', label: '🎾 Tennis' },
];

export const InPlay: React.FC = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [sportFilter, setSportFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    const fetchInPlayGames = useCallback(async () => {
        try {
            const res = await sportsApi.getInPlay() as any;
            const data = res?.data?.data || res?.data || [];
            const cats = Array.isArray(data) ? data : [];
            setCategories(cats);
            if (!selectedCategoryId && cats.length > 0) {
                setSelectedCategoryId(cats[0]._id || cats[0].name);
            }
        } catch (error) {
            console.error('[InPlay] fetch failed:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedCategoryId]);

    usePolling(fetchInPlayGames, 5000);

    useEffect(() => { fetchInPlayGames(); }, []);

    // Get all events flat for sport filtering
    const allEvents = categories.flatMap((cat: any) => cat.records || cat.events || []);
    const selectedCategory = categories.find((c: any) => (c._id || c.name) === selectedCategoryId);

    const displayEvents = (() => {
        const base = selectedCategory ? (selectedCategory.records || selectedCategory.events || []) : allEvents;
        if (sportFilter === 'all') return base;
        return base.filter((e: any) => {
            const sport = (e.sport || e.sportId || e.sport_name || '').toLowerCase();
            return sport.includes(sportFilter);
        });
    })();

    const totalLive = allEvents.length;

    if (loading && categories.length === 0) return <Loader text="Loading live matches..." />;

    return (
        <div className="container mx-auto p-4">
            <div className="flex items-center gap-3 mb-4">
                <h1 className="text-2xl font-bold font-display text-brand-text">In-Play</h1>
                {totalLive > 0 && (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-accent-green text-white text-xs font-bold rounded-full animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        LIVE {totalLive}
                    </span>
                )}
            </div>

            {/* Sport Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                {SPORT_TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setSportFilter(tab.id)}
                        className={clsx(
                            'px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors',
                            sportFilter === tab.id
                                ? 'bg-brand-primary text-white'
                                : 'bg-bg-light-blue text-brand-text hover:bg-brand-primary/10'
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Category Sub-Tabs */}
            {categories.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 border-b border-stroke-light">
                    {categories.map((cat: any) => {
                        const catId = cat._id || cat.name;
                        const count = (cat.records || cat.events || []).length;
                        return (
                            <button
                                key={catId}
                                onClick={() => setSelectedCategoryId(catId)}
                                className={clsx(
                                    'px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors border',
                                    selectedCategoryId === catId
                                        ? 'bg-accent-red/10 border-accent-red text-accent-red'
                                        : 'border-stroke-light text-neutral-gray-600 hover:border-brand-text hover:text-brand-text'
                                )}
                            >
                                {cat.name} <span className="font-mono">({count})</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Events List */}
            {displayEvents.length === 0 ? (
                <EmptyState
                    title="No Live Matches"
                    description="No live matches are available right now. Check back soon."
                />
            ) : (
                <div className="bg-bg-card rounded-lg shadow-sm border border-stroke-light overflow-hidden">
                    {displayEvents.map((event: any) => (
                        <EventRow
                            key={event.id || event.eventId || event._id}
                            event={{
                                ...event,
                                eventId: event.id || event.eventId || event._id,
                                eventName: event.name || event.eventName,
                                dateTime: event.startTime,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
