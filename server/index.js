import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const players = new Map();

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('playerUpdate', (data) => {
    players.set(socket.id, {
      id: socket.id,
      ...data,
      timestamp: Date.now()
    });

    // Broadcast game state to all clients
    io.emit('gameState', Array.from(players.values()));
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    players.delete(socket.id);
    io.emit('gameState', Array.from(players.values()));
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

