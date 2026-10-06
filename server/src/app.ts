import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';

import plotRoutes from './routes/plots';
import advisoryRoutes from './routes/advisory';
import diagnosticsRoutes from './routes/diagnostics';

dotenv.config();

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'AgroAdvisor AI Core Online' });
});

// API Routes
app.use('/api/v1/plots', plotRoutes);
app.use('/api/v1/advisory', advisoryRoutes);
app.use('/api/v1/diagnostics', diagnosticsRoutes);

// Global Error Handler
app.use(errorHandler);

export { app };
