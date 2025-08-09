import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";

import agentRouter from "./routes/agent";
import ttsRouter from "./routes/tts";
import transcriptsRouter from "./routes/transcripts";
import solutionRouter from "./routes/solution";
import articlesRouter from "./routes/articles";
import questionRouter from "./routes/question";
import realtimeRouter from "./routes/realtime";
import summaryRouter from "./routes/summary";
import sendEmailRouter from "./routes/sendEmail";

const app = express();

/* middlewares */
app.use(cors());
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
  })
);
app.use(express.json({ limit: "4mb" }));
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

/* --- ZDRAVSTVENI CHECK --- */
app.get("/health", (_req: Request, res: Response) => {
  return res.json({ ok: true });
});

/* API rute */
app.use("/api/agent", agentRouter);
app.use("/api/tts", ttsRouter);
app.use("/api/transcripts", transcriptsRouter);
app.use("/api/solution", solutionRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/question", questionRouter);
app.use("/api/realtime", realtimeRouter);
app.use("/api/summary", summaryRouter);
app.use("/api/sendEmail", sendEmailRouter);

/* --- SERVIRANJE FRONTENDA --- */
// 1) Putanja do /dist iz korijena projekta, koristeći __dirname iz backend/dist
const clientDistPath = path.resolve(__dirname, "../../dist");

// 2) Serviraj statičke fajlove
app.use(express.static(clientDistPath));

// 3) SPA fallback: sve što nije /api/* servira index.html
app.get(/^(?!\/api\/).*/, (_req: Request, res: Response) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

/* 404 + error handler */
app.use((_req: Request, res: Response) =>
  res.status(404).json({ error: "not_found" })
);
app.use(
  (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
);

export default app;
