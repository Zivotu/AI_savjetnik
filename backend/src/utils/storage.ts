import fs from "node:fs/promises";
import path from "node:path";

export interface Turn {
  role: "user" | "assistant" | "tool";
  text: string;
  t: number;
  phase?: Conversation["phase"];
}

export interface Conversation {
  id: string;
  createdAt: string;
  language?: "hr" | "en";
  phase: "intro" | "collect" | "closing" | "ended";
  mode: "voice" | "chat";
  turns: Turn[];
  solution?: { solutionText: string; cta: string };
  contact?: { email?: string; phone?: string };
  ended?: boolean;
}

const DIR = path.join(process.cwd(), "backend", "transcripts");

async function readConversation(file: string, id: string): Promise<Conversation> {
  try {
    const data = await fs.readFile(file, "utf-8");
    return JSON.parse(data) as Conversation;
  } catch {
    return {
      id,
      createdAt: new Date().toISOString(),
      phase: "intro",
      mode: "chat",
      turns: [],
    };
  }
}

async function writeConversation(file: string, convo: Conversation) {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(file, JSON.stringify(convo, null, 2), "utf-8");
}

async function appendTurn(
  conversationId: string,
  turn: Turn & { mode?: Conversation["mode"] }
) {
  const file = path.join(DIR, `${conversationId}.json`);
  const convo = await readConversation(file, conversationId);
  convo.turns.push(turn);
  if (turn.phase) {
    convo.phase = turn.phase;
  }
  if (turn.mode) {
    convo.mode = turn.mode;
  }
  await writeConversation(file, convo);
}

async function updateConversation(
  conversationId: string,
  patch: Partial<Conversation>
) {
  const file = path.join(DIR, `${conversationId}.json`);
  const convo = await readConversation(file, conversationId);
  Object.assign(convo, patch);
  await writeConversation(file, convo);
}

async function getConversation(
  conversationId: string
): Promise<Conversation | null> {
  const file = path.join(DIR, `${conversationId}.json`);
  try {
    const data = await fs.readFile(file, "utf-8");
    return JSON.parse(data) as Conversation;
  } catch {
    return null;
  }
}

export default { appendTurn, updateConversation, getConversation };
