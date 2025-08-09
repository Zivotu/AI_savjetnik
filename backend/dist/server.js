"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const agent_1 = __importDefault(require("./routes/agent"));
const tts_1 = __importDefault(require("./routes/tts"));
const transcripts_1 = __importDefault(require("./routes/transcripts"));
const solution_1 = __importDefault(require("./routes/solution"));
const articles_1 = __importDefault(require("./routes/articles"));
const question_1 = __importDefault(require("./routes/question"));
const realtime_1 = __importDefault(require("./routes/realtime"));
const summary_1 = __importDefault(require("./routes/summary"));
const sendEmail_1 = __importDefault(require("./routes/sendEmail"));
const app = (0, express_1.default)();
/* middlewares */
app.use((0, cors_1.default)());
app.use((0, express_rate_limit_1.default)({
    windowMs: 60000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
}));
app.use(express_1.default.json({ limit: "4mb" }));
app.use((req, _res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});
/* --- ZDRAVSTVENI CHECK --- */
app.get("/health", (_req, res) => {
    return res.json({ ok: true });
});
/* API rute */
app.use("/api/agent", agent_1.default);
app.use("/api/tts", tts_1.default);
app.use("/api/transcripts", transcripts_1.default);
app.use("/api/solution", solution_1.default);
app.use("/api/articles", articles_1.default);
app.use("/api/question", question_1.default);
app.use("/api/realtime", realtime_1.default);
app.use("/api/summary", summary_1.default);
app.use("/api/sendEmail", sendEmail_1.default);
/* --- SERVIRANJE FRONTENDA --- */
// 1) Putanja do /dist iz korijena projekta, koristeći __dirname iz backend/dist
const clientDistPath = path_1.default.resolve(__dirname, "../../dist");
// 2) Serviraj statičke fajlove
app.use(express_1.default.static(clientDistPath));
// 3) SPA fallback: sve što nije /api/* servira index.html
app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path_1.default.join(clientDistPath, "index.html"));
});
/* 404 + error handler */
app.use((_req, res) => res.status(404).json({ error: "not_found" }));
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
});
exports.default = app;
