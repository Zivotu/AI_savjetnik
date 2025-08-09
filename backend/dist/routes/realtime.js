"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const openai_1 = __importDefault(require("openai"));
const router = (0, express_1.Router)();
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
router.post("/session", async (_req, res) => {
    try {
        const session = await openai.realtime.sessions.create({
            model: process.env.OPENAI_REALTIME_MODEL,
            voice: "alloy",
            modalities: ["audio", "text"],
            instructions: "AI Savjetnik - hrvatski default, engleski fallback.",
        });
        res.json({ success: true, error: null, data: session });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: { code: "realtime_session_failed", message: err.message },
        });
    }
});
exports.default = router;
