import fs from 'node:fs/promises';
import path from 'node:path';

const DIR = path.resolve(__dirname, '../../transcripts');

type Turn = {
  role: 'user' | 'assistant' | 'tool';
  text?: string;
  solutionText?: string;
  cta?: string;
  phase?: 'intro' | 'collect' | 'closing' | 'ended';
  mode?: 'voice' | 'chat';
  ts?: string;
};

const filePath = (id: string) => path.join(DIR, `${id}.json`);

async function readConversation(id: string) {
  try {
    return JSON.parse(await fs.readFile(filePath(id), 'utf8'));
  } catch {
    return { id, created: new Date().toISOString(), turns: [] as Turn[] };
  }
}

export async function writeAtomic(p: string, data: string) {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(p, data, "utf8");        // simple, safe on Windows
}

export async function appendTurn(id: string, turn: Turn) {
  const convo = await readConversation(id);
  (convo.turns as Turn[]).push({ ...turn, ts: new Date().toISOString() });
  await writeAtomic(filePath(id), JSON.stringify(convo, null, 2));
}

export async function updateConversation(
  id: string,
  patch: Record<string, unknown>,
) {
  const convo = await readConversation(id);
  Object.assign(convo, patch);
  await writeAtomic(filePath(id), JSON.stringify(convo, null, 2));
}

