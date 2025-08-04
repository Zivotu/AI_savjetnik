"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const router = (0, express_1.Router)();
const DIR = node_path_1.default.resolve(__dirname, "../../uploads");
// ensure directory exists
promises_1.default.mkdir(DIR, { recursive: true }).catch(() => { });
router.post("/", async (req, res) => {
    const ct = req.headers["content-type"];
    if (!ct || !ct.startsWith("multipart/form-data")) {
        return res.status(400).json({ error: "invalid_content_type" });
    }
    const boundary = ct.split("boundary=")[1];
    if (!boundary)
        return res.status(400).json({ error: "no_boundary" });
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", async () => {
        try {
            const buffer = Buffer.concat(chunks);
            const boundaryBuf = Buffer.from(`--${boundary}`);
            const start = buffer.indexOf(boundaryBuf) + boundaryBuf.length + 2; // skip boundary + CRLF
            const headerEnd = buffer.indexOf(Buffer.from("\r\n\r\n"), start);
            const header = buffer.toString("utf8", start, headerEnd);
            const filenameMatch = /filename="([^"]+)"/i.exec(header);
            const ext = filenameMatch ? node_path_1.default.extname(filenameMatch[1]) : ".png";
            const fileStart = headerEnd + 4; // skip CRLFCRLF
            const fileEnd = buffer.indexOf(boundaryBuf, fileStart) - 2; // remove trailing CRLF
            const fileBuffer = buffer.slice(fileStart, fileEnd);
            const filename = `${Date.now()}${ext}`;
            await promises_1.default.writeFile(node_path_1.default.join(DIR, filename), fileBuffer);
            res.json({ url: `/uploads/${filename}` });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "upload_failed" });
        }
    });
});
exports.default = router;
