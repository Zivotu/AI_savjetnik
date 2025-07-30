import { Router } from 'express';
import { appendTurn, updateConversation } from '../utils/storage';

const router = Router();

router.post('/', async (req, res) => {
  const { conversationId, role, text, phase, mode } = req.body as {
    conversationId: string;
    role: 'user' | 'assistant' | 'tool';
    text: string;
    phase?: 'intro' | 'collect' | 'closing' | 'ended';
    mode?: 'voice' | 'chat';
  };

  await appendTurn(conversationId, { role, text, phase, mode });

  if (phase === 'ended') {
    await updateConversation(conversationId, {
      finished: true,
      finishedAt: new Date().toISOString(),
    });
  }

  res.status(200).json({ ok: true });
});

export default router;
