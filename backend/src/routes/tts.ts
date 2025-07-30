import { Router, Request, Response } from "express";

// Router for ElevenLabs text-to-speech proxy
const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { text, voiceId = process.env.ELEVENLABS_VOICE_ID, modelId = 'eleven_multilingual_v2' } = req.body as {
    text?: string;
    voiceId?: string;
    modelId?: string;
  };

  if (!text) {
    res.status(400).json({ error: 'Missing text' });
    return;
  }

  try {
    const apiRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: { similarity_boost: 0.5, stability: 0.35 },
        }),
      }
    );

    if (!apiRes.ok) {
      const data = await apiRes.json().catch(() => ({}));
      res.status(apiRes.status).json({ error: data.error || data.message });
      return;
    }

    // Propagate status and headers then pipe stream to client
    res.status(apiRes.status);
    res.setHeader('Content-Type', apiRes.headers.get('Content-Type') || 'audio/mpeg');
    (apiRes.body as any)?.pipe(res as any);
  } catch (err) {
    res.status(500).json({ error: 'TTS request failed' });
  }
});

export default router;
