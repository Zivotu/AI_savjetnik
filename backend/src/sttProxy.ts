import { Server as HTTPServer, IncomingMessage } from 'http';
import { Socket } from 'net';
import { WebSocketServer, WebSocket, RawData } from 'ws';

export function attachSttProxy(server: HTTPServer) {
  const isDisabled = process.env.DISABLE_STT === '1';
  if (isDisabled) {
    server.on('upgrade', (req: IncomingMessage, socket: Socket) => {
      if (req.url === '/api/stt') {
        socket.write(
          'HTTP/1.1 501 Not Implemented\r\n' +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify({ error: 'STT disabled (DISABLE_STT=1)' })
        );
        socket.destroy();
      }
    });
    console.log('🔇  STT proxy disabled via DISABLE_STT=1');
    return;
  }

  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req: IncomingMessage, socket: Socket, head: Buffer) => {
    if (req.url !== '/api/stt') return;
    wss.handleUpgrade(req, socket, head, (client: WebSocket) => {
      const provider = process.env.STT_PROVIDER ?? 'elevenlabs';

      const upstream =
        provider === 'elevenlabs'
          ? new WebSocket('wss://api.elevenlabs.io/v1/speech-to-text/ws', undefined, {
              headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '' },
            })
          : new WebSocket('wss://api.hume.ai/v0/stream/models/speech-to-text', [], {
              headers: {
                'X-Hume-Api-Key': process.env.HUME_API_KEY ?? '',
                'X-Hume-Api-Secret': process.env.HUME_SECRET_KEY ?? '',
              },
            });

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
