import { Router, Request, Response } from "express";
import OpenAI from "openai";

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

router.post("/session", async (_req: Request, res: Response) => {
  try {
    const session = await openai.realtime.sessions.create({
      model: process.env.OPENAI_REALTIME_MODEL!,
      voice: "alloy",
      modalities: ["audio", "text"],
      instructions: "AI Savjetnik - hrvatski default, engleski fallback.",
    });
    res.json({ success: true, error: null, data: session });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: "realtime_session_failed", message: (err as Error).message },
    });
  }
});

export default router;
