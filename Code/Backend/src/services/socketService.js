const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

class SocketService {
    constructor() {
        this.io = null;
        this.connectedUsers = new Map();
    }

    init(server) {
        this.io = socketIo(server, {
            cors: {
                origin: process.env.FRONTEND_URL,
                methods: ["GET", "POST", "PUT", "DELETE"],
                credentials: true
            }
        });

        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token;
            
            if (!token) {
                return next(new Error('Authentication error: Token missing'));
            }

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.userId = String(decoded.id);
                next();
            } catch (error) {
                return next(new Error('Authentication error: Invalid token'));
            }
        });

        this.io.on('connection', (socket) => {
            const userId = socket.userId;

            if (!this.connectedUsers.has(userId)) {
                this.connectedUsers.set(userId, new Set());
            }
            this.connectedUsers.get(userId).add(socket.id);

            socket.on('disconnect', () => {
                if (this.connectedUsers.has(userId)) {
                    this.connectedUsers.get(userId).delete(socket.id);
                    if (this.connectedUsers.get(userId).size === 0) {
                        this.connectedUsers.delete(userId);
                    }
                }
            });
        });
    }

    /**
     * Emits an event to a specific user if they are connected
     * @param {number|string} userId 
     * @param {string} eventName 
     * @param {any} payload 
     */
    emitToUser(userId, eventName, payload) {
        if (!this.io) return;

        const key = String(userId);
        const userSockets = this.connectedUsers.get(key);

        if (userSockets && userSockets.size > 0) {
            userSockets.forEach(socketId => {
                this.io.to(socketId).emit(eventName, payload);
            });
        }
    }
}

module.exports = new SocketService();
