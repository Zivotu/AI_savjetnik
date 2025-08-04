import { Router, Request, Response, NextFunction } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const router = Router();
const DIR = path.resolve(__dirname, "../../articles");
const PASS = process.env.ADMIN_PASS as string;

// auth middleware
router.use((req: Request, res: Response, next: NextFunction) => {
  if (req.headers["x-admin-pass"] !== PASS) return res.sendStatus(401);
  next();
});

interface Article {
  id: string;
  title: string;
  content: string;
}

// list articles
router.get("/", async (_req: Request, res: Response) => {
  const files = (await fs.readdir(DIR)).filter(f => f.endsWith(".json"));
  const data: Article[] = await Promise.all(
    files.map(async file => JSON.parse(await fs.readFile(path.join(DIR, file), "utf8")))
  );
  res.json(data);
});

// get single article
router.get("/:id", async (req: Request, res: Response) => {
  const p = path.join(DIR, `${req.params.id}.json`);
  try {
    const json = JSON.parse(await fs.readFile(p, "utf8"));
    res.json(json);
  } catch {
    res.sendStatus(404);
  }
});

// create article
router.post("/", async (req: Request, res: Response) => {
  const id = randomUUID();
  const article: Article = { id, title: req.body.title ?? "", content: req.body.content ?? "" };
  await fs.writeFile(path.join(DIR, `${id}.json`), JSON.stringify(article, null, 2));
  res.status(201).json(article);
});

// update article
router.put("/:id", async (req: Request, res: Response) => {
  const p = path.join(DIR, `${req.params.id}.json`);
  try {
    const article: Article = { id: req.params.id, title: req.body.title ?? "", content: req.body.content ?? "" };
    await fs.writeFile(p, JSON.stringify(article, null, 2));
    res.json(article);
  } catch {
    res.sendStatus(404);
  }
});

// delete article
router.delete("/:id", async (req: Request, res: Response) => {
  const p = path.join(DIR, `${req.params.id}.json`);
  try {
    await fs.unlink(p);
    res.sendStatus(204);
  } catch {
    res.sendStatus(404);
  }
});

export default router;
