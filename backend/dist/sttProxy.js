"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachSttProxy = attachSttProxy;
const ws_1 = require("ws");
function attachSttProxy(server) {
    const isDisabled = process.env.DISABLE_STT === '1';
    if (isDisabled) {
        server.on('upgrade', (req, socket) => {
            if (req.url === '/api/stt') {
                socket.write('HTTP/1.1 501 Not Implemented\r\n' +
                    'Content-Type: application/json\r\n\r\n' +
                    JSON.stringify({ error: 'STT disabled (DISABLE_STT=1)' }));
                socket.destroy();
            }
        });
        console.log('🔇  STT proxy disabled via DISABLE_STT=1');
        return;
    }
    const wss = new ws_1.WebSocketServer({ noServer: true });
    server.on('upgrade', (req, socket, head) => {
        if (req.url !== '/api/stt')
            return;
        wss.handleUpgrade(req, socket, head, (client) => {
            const provider = process.env.STT_PROVIDER ?? 'elevenlabs';
            const upstream = provider === 'elevenlabs'
                ? new ws_1.WebSocket('wss://api.elevenlabs.io/v1/speech-to-text/ws', undefined, {
                    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '' },
                })
                : new ws_1.WebSocket('wss://api.hume.ai/v0/stream/models/speech-to-text', [], {
                    headers: {
                        'X-Hume-Api-Key': process.env.HUME_API_KEY ?? '',
                        'X-Hume-Api-Secret': process.env.HUME_SECRET_KEY ?? '',
                    },
                });
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
