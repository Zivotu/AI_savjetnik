import { Server as HTTPServer, IncomingMessage } from 'http';
import { Socket } from 'net';
import { WebSocketServer, WebSocket, RawData } from 'ws';

type ClientSocket = WebSocket;

export function attachEviProxy(server: HTTPServer) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req: IncomingMessage, socket: Socket, head: Buffer) => {
    if (req.url !== '/api/evi') return;

    wss.handleUpgrade(req, socket, head, (client: ClientSocket) => {
      const upstream = new WebSocket('wss://api.hume.ai/v0/stream/models/empathic-voice/chat', [], {
        headers: {
          'X-Hume-Api-Key': process.env.HUME_API_KEY ?? '',
          'X-Hume-Api-Secret': process.env.HUME_SECRET_KEY ?? ''
        }
      });

      // Kada se upstream veza otvori, slušaj poruke od korisnika i šalji ih Hume servisu
      upstream.on('open', () => {
        client.on('message', (msg: RawData) => {
          const text = typeof msg === 'string' ? msg : msg.toString();
          upstream.send(JSON.stringify({ user_input: text }));
        });
      });

      // Kada Hume vrati odgovor (s audio_output), proslijedi ga klijentu
      upstream.on('message', (msg: RawData) => {
        try {
          const data = JSON.parse(msg.toString());
          const base64Audio = data?.audio_output?.data;
          if (base64Audio && client.readyState === WebSocket.OPEN) {
            const buffer = Buffer.from(base64Audio, 'base64');
            client.send(buffer);
          }
        } catch (err) {
          console.error('Greška u parsiranju poruke iz Hume:', err);
        }
      });

      // Ako bilo koja veza pukne, zatvori obje
      const closeBoth = () => {
        if (client.readyState === WebSocket.OPEN) client.close();
        if (upstream.readyState === WebSocket.OPEN) upstream.close();
      };

      client.on('close', closeBoth);
      client.on('error', closeBoth);
      upstream.on('close', closeBoth);
      upstream.on('error', closeBoth);
    });
  });
}
