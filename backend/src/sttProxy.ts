import { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

export function attachSttProxy(server: HTTPServer) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    if (req.url !== '/api/stt') return;
    wss.handleUpgrade(req, socket, head, client => {
      const upstream = new WebSocket('wss://api.elevenlabs.io/v1/speech-to-text/ws', [
        'xi-api-key',
        process.env.ELEVENLABS_API_KEY || ''
      ]);

      client.on('message', msg => {
        if (upstream.readyState === WebSocket.OPEN) {
          upstream.send(msg);
        }
      });

      upstream.on('message', msg => {
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
