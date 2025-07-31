"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachEviProxy = attachEviProxy;
const ws_1 = require("ws");
const hume_1 = require("hume");
function attachEviProxy(server) {
    const wss = new ws_1.WebSocketServer({ noServer: true });
    server.on('upgrade', (req, socket, head) => {
        if (req.url !== '/api/evi')
            return;
        wss.handleUpgrade(req, socket, head, (client) => {
            (async () => {
                const hume = new hume_1.HumeClient({
                    apiKey: process.env.HUME_API_KEY ?? '',
                    secretKey: process.env.HUME_SECRET_KEY ?? ''
                });
                const upstream = await hume.empathicVoice.chat.connect();
                client.on('message', (msg) => {
                    const text = typeof msg === 'string' ? msg : msg.toString();
                    upstream.sendUserInput(text);
                });
                upstream.on('message', (msg) => {
                    try {
                        const data = JSON.parse(msg.toString());
                        if (data.audio_output?.data) {
                            const buf = Buffer.from(data.audio_output.data, 'base64');
                            if (client.readyState === ws_1.WebSocket.OPEN) {
                                client.send(buf);
                            }
                        }
                    }
                    catch { }
                });
                const closeBoth = () => {
                    if (client.readyState === ws_1.WebSocket.OPEN)
                        client.close();
                    upstream.close();
                };
                client.on('close', closeBoth);
                upstream.on('close', closeBoth);
            })().catch(() => {
                if (client.readyState === ws_1.WebSocket.OPEN)
                    client.close();
            });
        });
    });
}
