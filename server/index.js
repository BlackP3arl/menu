import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.VITE_APP_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));

app.use(cors({
  origin: process.env.VITE_APP_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join restaurant room for real-time updates
  socket.on('join-restaurant', (restaurantId) => {
    socket.join(`restaurant-${restaurantId}`);
    console.log(`Socket ${socket.id} joined restaurant-${restaurantId}`);
  });

  // Leave restaurant room
  socket.on('leave-restaurant', (restaurantId) => {
    socket.leave(`restaurant-${restaurantId}`);
    console.log(`Socket ${socket.id} left restaurant-${restaurantId}`);
  });

  // Handle order updates
  socket.on('order-update', (data) => {
    const { restaurantId, orderId, status, tableNumber } = data;
    
    // Broadcast to all clients in the restaurant room
    socket.to(`restaurant-${restaurantId}`).emit('order-status-changed', {
      orderId,
      status,
      tableNumber,
      timestamp: new Date().toISOString()
    });
    
    console.log(`Order ${orderId} status updated to ${status}`);
  });

  // Handle new orders
  socket.on('new-order', (data) => {
    const { restaurantId, order } = data;
    
    // Broadcast to kitchen and staff interfaces
    socket.to(`restaurant-${restaurantId}`).emit('new-order-received', {
      order,
      timestamp: new Date().toISOString()
    });
    
    console.log(`New order ${order.order_number} received for restaurant ${restaurantId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// API Routes placeholder
app.get('/api/restaurants/:id', (req, res) => {
  // This would typically fetch from database
  res.json({ 
    message: 'Restaurant data would be fetched from Supabase',
    id: req.params.id 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.VITE_APP_URL || 'http://localhost:5173'}`);
  console.log(`🔌 Socket.IO enabled for real-time updates`);
  console.log(`🗄️  Database: Supabase (${process.env.VITE_SUPABASE_URL ? 'Connected' : 'Not configured'})`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});