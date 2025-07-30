"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const llm_1 = require("../utils/llm");
const storage_1 = require("../utils/storage");
const router = (0, express_1.Router)();
/**
 * ElevenLabs server-tool webhook.
 * Body: { summary: string, language: "hr" | "en" }
 * Header "x-conversation-id" carries conversationId.
 */
router.post("/", async (req, res) => {
    const { summary, language } = req.body;
    const conversationId = req.headers["x-conversation-id"] || "unknown";
    try {
        const solution = await (0, llm_1.getSolution)(summary, language);
        await (0, storage_1.appendTurn)(conversationId, { role: "tool", ...solution });
        res.json(solution);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "solution_failed" });
    }
});
exports.default = router;
