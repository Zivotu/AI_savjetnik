import { Router, Request, Response, NextFunction } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const router = Router();
const DIR = path.resolve(
  process.cwd(),
  process.cwd().endsWith("backend") ? "articles" : "backend/articles"
);
const PASS = process.env.ADMIN_PASS as string;

function stripHtml(text: string) {
  return text.replace(/<[^>]*>/g, "");
}

interface Article {
  id: string;
  slug: string;
  title: { hr: string; en: string };
  content: { hr: string; en: string };
  excerpt: { hr: string; en: string };
  category: { hr: string; en: string };
  featured: boolean;
  thumbnail?: string;
  createdAt: string;
}

function buildArticle(id: string, body: any): Article {
  const content = {
    hr: body.contentHr ?? "",
    en: body.contentEn ?? "",
  };
  const excerpt = {
    hr: stripHtml(body.excerptHr ?? content.hr).slice(0, 120),
    en: stripHtml(body.excerptEn ?? content.en).slice(0, 120),
  };
  return {
    id,
    slug: body.slug ?? "",
    title: {
      hr: body.titleHr ?? "",
      en: body.titleEn ?? "",
    },
    content,
    excerpt,
    category: {
      hr: body.categoryHr ?? "",
      en: body.categoryEn ?? "",
    },
    featured: Boolean(body.featured),
    thumbnail: body.thumbnail ?? undefined,
    createdAt: body.createdAt ?? new Date().toISOString(),
  };
}

// list articles (public)
router.get("/", async (_req: Request, res: Response) => {
  try {
    const files = (await fs.readdir(DIR)).filter(f => f.endsWith(".json"));
    const data: Article[] = await Promise.all(
      files.map(async file =>
        JSON.parse(await fs.readFile(path.join(DIR, file), "utf8"))
      )
    );
    res.json(data);
  } catch (err) {
    console.error("Failed to list articles", err);
    return res.json([]);
  }
});

// get single article (public)
router.get("/:id", async (req: Request, res: Response) => {
  const p = path.join(DIR, `${req.params.id}.json`);
  try {
    const json = JSON.parse(await fs.readFile(p, "utf8"));
    res.json(json);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return res.sendStatus(404);
    console.error("Failed to read article", err);
    res.status(500).json({ error: "failed_to_read_article" });
  }
});

// auth middleware for mutating routes
router.use((req: Request, res: Response, next: NextFunction) => {
  if (req.headers["x-admin-pass"] !== PASS) return res.sendStatus(401);
  next();
});

// create article
router.post("/", async (req: Request, res: Response) => {
  try {
    const id = randomUUID();
    const article = buildArticle(id, req.body);
    await fs.mkdir(DIR, { recursive: true });
    await fs.writeFile(
      path.join(DIR, `${id}.json`),
      JSON.stringify(article, null, 2)
    );
    res.status(201).json(article);
  } catch (err) {
    console.error("Failed to create article", err);
    res.status(500).json({ error: "failed_to_create_article" });
  }
});

// update article
router.put("/:id", async (req: Request, res: Response) => {
  const p = path.join(DIR, `${req.params.id}.json`);
  try {
    const article = buildArticle(req.params.id, req.body);
    await fs.writeFile(p, JSON.stringify(article, null, 2));
    res.json(article);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT")
      return res.sendStatus(404);
    console.error("Failed to update article", err);
    res.status(500).json({ error: "failed_to_update_article" });
  }
});

// delete article
router.delete("/:id", async (req: Request, res: Response) => {
  const p = path.join(DIR, `${req.params.id}.json`);
  try {
    await fs.unlink(p);
    res.sendStatus(204);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT")
      return res.sendStatus(404);
    console.error("Failed to delete article", err);
    res.status(500).json({ error: "failed_to_delete_article" });
  }
});

export default router;
