"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachEviProxy = attachEviProxy;
const ws_1 = require("ws");
function attachEviProxy(server) {
    const wss = new ws_1.WebSocketServer({ noServer: true });
    server.on('upgrade', (req, socket, head) => {
        if (req.url !== '/api/evi')
            return;
        wss.handleUpgrade(req, socket, head, (client) => {
            const upstream = new ws_1.WebSocket('wss://api.hume.ai/v0/stream/models/empathic-voice/chat', [], {
                headers: {
                    'X-Hume-Api-Key': process.env.HUME_API_KEY ?? '',
                    'X-Hume-Api-Secret': process.env.HUME_SECRET_KEY ?? ''
                }
            });
            // Kada se upstream veza otvori, slušaj poruke od korisnika i šalji ih Hume servisu
            upstream.on('open', () => {
                client.on('message', (msg) => {
                    const text = typeof msg === 'string' ? msg : msg.toString();
                    upstream.send(JSON.stringify({ user_input: text }));
                });
            });
            // Kada Hume vrati odgovor (s audio_output), proslijedi ga klijentu
            upstream.on('message', (msg) => {
                try {
                    const data = JSON.parse(msg.toString());
                    const base64Audio = data?.audio_output?.data;
                    if (base64Audio && client.readyState === ws_1.WebSocket.OPEN) {
                        const buffer = Buffer.from(base64Audio, 'base64');
                        client.send(buffer);
                    }
                }
                catch (err) {
                    console.error('Greška u parsiranju poruke iz Hume:', err);
                }
            });
            // Ako bilo koja veza pukne, zatvori obje
            const closeBoth = () => {
                if (client.readyState === ws_1.WebSocket.OPEN)
                    client.close();
                if (upstream.readyState === ws_1.WebSocket.OPEN)
                    upstream.close();
            };
            client.on('close', closeBoth);
            client.on('error', closeBoth);
            upstream.on('close', closeBoth);
            upstream.on('error', closeBoth);
        });
    });
}
