import { Router } from "express";
import crypto from "node:crypto";
import storage, { Turn } from "../utils/storage";

const router = Router();

router.post("/", async (req, res) => {
  const {
    conversationId = crypto.randomUUID(),
    role,
    text,
    phase,
    mode,
    language,
  } = req.body;

  const turn: Turn & { mode?: string } = { role, text, t: Date.now(), phase };

  await storage.appendTurn(conversationId, turn);

  await storage.updateConversation(conversationId, { phase, mode, language });

  res.status(200).json({ conversationId });
});

export default router;
