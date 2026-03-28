import { io, Socket } from 'socket.io-client';

class SocketService {
    private socket: Socket | null = null;
    private static instance: SocketService;
    private url: string = import.meta.env.VITE_SOCKET_URL

    private constructor() { }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public connect(): void {
        if (this.socket?.connected) return;

        const token = localStorage.getItem('authToken');

        this.socket = io(this.url, {
            transports: ['websocket'],
            autoConnect: true,
            query: token ? { token } : {}
        });

        this.socket.on('connect', () => { /* connected */ });

        this.socket.on('disconnect', () => { /* disconnected */ });

        this.socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });

        // Global event listeners (e.g., force logout)
        this.socket.on('force_logout', () => {
            console.warn('Force logout received');
            window.dispatchEvent(new CustomEvent('auth:force-logout'));
        });
    }

    public disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public joinRoom(eventId: string): void {
        if (!this.socket) this.connect();
        this.socket?.emit('join_dream', { eventId: `evn_${eventId}` });
    }

    public leaveRoom(eventId: string): void {
        if (!this.socket) return;
        // console.log(`Leaving room: evn_${eventId}`);
        // Note: The backend might not have an explicit leave event, 
        // but typically joining another room or disconnecting handles it in some setups.
        // If there's a specific leave event, emit it here. 
        // For now, we assume simple subscription.
        this.socket?.emit('leave_dream', { eventId: `evn_${eventId}` }); // tentative, verify if backend supports this
    }

    public on(event: string, callback: (...args: any[]) => void): void {
        this.socket?.on(event, callback);
    }

    public off(event: string, callback: (...args: any[]) => void): void {
        this.socket?.off(event, callback);
    }

    public isConnected(): boolean {
        return !!this.socket?.connected;
    }
}

export const socketService = SocketService.getInstance();
