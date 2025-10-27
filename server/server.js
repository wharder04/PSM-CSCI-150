// server/server.js
// ES Modules version (use "type": "module" in server/package.json)
// password PSMisbest for database
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import taskRoutes from './routes/taskRoutes.js';


dotenv.config(); // Loads .env (MONGO_URI, PORT, etc.)

// ---------------------------
// App & Middleware
// ---------------------------
const app = express();

// Allow the client (different origin/port) to call the API
app.use(cors());

// Parse JSON bodies (application/json)
app.use(express.json());

//routes section
app.use('/api/users', userRoutes);

// Optional: Parse URL-encoded form bodies (e.g., HTML forms)
app.use(express.urlencoded({ extended: false }));

app.use(helmet());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 })); // limit abuse

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/tasks', taskRoutes);

// ---------------------------
// Health / Root routes
// ---------------------------
app.get('/', (_req, res) => {
  res.send('API is alive');
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, message: 'Server is running!' });
});

// ---------------------------
// 404 handler (after your routes)
// ---------------------------
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Not Found' });
});

// ---------------------------
// Error handler (last in the chain)
// ---------------------------
/* eslint-disable no-unused-vars */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    ok: false,
    error: err.message || 'Server error',
  });
});
/* eslint-enable no-unused-vars */

// ---------------------------
// Startup / DB connection
// ---------------------------
const start = async () => {
  try {
    const { MONGO_URI, PORT = 5000 } = process.env;
    if (!MONGO_URI) throw new Error('MONGO_URI is not set in .env');

    // Connect to MongoDB (Mongoose 7+ sensible defaults)
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');

    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });

    // Graceful shutdown helpers
    const shutdown = (signal) => {
      console.log(`\n${signal} received. Closing server...`);
      server.close(async () => {
        try {
          await mongoose.connection.close();
          console.log('🛑 HTTP server closed. 🛑 MongoDB connection closed.');
        } finally {
          process.exit(0);
        }
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled Promise Rejection:', reason);
      shutdown('unhandledRejection');
    });

    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      shutdown('uncaughtException');
    });

  } catch (err) {
    console.error('❌ Startup failed:', err.message);
    process.exit(1);
  }
};

start();
