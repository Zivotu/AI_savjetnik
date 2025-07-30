"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storage_1 = require("../utils/storage");
const router = (0, express_1.Router)();
/**
 * Proxy to ElevenLabs Conversation text endpoint.
 */
router.post('/', async (req, res) => {
    const { conversationId, text } = req.body;
    if (!conversationId || !text) {
        res.status(400).json({ error: 'Missing conversationId or text' });
        return;
    }
    try {
        const apiRes = await fetch('https://api.elevenlabs.io/v1/conversation', {
            method: 'POST',
            headers: {
                'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversation_id: conversationId,
                text,
                model_id: 'eleven_multilingual_v2',
            }),
        });
        if (!apiRes.ok) {
            const data = await apiRes.json().catch(() => ({}));
            res.status(apiRes.status).json({ error: data.error || data.message });
            return;
        }
        const data = (await apiRes.json());
        const reply = data.reply;
        await (0, storage_1.appendTurn)(conversationId, {
            role: 'assistant',
            text: reply,
            mode: 'chat',
        });
        res.json({ reply });
    }
    catch (err) {
        res.status(500).json({ error: 'Chat request failed' });
    }
});
exports.default = router;
