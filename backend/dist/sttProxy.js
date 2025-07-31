"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachSttProxy = attachSttProxy;
const ws_1 = require("ws");
function attachSttProxy(server) {
    const wss = new ws_1.WebSocketServer({ noServer: true });
    server.on('upgrade', (req, socket, head) => {
        if (req.url !== '/api/stt')
            return;
        wss.handleUpgrade(req, socket, head, (client) => {
            const upstream = new ws_1.WebSocket('wss://api.elevenlabs.io/v1/speech-to-text/ws', undefined, { headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '' } });
            client.on('message', (msg) => {
                if (upstream.readyState === ws_1.WebSocket.OPEN) {
                    upstream.send(msg);
                }
            });
            upstream.on('message', (msg) => {
                if (client.readyState === ws_1.WebSocket.OPEN) {
                    client.send(msg);
                }
            });
            const closeBoth = () => {
                if (client.readyState === ws_1.WebSocket.OPEN)
                    client.close();
                if (upstream.readyState === ws_1.WebSocket.OPEN)
                    upstream.close();
            };
            client.on('close', closeBoth);
            upstream.on('close', closeBoth);
        });
    });
}
