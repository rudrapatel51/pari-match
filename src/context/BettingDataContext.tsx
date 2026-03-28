import React, { useEffect } from 'react';
import { bettingApi } from '../api/bettingClient';
import { useBettingStore } from '../store/bettingStore';

/**
 * BettingDataProvider — mounts once at app level.
 * Fetches BETTING_SPORTS (once) and BETTING_LIVE_EVENTS (every 30s),
 * writing results directly into the Zustand bettingStore.
 * All consumers (LeftSidebar, MainContent, BettingHomePage, etc.)
 * read from the store instead of fetching independently.
 */
export function BettingDataProvider({ children }: { children: React.ReactNode }) {
    const setSports = useBettingStore((s) => s.setSports);
    const setLiveEvents = useBettingStore((s) => s.setLiveEvents);

    useEffect(() => {
        // Fetch sports list once on mount
        bettingApi.getSports()
            .then((res: any) => {
                const list = res?.data || res || [];
                setSports(Array.isArray(list) ? list : []);
            })
            .catch(() => {});

        // Fetch live events immediately + poll every 30s
        const fetchLive = () => {
            bettingApi.getLiveEvents()
                .then((res: any) => {
                    const events: any[] = res?.data?.events || res?.events || [];
                    setLiveEvents(Array.isArray(events) ? events.filter((e) => !e.isGameOver) : []);
                })
                .catch(() => {});
        };
        fetchLive();
        const interval = setInterval(fetchLive, 30_000);
        return () => clearInterval(interval);
    }, []);

    return <>{children}</>;
}
