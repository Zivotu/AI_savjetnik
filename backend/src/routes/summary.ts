import { Router, Request, Response } from "express";
import { appendTurn } from "../utils/storage";
import { summarizeConversation } from "../utils/llm";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { transcript, language } = req.body as { transcript: string; language: "hr" | "en" };
  const conversationId = (req.headers["x-conversation-id"] as string) || "unknown";

  if (!transcript) {
    res.status(400).json({ error: "Missing transcript" });
    return;
  }

  try {
    const summary = await summarizeConversation(transcript, language);
    await appendTurn(conversationId, { role: "tool", text: `[SUMMARY] ${summary}` });
    res.json({ summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "summary_failed" });
  }
});

export default router;
