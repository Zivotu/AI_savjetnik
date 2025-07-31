import { Server as HTTPServer, IncomingMessage } from 'http';
import { Socket } from 'net';
import { WebSocketServer, WebSocket, RawData } from 'ws';

export function attachSttProxy(server: HTTPServer) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req: IncomingMessage, socket: Socket, head: Buffer) => {
    if (req.url !== '/api/stt') return;
    wss.handleUpgrade(req, socket, head, (client: WebSocket) => {
      const upstream = new WebSocket('wss://api.elevenlabs.io/v1/speech-to-text/ws', [
        'xi-api-key',
        process.env.ELEVENLABS_API_KEY || ''
      ]);

      client.on('message', (msg: RawData) => {
        if (upstream.readyState === WebSocket.OPEN) {
          upstream.send(msg);
        }
      });

      upstream.on('message', (msg: RawData) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(msg);
        }
      });

      const closeBoth = () => {
        if (client.readyState === WebSocket.OPEN) client.close();
        if (upstream.readyState === WebSocket.OPEN) upstream.close();
      };

      client.on('close', closeBoth);
      upstream.on('close', closeBoth);
    });
  });
}
