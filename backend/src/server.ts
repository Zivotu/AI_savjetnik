import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";

import sendEmailRouter from "./routes/sendEmail";
import agentRouter from "./routes/agent";
import ttsRouter from "./routes/tts";
import transcriptsRouter from "./routes/transcripts";
import solutionRouter from "./routes/solution";
import summaryRouter from "./routes/summary";
import articlesRouter from "./routes/articles";
import questionRouter from "./routes/question";

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

/* API rute */
app.use("/api/agent", agentRouter);
app.use("/api/tts", ttsRouter);
app.use("/api/transcripts", transcriptsRouter);
app.use("/api/solution", solutionRouter);
app.use("/api/elevenlabs/summary", summaryRouter);
app.use("/api/elevenlabs/sendEmail", sendEmailRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/question", questionRouter);

/* --- POČETAK SERVIRANJA FRONTENDA --- */

// 1) Nađi dist iz korijena projekta
const clientDistPath = path.resolve(__dirname, "..", "..", "dist");

// 2) Servaj statiku iz /home/conexa/neurobiz.me/dist
app.use(express.static(clientDistPath));

// 3) Sve nerelane GET zahtjeve (koji ne počinju s /api/) vraćaju index.html
app.get(/^(?!\/api\/).*/, (_req: Request, res: Response) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

/* --- KRAJ SERVIRANJA FRONTENDA --- */

/* 404 + error handler */
app.use((_req: Request, res: Response) => res.status(404).json({ error: "not_found" }));
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "internal_error" });
});

export default app;
