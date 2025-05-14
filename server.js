const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io'); // Import socket.io
require('dotenv').config();

const app = express();
const server = http.createServer(app);  // Create HTTP server
const io = socketIo(server, {          // Attach Socket.IO to the server with CORS support
  cors: {
    origin: "https://chatapp-swart-iota.vercel.app", // ✅ Frontend URL  
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: "https://chatapp-swart-iota.vercel.app",  // Allow the Vercel frontend domain
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', require('./routes/auth'));
app.use('/api/messages', require('./routes/messages')); // Message routes here

// Socket.IO Event Handling
let usersOnline = {};  // Store online users by name

io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for a new message
  socket.on('send_message', (data) => {
    const { senderName, receiverName, message } = data;

    // Emit the message to the receiver
    io.emit('receive_message', { senderName, receiverName, message });

    console.log('Message sent from:', senderName, 'to:', receiverName);
  });

  // Listen for a user disconnecting
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Connect DB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(process.env.PORT || 10000, () => console.log(`Server running on port ${process.env.PORT || 10000}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
  



