import fs from 'node:fs/promises';
import path from 'node:path';

const DIR = path.resolve(__dirname, '../../transcripts');

async function readConversation(id: string): Promise<Record<string, any>> {
  const file = path.join(DIR, `${id}.json`);
  try {
    const data = await fs.readFile(file, 'utf8');
    return JSON.parse(data);
  } catch {
    return { id, created: new Date().toISOString(), turns: [] };
  }
}

async function writeConversation(id: string, convo: Record<string, any>): Promise<void> {
  await fs.mkdir(DIR, { recursive: true });
  const file = path.join(DIR, `${id}.json`);
  await fs.writeFile(file, JSON.stringify(convo, null, 2), 'utf8');
}

export async function appendTurn(id: string, turn: Record<string, any>): Promise<void> {
  const convo = await readConversation(id);
  if (!Array.isArray(convo.turns)) {
    convo.turns = [];
  }
  turn.t = Date.now();
  convo.turns.push(turn);
  await writeConversation(id, convo);
}

export async function updateConversation(id: string, patch: Record<string, any>): Promise<void> {
  const convo = await readConversation(id);
  Object.assign(convo, patch);
  await writeConversation(id, convo);
}
