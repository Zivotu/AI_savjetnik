require("dotenv").config();
import express, { type Request, type Response, type NextFunction } from 'express';
import agentRouter from './routes/agent';
// Import the ElevenLabs TTS proxy router
import ttsRouter from './routes/tts';
import chatRouter from './routes/chat';
import transcriptsRouter from './routes/transcripts';
import solutionRouter from './routes/solution';
import summaryRouter from './routes/summary';

const app = express();

app.use(express.json());
// Logging middleware for debugging purposes
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(req.method, req.originalUrl, req.body);
  next();
});

app.use('/api/agent', agentRouter);
// Mount the TTS proxy under /api/tts
app.use('/api/tts', ttsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/transcripts', transcriptsRouter);
app.use('/api/solution', solutionRouter);
app.use('/api/summary', summaryRouter);

export default app;
