import { useState, useEffect, useCallback } from 'react';
import { socketService } from '../services/socketService';
import apiClient from '../api/client';
import { Endpoints } from '../api/endpoints';
import { MatchData, ScoreData } from '../types/domain';
import { usePolling } from './usePolling';

interface UseMatchDataProps {
    eventId: string;
}

export const useMatchData = ({ eventId }: UseMatchDataProps) => {
    const [matchData, setMatchData] = useState<MatchData | null>(null);
    const [scoreData, setScoreData] = useState<ScoreData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 1. Initial Fetch
    const fetchMatchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.post(Endpoints.GET_EVENT_DETAILS_DREAM, { event_id: eventId });
            // client.ts interceptor returns response.data (the API body).
            // So `response` IS the API body: { status, message, data: <event>, oddds: <markets> }
            // Old code: e.data = event object, e.oddds = markets object at root
            if (response.status === 200) {
                if (response.data) {
                    const eventData = response.data;            // event object at response.data
                    const marketObject = (response as any).oddds || {};  // markets at root, NOT response.data.oddds

                    // Transform oddds object to array
                    const marketsArray = Object.entries(marketObject).map(([key, value]: [string, any]) => {
                        let marketSlug = key;

                        // Handle latestOdds mapping if runner is empty/missing
                        if (value.events && Array.isArray(value.events)) {
                            // Try to find slug from first event
                            if (value.events.length > 0 && value.events[0].slug) {
                                marketSlug = value.events[0].slug;
                            }
                            value.events = value.events.map((event: any) => {
                                if ((!event.runner || event.runner.length === 0) && event.latestOdds && event.latestOdds.r) {
                                    event.runner = event.latestOdds.r.map((r: any) => ({
                                        selectionId: r.rid,
                                        status: r.s,
                                        backPrice1: r.b1,
                                        backSize1: r.br1,
                                        layPrice1: r.l1,
                                        laySize1: r.lr1,
                                        backPrice2: r.b2,
                                        backSize2: r.br2,
                                        layPrice2: r.l2,
                                        laySize2: r.lr2,
                                        backPrice3: r.b3,
                                        backSize3: r.br3,
                                        layPrice3: r.l3,
                                        laySize3: r.lr3,
                                        // Map line markets if fallback
                                        line1: r.b1,
                                        line2: r.l1,
                                        back: r.b1,
                                        lay: r.l1
                                    }));
                                }
                                return event;
                            });
                        }

                        return {
                            api_key: marketSlug,
                            match_data: value
                        };
                    });

                    // Define Display Order (reuse logic from socket)
                    const displayOrder = [
                        'MatchOdds', 'MatchOddsTest', 'Bookmaker', 'Toss', 'InningsRuns',
                        'OverRuns', 'SessionRuns', 'FallOfWicket', 'Goals',
                        'match_odd', 'bookmaker', 'line_market' // fallback for other casing
                    ];

                    marketsArray.sort((a, b) => {
                        let indexA = displayOrder.indexOf(a.api_key);
                        let indexB = displayOrder.indexOf(b.api_key);
                        if (indexA === -1) indexA = 999;
                        if (indexB === -1) indexB = 999;
                        return indexA - indexB;
                    });

                    setMatchData({
                        event: eventData, // The inner data object is the event
                        markets: marketsArray
                    });
                }
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch match data');
        } finally {
            setLoading(false);
        }
    }, [eventId]);

    // Added: Trigger initial fetch on mount/change
    useEffect(() => {
        fetchMatchData();
    }, [fetchMatchData]);

    // 2. Socket Connection & Subscription
    useEffect(() => {
        if (!eventId) return;

        socketService.connect();
        socketService.joinRoom(eventId);

        const handleSocketUpdate = (data: any) => {
            // Old code logic:
            // data.market (object) -> mapped to array -> sorted
            if (data && data.market) {
                const dataArray = Object.entries(data.market).map(([key, value]: [string, any]) => {
                    return {
                        match_data: value,
                        api_key: key,
                    };
                });

                const order = [
                    'match_odd', 'goals', 'bookmaker', 'bookmaker2', 'line_market',
                    'toss', 'winner', 'session', 'ballbyball', 'other_market',
                    'odd_even', 'meter', 'khado', 'other_market', 'tied_match',
                    'completed_match', 'virtual_cricket'
                ];

                const reorderedArray = dataArray.sort((a, b) => {
                    return order.indexOf(a.api_key) - order.indexOf(b.api_key);
                });

                setMatchData((prev) => ({
                    event: data.event || prev?.event,
                    markets: reorderedArray
                }));
            }
        };

        socketService.on(`evn_${eventId}`, handleSocketUpdate);

        return () => {
            socketService.off(`evn_${eventId}`, handleSocketUpdate);
            socketService.leaveRoom(eventId);
        };
    }, [eventId]);

    // 3. Polling for Live Score
    const fetchLiveScore = useCallback(async () => {
        if (!eventId) return;
        try {
            // Adjust endpoint if needed (audit says /cricket/get_live_score)
            const response = await apiClient.post(Endpoints.GET_LIVE_SCORE, { event_id: eventId });
            // response IS the API body; score is at response.data
            if (response.data) {
                setScoreData(response.data);
            } else if ((response as any).score) {
                setScoreData(response as any);
            }
        } catch (err) {
            console.error('Error fetching live score', err);
        }
    }, [eventId]);

    const [minMax, setMinMax] = useState<any>(null);
    const [notifications, setNotifications] = useState<any[]>([]);

    // ... (existing code) ...

    // 4. Polling for Min/Max (Audit recommended 5s)
    const fetchMinMax = useCallback(async () => {
        if (!eventId) return;
        try {
            const response = await apiClient.post(Endpoints.USER_MIN_MAX, { eventId: eventId, sport: 'cricket' });
            if (response.data) {
                setMinMax(response.data);
            }
        } catch (err) {
            console.error('Error fetching min/max', err);
        }
    }, [eventId]);

    // 5. Polling for Notifications (Audit recommended 5s)
    const fetchNotifications = useCallback(async () => {
        try {
            const response = await apiClient.post(Endpoints.EVENT_NOTIFICATIONS, { eventid: eventId });
            const notifData = response.data || response;
            if (Array.isArray(notifData)) {
                setNotifications(notifData);
            }
        } catch (err) {
            console.error('Error fetching notifications', err);
        }
    }, []);

    // ... (existing poll calls) ...
    usePolling(fetchLiveScore, 500);
    usePolling(fetchMinMax, 5000);
    usePolling(fetchNotifications, 5000);

    return { matchData, scoreData, minMax, notifications, loading, error, refetch: fetchMatchData };
};
