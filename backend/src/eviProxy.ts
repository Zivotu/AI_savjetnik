import { Server as HTTPServer, IncomingMessage } from 'http';
import { Socket } from 'net';
import { WebSocketServer, WebSocket, RawData } from 'ws';
import { HumeClient } from 'hume';

export function attachEviProxy(server: HTTPServer) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req: IncomingMessage, socket: Socket, head: Buffer) => {
    if (req.url !== '/api/evi') return;
    wss.handleUpgrade(req, socket, head, (client: WebSocket) => {
      (async () => {
        const hume = new HumeClient({
          apiKey: process.env.HUME_API_KEY ?? '',
          secretKey: process.env.HUME_SECRET_KEY ?? ''
        });
        const upstream = await hume.empathicVoice.chat.connect();

        client.on('message', (msg: RawData) => {
          const text = typeof msg === 'string' ? msg : msg.toString();
          upstream.sendUserInput(text);
        });

        upstream.on('message', (msg: any) => {
          try {
            const data = JSON.parse(msg.toString());
            if (data.audio_output?.data) {
              const buf = Buffer.from(data.audio_output.data, 'base64');
              if (client.readyState === WebSocket.OPEN) {
                client.send(buf);
              }
            }
          } catch {}
        });

        const closeBoth = () => {
          if (client.readyState === WebSocket.OPEN) client.close();
          upstream.close();
        };

        client.on('close', closeBoth);
        upstream.on('close', closeBoth);
      })().catch(() => {
        if (client.readyState === WebSocket.OPEN) client.close();
      });
    });
  });
}
