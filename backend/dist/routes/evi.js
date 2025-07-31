"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    const { text, audioBase64 } = req.body;
    if (!text && !audioBase64) {
        res.status(400).json({ error: 'Missing text or audioBase64' });
        return;
    }
    const { HumeClient } = require('hume');
    const client = new HumeClient({
        apiKey: process.env.HUME_API_KEY ?? '',
        secretKey: process.env.HUME_SECRET_KEY ?? ''
    });
    try {
        const socket = await client.empathicVoice.chat.connect();
        res.setHeader('Content-Type', 'audio/wav');
        socket.on('message', (msg) => {
            try {
                const data = JSON.parse(msg.toString());
                if (data.audio_output?.data) {
                    const buf = Buffer.from(data.audio_output.data, 'base64');
                    res.write(buf);
                }
            }
            catch { }
        });
        socket.on('close', () => {
            res.end();
        });
        if (text) {
            socket.sendUserInput(text);
        }
        else if (audioBase64) {
            socket.sendAudioInput({ data: audioBase64 });
        }
    }
    catch (err) {
        res.status(500).json({ error: 'EVI request failed' });
    }
});
exports.default = router;
