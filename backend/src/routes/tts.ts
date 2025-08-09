import { Router, Request, Response } from "express";
import OpenAI from "openai";

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

router.post("/", async (req: Request, res: Response) => {
  const { text } = req.body as { text?: string };
  if (!text) {
    res
      .status(400)
      .json({ success: false, error: { code: "missing_text", message: "Missing text" } });
    return;
  }

  try {
    const speech = await openai.audio.speech.create({
      model: process.env.OPENAI_TTS_MODEL || "tts-1", // npr. "tts-1" ili "tts-1-hd"
      voice: "alloy",
      input: text,
      response_format: "wav"
    });

    const buf = Buffer.from(await speech.arrayBuffer());
    res.json({ success: true, error: null, data: { audio: buf.toString("base64") } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ success: false, error: { code: "tts_failed", message } });
  }
});

export default router;
