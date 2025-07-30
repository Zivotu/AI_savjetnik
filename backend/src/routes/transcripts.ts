import { Router } from "express";
import fs from "node:fs/promises";
import path from "node:path";

const router = Router();
const DIR = path.resolve(__dirname, "../../transcripts");
const PASS = process.env.ADMIN_PASS;

router.use((req, res, next) => {
  if (req.headers["x-admin-pass"] !== PASS) return res.sendStatus(401);
  next();
});

// GET /api/transcripts  → list
router.get("/", async (_req, res) => {
  const files = await fs.readdir(DIR);
  const data = await Promise.all(
    files.map(async f => {
      const json = JSON.parse(await fs.readFile(path.join(DIR, f), "utf8"));
      return {
        id: json.id,
        created: json.created ?? "",
        finished: json.finishedAt ?? null,
        turns: json.turns.length,
        hasContact: !!json.turns.find((t:any)=>t.text?.startsWith("CONTACT::"))
      };
    })
  );
  res.json(data);
});

// GET /api/transcripts/:id  → full JSON
router.get("/:id", async (req, res) => {
  const p = path.join(DIR, `${req.params.id}.json`);
  try {
    const json = JSON.parse(await fs.readFile(p, "utf8"));
    res.json(json);
  } catch {
    res.sendStatus(404);
  }
});

// DELETE /api/transcripts/:id
router.delete("/:id", async (req, res) => {
  const p = path.join(DIR, `${req.params.id}.json`);
  try {
    await fs.unlink(p);
    res.sendStatus(204);
  } catch {
    res.sendStatus(404);
  }
});

export default router;
