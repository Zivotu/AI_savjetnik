"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storage_1 = require("../utils/storage");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    console.log('POST /agent', req.body);
    const { conversationId, role, text, phase, mode } = req.body;
    if (!conversationId || !role || !text) {
        res
            .status(400)
            .json({ error: 'Missing conversationId, role, or text' });
        return;
    }
    try {
        await (0, storage_1.appendTurn)(conversationId, { role, text, phase, mode });
        if (phase === 'ended') {
            await (0, storage_1.updateConversation)(conversationId, {
                finished: true,
                finishedAt: new Date().toISOString(),
            });
        }
        res.status(200).json({ ok: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Failed to update conversation',
            message: err instanceof Error ? err.message : String(err),
        });
    }
});
exports.default = router;
