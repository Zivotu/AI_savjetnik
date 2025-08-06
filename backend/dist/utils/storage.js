"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIR = void 0;
exports.ensureDir = ensureDir;
exports.writeAtomic = writeAtomic;
exports.appendTurn = appendTurn;
exports.updateConversation = updateConversation;
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
exports.DIR = node_path_1.default.resolve(__dirname, '../../transcripts');
async function ensureDir() {
    await promises_1.default.mkdir(exports.DIR, { recursive: true, mode: 0o775 });
}
const filePath = (id) => node_path_1.default.join(exports.DIR, `${id}.json`);
async function readConversation(id) {
    await ensureDir();
    try {
        return JSON.parse(await promises_1.default.readFile(filePath(id), 'utf8'));
    }
    catch {
        return { id, created: new Date().toISOString(), turns: [] };
    }
}
async function writeAtomic(p, data) {
    await promises_1.default.writeFile(p, data, "utf8"); // simple, safe on Windows
}
async function appendTurn(id, turn) {
    const convo = await readConversation(id);
    convo.turns.push({ ...turn, ts: new Date().toISOString() });
    await writeAtomic(filePath(id), JSON.stringify(convo, null, 2));
}
async function updateConversation(id, patch) {
    const convo = await readConversation(id);
    Object.assign(convo, patch);
    await writeAtomic(filePath(id), JSON.stringify(convo, null, 2));
}
