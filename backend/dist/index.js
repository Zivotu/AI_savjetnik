"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const server_1 = __importDefault(require("./server"));
if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Missing OPENAI_API_KEY environment variable.');
    process.exit(1);
}
const PORT = Number(process.env.PORT) || 3000;
const server = http_1.default.createServer(server_1.default);
// Additional proxies are no longer required after migration to OpenAI
server.listen(PORT, () => {
    console.log(`✅ Backend listening on http://localhost:${PORT}`);
});
