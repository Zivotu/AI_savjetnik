"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const openai_1 = __importDefault(require("openai"));
const router = (0, express_1.Router)();
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
router.post('/', async (req, res) => {
    const { text } = req.body;
    if (!text) {
        res.status(400).json({ success: false, error: { code: 'missing_text', message: 'Missing text' } });
        return;
    }
    try {
        const speech = await openai.audio.speech.create({
            model: process.env.OPENAI_TTS_MODEL,
            voice: 'alloy',
            input: text,
            format: 'wav',
        });
        const buf = Buffer.from(await speech.arrayBuffer());
        res.json({ success: true, error: null, data: { audio: buf.toString('base64') } });
    }
    catch (err) {
        res.status(500).json({ success: false, error: { code: 'tts_failed', message: err.message } });
    }
});
exports.default = router;
