import { Router, Request, Response } from 'express';
import { getRealtimeClient } from '../realtimeClient';

const router = Router();

/**
 * Health/handshake ruta — potvrđuje da je server spojen na Realtime API.
 */
router.post('/session', async (_req: Request, res: Response) => {
  try {
    await getRealtimeClient();

    // Umjesto rt.getSession()?.model koristimo konfigurirani model iz okoline
    const model = process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview-2024-12-17';

    res.json({
      success: true,
      error: null,
      data: {
        status: 'connected',
        model
      }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      success: false,
      error: {
        code: 'realtime_session_failed',
        message
      }
    });
  }
});

/**
 * Primjer "pošalji tekst i pričekaj odgovor" (server-side).
 * Za prave voice use-caseove češće se koristi browser/WebRTC ili klijentov WS.
 */
type OutputTextDelta = { type?: string; delta?: string };
type ConversationItem = { type?: string; status?: string };
type ConversationUpdatedEvent = {
  item?: ConversationItem;
  delta?: OutputTextDelta;
};

router.post('/say', async (req: Request, res: Response) => {
  const { text } = req.body as { text?: string };
  if (!text) {
    res
      .status(400)
      .json({ success: false, error: { code: 'missing_text', message: 'Missing text' } });
    return;
  }
  try {
    const rt = await getRealtimeClient();

    const answer = await new Promise<string>((resolve, reject) => {
      let acc = '';

      const onUpdate = (evt: ConversationUpdatedEvent): void => {
        if (evt.delta?.type === 'response.output_text.delta' && typeof evt.delta.delta === 'string') {
          acc += evt.delta.delta;
        }
        if (evt.item?.type === 'message' && evt.item.status === 'completed') {
          rt.off('conversation.updated', onUpdate);
          resolve(acc.trim());
        }
      };

      rt.on('conversation.updated', onUpdate);

      rt.sendUserMessageContent([{ type: 'input_text', text }]);
      rt.createResponse();

      setTimeout(() => {
        rt.off('conversation.updated', onUpdate);
        if (acc) resolve(acc.trim());
        else reject(new Error('Realtime timeout'));
      }, 15_000);
    });

    res.json({ success: true, error: null, data: { text: answer } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      success: false,
      error: { code: 'realtime_failed', message }
    });
  }
});

export default router;
