const socketIo = require('socket.io');

function initSocketServer(httpServer) {
    const io = socketIo(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });

        // Add your socket event handlers here
    });

    return io;
}

module.exports = initSocketServer;
