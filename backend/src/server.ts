import express from 'express';
import agentRouter from './routes/agent';
// Import the ElevenLabs TTS proxy router
import ttsRouter from './routes/tts';

const app = express();

app.use(express.json());

app.use('/api/agent', agentRouter);
// Mount the TTS proxy under /api/tts
app.use('/api/tts', ttsRouter);

export default app;
