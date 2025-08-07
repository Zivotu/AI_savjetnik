import { Router, Request, Response } from 'express';
import { appendTurn, updateConversation } from '../utils/storage';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  console.log('POST /agent', req.body);
  const { conversationId, role, text, phase, mode } = req.body as {
    conversationId?: string;
    role?: 'user' | 'assistant' | 'tool';
    text?: string;
    phase?: 'intro' | 'collect' | 'closing' | 'ended';
    mode?: 'voice' | 'chat';
  };

  if (!conversationId || !role || !text) {
    res
      .status(400)
      .json({ error: 'Missing conversationId, role, or text' });
    return;
  }

  try {
    await appendTurn(conversationId, { role, text, phase, mode });

    if (phase === 'ended') {
      await updateConversation(conversationId, {
        finished: true,
        finishedAt: new Date().toISOString(),
      });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});

export default router;
