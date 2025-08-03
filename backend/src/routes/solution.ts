import { Router, Request, Response } from "express";
import { appendTurn } from "../utils/storage";
import { getSolution } from "../utils/llm";

const router = Router();

/**
 * POST /api/solution
 * Body: { summary, language }
 */
router.post("/", async (req: Request, res: Response) => {
  const { summary, language } = req.body as {
    summary: string;
    language: "hr" | "en";
  };
  const conversationId =
    (req.headers["x-conversation-id"] as string) || "unknown";

  if (!summary) {
    res.status(400).json({ error: "Missing summary" });
    return;
  }

  try {
    const { solutionText, cta } = await getSolution(summary, language);
    await appendTurn(conversationId, {
      role: "tool",
      text: `[SOLUTION] ${solutionText} ${cta}`,
    });
    res.json({ solutionText, cta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "solution_failed" });
  }
});

export default router;
