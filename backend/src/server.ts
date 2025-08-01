import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import agentRouter from './routes/agent';
import ttsRouter from './routes/tts';
import chatRouter from './routes/chat';
import transcriptsRouter from './routes/transcripts';
import solutionRouter from './routes/solution';
import summaryRouter from './routes/summary';

const app = express();

/* ─────────────── middlewares ─────────────── */
app.use(cors());

app.use(
  rateLimit({
    windowMs: 60_000,      // 1 minuta
    max: 30,               // 30 zahtjeva po IP
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use(express.json({ limit: '4mb' }));

// jednostavan logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

/* ───────────────  API rute  ─────────────── */
app.use('/api/agent', agentRouter);
app.use('/api/tts', ttsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/transcripts', transcriptsRouter);
app.use('/api/solution', solutionRouter);
app.use('/api/summary', summaryRouter);

/* ─────────────── fallback & error ─────────────── */
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'not_found' });
});

// globalni error-handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'internal_error' });
});

export default app;
