"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const node_path_1 = __importDefault(require("node:path"));
const sendEmail_1 = __importDefault(require("./routes/sendEmail"));
const agent_1 = __importDefault(require("./routes/agent"));
const tts_1 = __importDefault(require("./routes/tts"));
const transcripts_1 = __importDefault(require("./routes/transcripts"));
const solution_1 = __importDefault(require("./routes/solution"));
const summary_1 = __importDefault(require("./routes/summary"));
const uploads_1 = __importDefault(require("./routes/uploads"));
const app = (0, express_1.default)();
/* middlewares */
app.use((0, cors_1.default)());
app.use((0, express_rate_limit_1.default)({
    windowMs: 60000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false
}));
app.use(express_1.default.json({ limit: "4mb" }));
app.use("/uploads", express_1.default.static(node_path_1.default.resolve(__dirname, "../uploads")));
app.use((req, _res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});
/* routes */
app.use("/api/agent", agent_1.default);
app.use("/api/tts", tts_1.default);
app.use("/api/transcripts", transcripts_1.default);
app.use("/api/solution", solution_1.default);
app.use("/api/summary", summary_1.default);
app.use("/api/sendEmail", sendEmail_1.default);
app.use("/api/uploads", uploads_1.default);
/* 404 + error */
app.use((_req, res) => res.status(404).json({ error: "not_found" }));
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
});
exports.default = app;
