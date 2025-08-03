import { Router, Request, Response } from "express";
import { getSolution } from "../utils/llm";
import { appendTurn } from "../utils/storage";

const router = Router();

/**
 * POST /api/solution
 * Body: { summary: string, language: "hr" | "en" }
 * Header "x-conversation-id" carries conversationId.
 */
router.post("/", async (req: Request, res: Response) => {
  const { summary, language } = req.body as {
    summary: string;
    language: "hr" | "en";
  };
  const conversationId =
    (req.headers["x-conversation-id"] as string) || "unknown";

  try {
    const { solutionText, cta } = await getSolution(summary, language);
    await appendTurn(conversationId, { role: "tool", solutionText, cta });
    res.json({ solutionText, cta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "solution_failed" });
  }
});

export default router;

