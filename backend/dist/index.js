"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const server_1 = __importDefault(require("./server"));
const sttProxy_1 = require("./sttProxy");
const server = http_1.default.createServer(server_1.default);
(0, sttProxy_1.attachSttProxy)(server);
server.listen(3000, () => {
    console.log('✅ Backend listening on http://localhost:3000');
});
