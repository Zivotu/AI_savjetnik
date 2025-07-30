import express from 'express';
import agentRouter from './routes/agent';

const app = express();

app.use(express.json());

app.use('/api/agent', agentRouter);

export default app;
