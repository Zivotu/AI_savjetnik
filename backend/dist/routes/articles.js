"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const node_crypto_1 = require("node:crypto");
const router = (0, express_1.Router)();
const DIR = node_path_1.default.resolve(process.cwd(), process.cwd().endsWith("backend") ? "articles" : "backend/articles");
const PASS = process.env.ADMIN_PASS;
function stripHtml(text) {
    return text.replace(/<[^>]*>/g, "");
}
function buildArticle(id, body) {
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
router.get("/", async (_req, res) => {
    try {
        const files = (await promises_1.default.readdir(DIR)).filter(f => f.endsWith(".json"));
        const data = await Promise.all(files.map(async (file) => JSON.parse(await promises_1.default.readFile(node_path_1.default.join(DIR, file), "utf8"))));
        res.json(data);
    }
    catch (err) {
        console.error("Failed to list articles", err);
        res.status(500).json({ error: "failed_to_list_articles" });
    }
});
// get single article (public)
router.get("/:id", async (req, res) => {
    const p = node_path_1.default.join(DIR, `${req.params.id}.json`);
    try {
        const json = JSON.parse(await promises_1.default.readFile(p, "utf8"));
        res.json(json);
    }
    catch (err) {
        if (err.code === "ENOENT")
            return res.sendStatus(404);
        console.error("Failed to read article", err);
        res.status(500).json({ error: "failed_to_read_article" });
    }
});
// auth middleware for mutating routes
router.use((req, res, next) => {
    if (req.headers["x-admin-pass"] !== PASS)
        return res.sendStatus(401);
    next();
});
// create article
router.post("/", async (req, res) => {
    try {
        const id = (0, node_crypto_1.randomUUID)();
        const article = buildArticle(id, req.body);
        await promises_1.default.mkdir(DIR, { recursive: true });
        await promises_1.default.writeFile(node_path_1.default.join(DIR, `${id}.json`), JSON.stringify(article, null, 2));
        res.status(201).json(article);
    }
    catch (err) {
        console.error("Failed to create article", err);
        res.status(500).json({ error: "failed_to_create_article" });
    }
});
// update article
router.put("/:id", async (req, res) => {
    const p = node_path_1.default.join(DIR, `${req.params.id}.json`);
    try {
        const article = buildArticle(req.params.id, req.body);
        await promises_1.default.writeFile(p, JSON.stringify(article, null, 2));
        res.json(article);
    }
    catch (err) {
        if (err.code === "ENOENT")
            return res.sendStatus(404);
        console.error("Failed to update article", err);
        res.status(500).json({ error: "failed_to_update_article" });
    }
});
// delete article
router.delete("/:id", async (req, res) => {
    const p = node_path_1.default.join(DIR, `${req.params.id}.json`);
    try {
        await promises_1.default.unlink(p);
        res.sendStatus(204);
    }
    catch (err) {
        if (err.code === "ENOENT")
            return res.sendStatus(404);
        console.error("Failed to delete article", err);
        res.status(500).json({ error: "failed_to_delete_article" });
    }
});
exports.default = router;
