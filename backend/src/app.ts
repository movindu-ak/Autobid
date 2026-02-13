import express, { Application } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler, notFound } from './middleware/error.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import vehicleRoutes from './routes/vehicle.routes';
import bidRoutes from './routes/bid.routes';
import walletRoutes from './routes/wallet.routes';

const app: Application = express();

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AutoBid API is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/wallet', walletRoutes);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to AutoBid API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      vehicles: '/api/vehicles',
      bids: '/api/bids',
      wallet: '/api/wallet',
    },
  });
});

// Error handlers (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
