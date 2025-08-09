import { RealtimeClient } from '@openai/realtime-api-beta';

let client: RealtimeClient | null = null;

type OutputTextDelta = { type?: string; delta?: string };
type ConversationItem = { type?: string; status?: string };
type ConversationUpdatedEvent = {
  item?: ConversationItem;
  delta?: OutputTextDelta;
};

export async function getRealtimeClient(): Promise<RealtimeClient> {
  if (client) return client;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is missing');

  const model =
    process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview-2024-12-17';

  // ⬇️ Konstruktorski options NE podržavaju 'model' → prebačeno u updateSession
  client = new RealtimeClient({ apiKey });

  client.updateSession({
    model,
    voice: 'alloy',
    modalities: ['audio', 'text'],
    instructions: 'AI Savjetnik - hrvatski default, engleski fallback.'
    // turn_detection: { type: 'server_vad' }, // po potrebi
  });

  client.on('error', (e: unknown) => {
    console.error('[Realtime error]', e);
  });

  client.on('conversation.updated', (evt: ConversationUpdatedEvent) => {
    if (evt.delta?.type === 'response.output_text.delta' && typeof evt.delta.delta === 'string') {
      // process.stdout.write(evt.delta.delta);
    }
  });

  await client.connect();
  return client;
}
