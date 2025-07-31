"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const agent_1 = __importDefault(require("./routes/agent"));
// Import the ElevenLabs TTS proxy router
const tts_1 = __importDefault(require("./routes/tts"));
const evi_1 = __importDefault(require("./routes/evi"));
const chat_1 = __importDefault(require("./routes/chat"));
const transcripts_1 = __importDefault(require("./routes/transcripts"));
const solution_1 = __importDefault(require("./routes/solution"));
const summary_1 = __importDefault(require("./routes/summary"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Logging middleware for debugging purposes
app.use((req, _res, next) => {
    console.log(req.method, req.originalUrl, req.body);
    next();
});
app.use('/api/agent', agent_1.default);
// Mount the TTS proxy under /api/tts
app.use('/api/tts', tts_1.default);
app.use('/api/evi', evi_1.default);
app.use('/api/chat', chat_1.default);
app.use('/api/transcripts', transcripts_1.default);
app.use('/api/solution', solution_1.default);
app.use('/api/summary', summary_1.default);
exports.default = app;
