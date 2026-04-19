import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

import { initSocket } from './socket';
import authRoutes from './routes/auth';
import applicationRoutes from './routes/applications';
import analyticsRoutes from './routes/analytics';
import resumeRoutes from './routes/resumes';
import interviewRoutes from './routes/interviews';
import notificationRoutes from './routes/notifications';
import tagRoutes from './routes/tags';
import paymentRoutes from './routes/payments';
import adminRoutes from './routes/admin';

const app = express();
const server = http.createServer(app);

initSocket(server);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads')));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 InternTrack Pro backend running on port ${PORT}`);
});

export default app;
