const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    // Socket.io setup
    const io = new Server(server, {
        cors: {
            origin: process.env.NODE_ENV === 'production'
                ? ['https://hoffmann-niklas.de', 'https://www.hoffmann-niklas.de']
                : 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Active chat sessions: Map<socketId, sessionId>
    const activeSessions = new Map();

    // Track online users per session: Map<sessionId, Set<socketId>>
    const sessionUsers = new Map();

    // Track admin sockets: Set<socketId>
    const adminSockets = new Set();

    io.on('connection', (socket) => {
        console.log('✅ Client connected:', socket.id);

        // Join a chat session
        socket.on('join-session', async (data) => {
            const { sessionId, userName } = data;

            // Join socket.io room
            socket.join(sessionId);
            activeSessions.set(socket.id, sessionId);

            // Track user in session
            if (!sessionUsers.has(sessionId)) {
                sessionUsers.set(sessionId, new Set());
            }
            sessionUsers.get(sessionId).add(socket.id);

            console.log(`👤 Socket ${socket.id} joined session ${sessionId} (${userName || 'Anonymous'})`);
            console.log(`📊 Active users in ${sessionId}: ${sessionUsers.get(sessionId).size}`);

            // Notify ALL admins about new session (even if they're not viewing this specific session)
            adminSockets.forEach(adminSocketId => {
                io.to(adminSocketId).emit('new-session-started', {
                    sessionId,
                    userName: userName || 'Anonymous',
                    timestamp: new Date().toISOString()
                });
            });

            // Notify others in session about new user
            socket.to(sessionId).emit('user-joined', {
                sessionId,
                userName: userName || 'Anonymous',
                activeUsers: sessionUsers.get(sessionId).size
            });

            // Send current active count to joining user
            socket.emit('session-joined', {
                sessionId,
                activeUsers: sessionUsers.get(sessionId).size
            });
        });

        // Handle new message (real-time broadcast, DB save happens via API)
        socket.on('send-message', (data) => {
            const { sessionId, message, sender, timestamp, _id } = data;

            const messageData = {
                _id,
                sessionId,
                message,
                sender,
                timestamp: timestamp || new Date().toISOString(),
                read: sender === 'admin' // Admin messages auto-marked as read
            };

            // Broadcast to ALL clients in this session (including sender for confirmation)
            io.to(sessionId).emit('new-message', messageData);

            // ALSO notify all admin sockets (for notification purposes)
            if (sender === 'user') {
                console.log(`📢 Broadcasting to ${adminSockets.size} admin(s)`);

                // Send admin:new-message to ALL admins (for beep notification)
                adminSockets.forEach(adminSocketId => {
                    io.to(adminSocketId).emit('admin:new-message', { sessionId });
                });

                // Also send new-message to admins NOT in this room (for message display)
                adminSockets.forEach(adminSocketId => {
                    const adminSocket = io.sockets.sockets.get(adminSocketId);
                    // Only send if admin is NOT already in this session room
                    if (adminSocket && !adminSocket.rooms.has(sessionId)) {
                        io.to(adminSocketId).emit('new-message', messageData);
                    }
                });
            }

            console.log(`💬 Message in session ${sessionId} from ${sender}: ${message.substring(0, 50)}...`);
        });

        // Typing indicator (only to others, not self)
        socket.on('typing', (data) => {
            const { sessionId, isTyping, userName } = data;

            // Send to session room (for admins who are viewing this chat)
            socket.to(sessionId).emit('user-typing', {
                isTyping,
                userName: userName || 'Someone'
            });

            // ALSO notify all admin sockets (for notification/indicator in session list)
            if (isTyping) {
                adminSockets.forEach(adminSocketId => {
                    io.to(adminSocketId).emit('user:typing', { sessionId });
                });
                console.log(`✍️ ${userName || 'User'} is typing in ${sessionId}`);
            }
        });

        // Mark messages as read (notify others)
        socket.on('mark-read', (data) => {
            const { sessionId, sender } = data;
            socket.to(sessionId).emit('messages-read', { sender });
            console.log(`✅ Messages marked as read in ${sessionId} (sender: ${sender})`);
        });

        // Admin joins (notify user that admin is online)
        socket.on('admin-online', (sessionId) => {
            socket.to(sessionId).emit('admin-status', { online: true });
            console.log(`👨‍💼 Admin online in session ${sessionId}`);
        });

        // Admin leaves
        socket.on('admin-offline', (sessionId) => {
            socket.to(sessionId).emit('admin-status', { online: false });
            console.log(`👨‍💼 Admin offline in session ${sessionId}`);
        });

        // Admin joins admin panel
        socket.on('admin:join', () => {
            adminSockets.add(socket.id);
            console.log(`👨‍💼 Admin joined panel: ${socket.id}`);
        });

        // Admin leaves admin panel
        socket.on('admin:leave', () => {
            adminSockets.delete(socket.id);
            console.log(`👨‍💼 Admin left panel: ${socket.id}`);
        });

        // Admin joins specific session
        socket.on('admin:join-session', (data) => {
            const { sessionId } = data;
            socket.join(sessionId);
            socket.to(sessionId).emit('admin-status', { online: true });
            console.log(`👨‍💼 Admin joined session ${sessionId}`);
        });

        // Admin sends message
        socket.on('admin:message', (data) => {
            const { sessionId, message } = data;
            socket.to(sessionId).emit('new-message', message);
            console.log(`👨‍💼 Admin message in ${sessionId}: ${message.message?.substring(0, 50)}...`);
        });

        // Admin typing indicator
        socket.on('admin:typing', (data) => {
            const { sessionId, isTyping } = data;
            socket.to(sessionId).emit('admin-typing', { isTyping: isTyping !== false }); // Default to true if not specified
            if (isTyping !== false) {
                console.log(`👨‍💼 Admin typing in ${sessionId}`);
            }
        });

        // User typing (notify admin)
        socket.on('user:typing', (data) => {
            const { sessionId } = data;
            // Notify all admin sockets
            adminSockets.forEach(adminSocketId => {
                io.to(adminSocketId).emit('user:typing', { sessionId });
            });
        });

        // Session deleted (notify user)
        socket.on('session-deleted', (data) => {
            const { sessionId } = data;
            // Notify all clients in this session
            io.to(sessionId).emit('session-deleted', { sessionId });
            console.log(`🗑️ Session ${sessionId} deleted - notifying clients`);
        });

        // User blocked (notify user)
        socket.on('user-blocked', (data) => {
            const { sessionId } = data;
            // Notify user in this session
            io.to(sessionId).emit('user-blocked', {
                message: 'You have been blocked from this chat.'
            });
            console.log(`🚫 User in session ${sessionId} blocked`);
        });

        // Disconnect
        socket.on('disconnect', () => {
            const sessionId = activeSessions.get(socket.id);

            // Remove from admin sockets if admin
            adminSockets.delete(socket.id);

            if (sessionId) {
                // Remove from session users
                const users = sessionUsers.get(sessionId);
                if (users) {
                    users.delete(socket.id);

                    // Notify others about user leaving
                    socket.to(sessionId).emit('user-left', {
                        sessionId,
                        activeUsers: users.size
                    });

                    // Clean up empty sessions
                    if (users.size === 0) {
                        sessionUsers.delete(sessionId);
                    }
                }

                console.log(`👋 Socket ${socket.id} left session ${sessionId}`);
                activeSessions.delete(socket.id);
            }

            console.log('❌ Client disconnected:', socket.id);
        });
    });

    // Make io globally available for API routes (optional)
    global.io = io;

    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://${hostname}:${port}`);
        console.log(`> Socket.io server running`);
    });
});
