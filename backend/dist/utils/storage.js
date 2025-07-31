"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendTurn = appendTurn;
exports.updateConversation = updateConversation;
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const DIR = node_path_1.default.resolve(__dirname, '../../transcripts');
async function readConversation(id) {
    const file = node_path_1.default.join(DIR, `${id}.json`);
    try {
        const data = await promises_1.default.readFile(file, 'utf8');
        return JSON.parse(data);
    }
    catch {
        return { id, created: new Date().toISOString(), turns: [] };
    }
}
async function writeConversation(id, convo) {
    await promises_1.default.mkdir(DIR, { recursive: true });
    const file = node_path_1.default.join(DIR, `${id}.json`);
    await promises_1.default.writeFile(file, JSON.stringify(convo, null, 2), 'utf8');
}
async function appendTurn(id, turn) {
    const convo = await readConversation(id);
    if (!Array.isArray(convo.turns)) {
        convo.turns = [];
    }
    turn.t = Date.now();
    convo.turns.push(turn);
    await writeConversation(id, convo);
}
async function updateConversation(id, patch) {
    const convo = await readConversation(id);
    Object.assign(convo, patch);
    await writeConversation(id, convo);
}
