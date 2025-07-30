import { Router, Request, Response } from "express";
import { appendTurn } from "../utils/storage";

const router = Router();

/**
 * Proxy to ElevenLabs Conversation text endpoint.
 */
router.post('/', async (req: Request, res: Response) => {
  const { conversationId, text } = req.body as {
    conversationId: string;
    text: string;
    language?: 'hr' | 'en';
  };

  if (!conversationId || !text) {
    res.status(400).json({ error: 'Missing conversationId or text' });
    return;
  }

  try {
    const apiRes = await fetch('https://api.elevenlabs.io/v1/conversation', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        text,
        model_id: 'eleven_multilingual_v2',
      }),
    });

    if (!apiRes.ok) {
      const data = await apiRes.json().catch(() => ({}));
      res.status(apiRes.status).json({ error: data.error || data.message });
      return;
    }

    const data = (await apiRes.json()) as { reply: string };
    const reply = data.reply;

    await appendTurn(conversationId, {
      role: 'assistant',
      text: reply,
      mode: 'chat',
    });

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'Chat request failed' });
  }
});

export default router;
