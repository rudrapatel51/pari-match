import { io, Socket } from 'socket.io-client';
import { useBettingStore } from '../store/bettingStore';

// Strip trailing slash so `${WS_URL}/markets` never becomes `//markets`.
// Old code used REACT_APP_BETTING_WS_URL which had no trailing slash;
// VITE_SOCKET_URL / VITE_API_URL may have one.
const WS_URL = (
    import.meta.env.VITE_BETTING_SOCKET_URL ||
    import.meta.env.VITE_SOCKET_URL ||
    import.meta.env.VITE_API_URL ||
    'http://localhost:3000'
).replace(/\/$/, '');

function getToken(): string {
    return localStorage.getItem('authToken') || '';
}

class BettingSocketService {
    private marketsSocket: Socket | null = null;
    private eventsSocket: Socket | null = null;
    private userSocket: Socket | null = null;
    private _subscribedMarketIds = new Set<string>();
    // Tracks the currently active event so the connect handler always
    // subscribes to the right eventId (handles reconnect + StrictMode remount).
    private _currentEventId: string | null = null;

    // ─── /markets ─────────────────────────────────────────────────────────────

    connectMarkets() {
        // Guard: if socket already exists (connecting OR connected), let socket.io
        // handle reconnection automatically — don't create a duplicate socket.
        if (this.marketsSocket !== null) return;

        this.marketsSocket = io(`${WS_URL}/markets`, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            auth: { token: getToken() },
        });

        this.marketsSocket.on('connect', () => {
            if (this._subscribedMarketIds.size > 0) {
                this.marketsSocket!.emit('subscribe:markets', {
                    marketIds: Array.from(this._subscribedMarketIds),
                });
            }
        });

        this.marketsSocket.on('odds:updates', ({ marketId, data }: { marketId: string; data: any }) => {
            const store = useBettingStore.getState();
            store.setOdds(marketId, data);

            // Update bet slip items for this market if odds/line changed.
            // Coerce to Number — WS data may arrive as numeric strings.
            const SESSION_MARKET_TYPES_WS = ['session', 'fancy', 'fancy1', 'ball-by-ball', 'meter', 'bookmaker', 'bookmaker2', 'khado'];
            const { betItems } = store;
            betItems.forEach((item) => {
                if (item.marketId !== marketId) return;
                const isSessionBet = SESSION_MARKET_TYPES_WS.includes((item.marketType || '').toLowerCase());

                let rawOdds: unknown;
                let rawLine: unknown;

                if (data.r && Array.isArray(data.r)) {
                    const runner = data.r.find((r: any) => r.rid === item.runnerId);
                    if (runner) rawOdds = item.betType === 'BACK' ? runner.b1 : runner.l1;
                } else if (data.b !== undefined || data.l !== undefined) {
                    if (isSessionBet) {
                        // Session format: br/lr = rates (odds), b/l = line values
                        rawOdds = item.betType === 'BACK' ? data.br : data.lr;
                        rawLine = item.betType === 'BACK' ? data.b  : data.l;
                    } else {
                        rawOdds = item.betType === 'BACK' ? data.b : data.l;
                    }
                }

                const newOdds = rawOdds !== undefined ? Number(rawOdds) : undefined;
                const newLine = rawLine !== undefined ? Number(rawLine) : undefined;

                if (newOdds !== undefined && !isNaN(newOdds)) {
                    store.updateOdds(marketId, item.runnerId, item.betType, newOdds, newLine);
                }
            });
        });

        this.marketsSocket.on(
            'market:status',
            ({ marketId, isActive, isGameOver }: { marketId: string; isActive: boolean; isGameOver: boolean }) => {
                useBettingStore.getState().updateMarketStatus(marketId, isActive, isGameOver);
                if (isGameOver) this._subscribedMarketIds.delete(marketId);
            }
        );

        this.marketsSocket.on('disconnect', () => { /* disconnected */ });
    }

    subscribeToMarkets(marketIds: string[]) {
        if (!marketIds.length) return;
        this.connectMarkets();
        marketIds.forEach((id) => this._subscribedMarketIds.add(id));
        if (this.marketsSocket?.connected) {
            this.marketsSocket.emit('subscribe:markets', { marketIds });
        }
        // If not yet connected, the 'connect' handler will re-subscribe from
        // _subscribedMarketIds automatically.
    }

    unsubscribeFromMarkets(marketIds: string[]) {
        if (!marketIds.length) return;
        marketIds.forEach((id) => this._subscribedMarketIds.delete(id));
        this.marketsSocket?.emit('unsubscribe:markets', { marketIds });
    }

    // ─── /events ──────────────────────────────────────────────────────────────

    connectEvent(eventId: string) {
        // Always update the tracked event so the 'connect' handler
        // subscribes to the correct event on reconnect / remount.
        this._currentEventId = eventId;

        if (this.eventsSocket !== null) {
            // Socket already exists (connecting or connected with auto-reconnect).
            // If connected, emit immediately; otherwise the 'connect' handler
            // will fire and use _currentEventId.
            if (this.eventsSocket.connected) {
                this.eventsSocket.emit('subscribe:event', { eventId });
            }
            return;
        }

        this.eventsSocket = io(`${WS_URL}/events`, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            auth: { token: getToken() },
        });

        this.eventsSocket.on('connect', () => {
            if (this._currentEventId) {
                this.eventsSocket!.emit('subscribe:event', { eventId: this._currentEventId });
            }
        });

        this.eventsSocket.on('score:update', ({ eventId: eid, data }: { eventId: string; data: { html?: string } }) => {
            if (data?.html) useBettingStore.getState().updateScorecard(eid, data.html);
        });

        this.eventsSocket.on('markets:new', ({ eventId: _eid }: { eventId: string }) => {
            window.dispatchEvent(new CustomEvent('betting:markets-new', { detail: { eventId: _eid } }));
        });

        this.eventsSocket.on('disconnect', () => { /* disconnected */ });
    }

    leaveEvent(eventId: string) {
        this._currentEventId = null;
        this.eventsSocket?.emit('unsubscribe:event', { eventId });
    }

    // ─── /user ────────────────────────────────────────────────────────────────

    connectUser() {
        if (this.userSocket !== null) return;

        this.userSocket = io(`${WS_URL}/user`, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            auth: { token: getToken() },
        });

        this.userSocket.on('balance:update', (data: { availableBalance?: number }) => {
            if (data?.availableBalance !== undefined) {
                useBettingStore.getState().setBalance(Number(data.availableBalance));
            }
        });

        this.userSocket.on('bet:settled', () => {
            window.dispatchEvent(new CustomEvent('betting:bet-settled'));
        });

        this.userSocket.on('disconnect', () => { /* disconnected */ });
    }

    // ─── Cleanup ───────────────────────────────────────────────────────────────

    disconnectAll() {
        this._subscribedMarketIds.clear();
        this._currentEventId = null;
        this.marketsSocket?.disconnect();
        this.eventsSocket?.disconnect();
        this.userSocket?.disconnect();
        this.marketsSocket = null;
        this.eventsSocket = null;
        this.userSocket = null;
    }
}

export const bettingSocketService = new BettingSocketService();
