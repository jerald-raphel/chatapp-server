const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io'); // Import socket.io
require('dotenv').config();

const app = express();
const server = http.createServer(app);  // Create HTTP server
  const io = socketIo(server, {
  cors: {
    origin: "https://chatapp-beryl-seven.vercel.app", // Frontend URL
    methods: ["GET", "POST"]
  }
});

// Express CORS middleware
app.use(cors({
  origin: "https://chatapp-beryl-seven.vercel.app",  // Allow the Vercel frontend domain
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Express middleware and routes
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
  





// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const http = require('http');
// const socketIo = require('socket.io');
// require('dotenv').config();

// const app = express();
// const server = http.createServer(app);

// const io = socketIo(server, {
//   cors: {
//     origin: "*", // Allow all origins for Socket.IO
//     methods: ["GET", "POST"]
//   }
// });

// // Express CORS middleware
// app.use(cors({
//   origin: "*", // Allow all origins for Express
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: false
// }));

// app.use(express.json());

// // Routes
// app.use('/api', require('./routes/auth'));
// app.use('/api/messages', require('./routes/messages'));

// // Socket.IO Event Handling
// let usersOnline = {};

// io.on('connection', (socket) => {
//   console.log('A user connected');

//   socket.on('send_message', (data) => {
//     const { senderName, receiverName, message } = data;
//     io.emit('receive_message', { senderName, receiverName, message });
//     console.log('Message sent from:', senderName, 'to:', receiverName);
//   });

//   socket.on('disconnect', () => {
//     console.log('User disconnected');
//   });
// });

// // MongoDB Connection and Server Start
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('MongoDB connected');
//     server.listen(process.env.PORT || 10000, () =>
//       console.log(`Server running on port ${process.env.PORT || 10000}`)
//     );
//   })
//   .catch(err => console.error('MongoDB connection error:', err));
