"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storage_1 = require("../utils/storage");
const llm_1 = require("../utils/llm");
const router = (0, express_1.Router)();
router.post("/", async (req, res) => {
    const { transcript, language } = req.body;
    const conversationId = req.headers["x-conversation-id"] || "unknown";
    if (!transcript) {
        res.status(400).json({ error: "Missing transcript" });
        return;
    }
    try {
        const summary = await (0, llm_1.summarizeConversation)(transcript, language);
        await (0, storage_1.appendTurn)(conversationId, { role: "tool", text: `[SUMMARY] ${summary}` });
        res.json({ summary });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "summary_failed" });
    }
});
exports.default = router;
