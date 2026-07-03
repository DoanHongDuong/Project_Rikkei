import { io, Socket } from 'socket.io-client';
import AuthService from './authService';

class SocketService {
    private socket: Socket | null = null;

    public connect() {
        if (this.socket) return;

        const token = AuthService.getToken();
        if (!token) return;

        this.socket = io(import.meta.env.BACKEND_URL || 'http://localhost:5000', {
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public on(eventName: string, callback: (...args: unknown[]) => void) {
        if (this.socket) {
            this.socket.on(eventName, callback as never);
        }
    }

    public off(eventName: string, callback: (...args: unknown[]) => void) {
        if (this.socket) {
            this.socket.off(eventName, callback as never);
        }
    }

    public isConnected(): boolean {
        return this.socket?.connected ?? false;
    }
}

export default new SocketService();
