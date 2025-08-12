import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import messageRoutes from './routes/messageRoutes';
import uploadRoutes from './routes/uploadRoutes';
import authRoutes from './routes/authRoutes';
import { setupBot } from './config/telegramBot';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint for Railway
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('frontend/build'));
  
  app.get('*', (req, res) => {
    res.sendFile('frontend/build/index.html', { root: '.' });
  });
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-chat', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their chat room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to other modules
declare global {
  namespace Express {
    interface Request {
      io?: Server;
    }
  }
}

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/telegram-chat-app';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Initialize Telegram bot after MongoDB connection
    setupBot(io);
    
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check available at: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

export { io }; 