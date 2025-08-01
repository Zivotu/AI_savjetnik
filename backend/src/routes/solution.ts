import { Router, Request, Response } from "express";
import { getSolution } from "../utils/llm";
import { appendTurn } from "../utils/storage";

const router = Router();

/**
 * ElevenLabs server-tool webhook.
 * Body: { summary: string, language: "hr" | "en" }
 * Header "x-conversation-id" carries conversationId.
 */
router.post("/", async (req: Request, res: Response) => {
  const { summary, language } = req.body as { summary: string; language: "hr" | "en" };
  const conversationId = (req.headers["x-conversation-id"] as string) || "unknown";

  try {
    // getSolution vraća { solutionText: string; cta: string }
    const { solutionText, cta } = await getSolution(summary, language);

    // spremi glavni tekst rješenja
    await appendTurn(conversationId, {
      role: "tool",
      text: solutionText
    });

    // spremi CTA kao zaseban turn (ili ih kombinirajte ako više voliš jedno polje)
    await appendTurn(conversationId, {
      role: "tool",
      text: cta
    });

    // vrati objekt natrag klijentu
    res.json({ solutionText, cta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "solution_failed" });
  }
});

export default router;
