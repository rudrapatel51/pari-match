import axios, { AxiosInstance } from 'axios';

const BETTING_BASE_URL =
    import.meta.env.VITE_BETTING_API_URL || 'http://localhost:3000/api/betting/';

/** Axios instance targeting the dedicated betting API base URL */
const bettingClient: AxiosInstance = axios.create({
    baseURL: BETTING_BASE_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer token from localStorage to every request
bettingClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Return response.data directly (mirrors main apiClient behaviour)
bettingClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message =
            error.response?.data?.error?.message ||
            error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            'Something went wrong';
        console.error('[BettingAPI Error]', message);
        return Promise.reject(new Error(message));
    }
);

export default bettingClient;

/** Named API functions — prefer these over raw bettingClient.get/post in components */
export const bettingApi = {
    getSports: () =>
        bettingClient.get<any>('sports'),
    getLiveEvents: () =>
        bettingClient.get<any>('events/live'),
    getEventsBySport: (sportId: string | number) =>
        bettingClient.get<any>(`sports/${sportId}/events`),
    getEventById: (eventId: string) =>
        bettingClient.get<any>(`events/${eventId}`),
    getEventMarkets: (eventId: string) =>
        bettingClient.get<any>(`events/${eventId}/markets`),
    getActiveBets: () =>
        bettingClient.get<any>('bets/active'),
    getBetHistory: () =>
        bettingClient.get<any>('bets/history'),
    placeBet: (payload: Record<string, unknown>) =>
        bettingClient.post<any>('bets/place', payload),
};
