import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const DIR = path.resolve(__dirname, '../../transcripts');

type Turn = {
  role: 'user' | 'assistant' | 'tool';
  text: string;
  phase?: 'intro' | 'collect' | 'closing' | 'ended';
  mode?: 'voice' | 'chat';
  ts?: string;
};

async function readConversation(id: string) {
  try {
    return JSON.parse(await fs.readFile(filePath(id), 'utf8'));
  } catch {
    return { id, created: new Date().toISOString(), turns: [] as Turn[] };
  }
}

async function writeAtomic(id: string, convo: unknown) {
  await fs.mkdir(DIR, { recursive: true });
  const tmp = path.join(DIR, `${randomUUID()}.tmp`);
  await fs.writeFile(tmp, JSON.stringify(convo, null, 2), 'utf8');
  await fs.rename(tmp, filePath(id));
}

const filePath = (id: string) => path.join(DIR, `${id}.json`);

export async function appendTurn(id: string, turn: Turn) {
  const convo = await readConversation(id);
  (convo.turns as Turn[]).push({ ...turn, ts: new Date().toISOString() });
  await writeAtomic(id, convo);
}

export async function updateConversation(id: string, patch: Record<string, unknown>) {
  const convo = await readConversation(id);
  Object.assign(convo, patch);
  await writeAtomic(id, convo);
}
