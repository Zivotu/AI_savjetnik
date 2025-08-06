"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const storage_1 = require("../utils/storage");
const router = (0, express_1.Router)();
const PASS = process.env.ADMIN_PASS;
/* auth - middleware */
router.use((req, res, next) => {
    if (req.headers["x-admin-pass"] !== PASS)
        return res.sendStatus(401);
    next();
});
/** GET /api/transcripts – list */
router.get("/", async (_req, res) => {
    await (0, storage_1.ensureDir)();
    const files = (await promises_1.default.readdir(storage_1.DIR)).filter(f => f.endsWith(".json"));
    const data = await Promise.all(files.map(async (file) => {
        const json = JSON.parse(await promises_1.default.readFile(node_path_1.default.join(storage_1.DIR, file), "utf8"));
        return {
            id: json.id,
            created: json.created ?? "",
            finished: json.finishedAt ?? null,
            turns: json.turns.length,
            hasContact: json.turns.some(t => t.text?.startsWith("CONTACT::"))
        };
    }));
    res.json(data);
});
/** GET /api/transcripts/:id – full JSON */
router.get("/:id", async (req, res) => {
    await (0, storage_1.ensureDir)();
    const p = node_path_1.default.join(storage_1.DIR, `${req.params.id}.json`);
    try {
        const json = JSON.parse(await promises_1.default.readFile(p, "utf8"));
        res.json(json);
    }
    catch {
        res.sendStatus(404);
    }
});
/** DELETE /api/transcripts/:id */
router.delete("/:id", async (req, res) => {
    await (0, storage_1.ensureDir)();
    const p = node_path_1.default.join(storage_1.DIR, `${req.params.id}.json`);
    try {
        await promises_1.default.unlink(p);
        res.sendStatus(204);
    }
    catch {
        res.sendStatus(404);
    }
});
exports.default = router;
