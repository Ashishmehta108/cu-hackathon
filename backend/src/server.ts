import './bootstrap-env';
import express from 'express';
import cors from 'cors';
import multer from 'multer';

import { sarvamRoutes } from './routes/sarvam';
import { complaintRoutes } from './routes/complaints';
import { wikiRoutes } from './routes/wiki';
import { emailRoutes } from './routes/email';
import { testRoutes } from './routes/test';
import { adminRoutes } from './routes/admin';
import { authRoutes } from './routes/auth';
import { initPinecone } from './services/vectorService';
import { startEscalationAgent } from './services/escalationService';
import { requestLogger } from './middlewares/requestLogger';
import { errorMiddleware } from './middlewares/errorMiddleware';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', message: 'Awaaz API Server is running', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/sarvam', sarvamRoutes(upload));
app.use('/api/complaints', complaintRoutes);
app.use('/api/wiki', wikiRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/test', testRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

app.use('/uploads', express.static('uploads'));

// ─── Bootstrap ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

initPinecone()
    .then(() => {
        startEscalationAgent();
        app.listen(PORT, () => {
            console.log(`✅  Awaaz server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌  Failed to initialize Pinecone:', err);
        process.exit(1);
    });
