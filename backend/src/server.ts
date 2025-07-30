import express from 'express';
import agentRouter from './routes/agent';
// Import the ElevenLabs TTS proxy router
import ttsRouter from './routes/tts';
import chatRouter from './routes/chat';
import transcriptsRouter from './routes/transcripts';
import solutionRouter from './routes/solution';

const app = express();

app.use(express.json());

app.use('/api/agent', agentRouter);
// Mount the TTS proxy under /api/tts
app.use('/api/tts', ttsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/transcripts', transcriptsRouter);
app.use('/api/solution', solutionRouter);

export default app;
