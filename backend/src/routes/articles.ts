import { Router, Request, Response, NextFunction } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "crypto";

const router = Router();
const FILE = path.resolve(__dirname, "../../articles.json");
const PASS = process.env.ADMIN_PASS as string;

/* auth - middleware */
router.use((req: Request, res: Response, next: NextFunction) => {
  if (req.headers["x-admin-pass"] !== PASS) return res.sendStatus(401);
  next();
});

/* helpers */
type Article = {
  id: string;
  title: string;
  content: string;
};

async function readArticles(): Promise<Article[]> {
  try {
    const data = await fs.readFile(FILE, "utf8");
    return JSON.parse(data);
  } catch (err: any) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

async function writeArticles(articles: Article[]): Promise<void> {
  await fs.writeFile(FILE, JSON.stringify(articles, null, 2));
}

/** GET /api/articles – list */
router.get("/", async (_req: Request, res: Response) => {
  const articles = await readArticles();
  res.json(articles);
});

/** GET /api/articles/:id */
router.get("/:id", async (req: Request, res: Response) => {
  const articles = await readArticles();
  const article = articles.find(a => a.id === req.params.id);
  if (!article) return res.sendStatus(404);
  res.json(article);
});

/** POST /api/articles */
router.post("/", async (req: Request, res: Response) => {
  const { title, content } = req.body as Partial<Article>;
  if (!title || !content) return res.status(400).json({ error: "missing_fields" });
  const articles = await readArticles();
  const article: Article = { id: randomUUID(), title, content };
  articles.push(article);
  await writeArticles(articles);
  res.status(201).json(article);
});

/** PUT /api/articles/:id */
router.put("/:id", async (req: Request, res: Response) => {
  const { title, content } = req.body as Partial<Article>;
  const articles = await readArticles();
  const idx = articles.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.sendStatus(404);
  articles[idx] = {
    ...articles[idx],
    title: title ?? articles[idx].title,
    content: content ?? articles[idx].content
  };
  await writeArticles(articles);
  res.json(articles[idx]);
});

/** DELETE /api/articles/:id */
router.delete("/:id", async (req: Request, res: Response) => {
  const articles = await readArticles();
  const idx = articles.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.sendStatus(404);
  articles.splice(idx, 1);
  await writeArticles(articles);
  res.sendStatus(204);
});

export default router;

