const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict this to your frontend URL
    methods: ["GET", "POST"]
  }
});

/**
 * In-memory room storage.
 * Key: roomId
 * Value: Set of socket IDs
 */
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    // Limit to 2 users per room for 1-on-1 chat
    const room = rooms.get(roomId) || new Set();
    
    if (room.size >= 2) {
      socket.emit('error', 'Room is full');
      return;
    }

    room.add(socket.id);
    rooms.set(roomId, room);
    socket.join(roomId);
    
    console.log(`User ${socket.id} joined room ${roomId}. Room size: ${room.size}`);

    // Notify the existing user (Host) that someone new has joined
    // We use socket.to(roomId) to send to everyone in the room EXCEPT the sender
    socket.to(roomId).emit('user-joined', socket.id);
  });

  socket.on('signal', (data) => {
    // data: { to, signal, roomId }
    socket.to(data.to).emit('signal', {
      from: socket.id,
      signal: data.signal
    });
  });

  socket.on('chat-message', (data) => {
    // data: { roomId, msg }
    socket.to(data.roomId).emit('chat-message', data.msg);
  });

  socket.on('screen-share-status', (data) => {
    // data: { roomId, isSharing }
    socket.to(data.roomId).emit('screen-share-status', data.isSharing);
  });

  socket.on('disconnecting', () => {
    for (const roomId of socket.rooms) {
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        room.delete(socket.id);
        
        if (room.size === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} purged from memory.`);
        } else {
          socket.to(roomId).emit('user-left', socket.id);
          console.log(`User ${socket.id} left room ${roomId}. Remaining: ${room.size}`);
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
