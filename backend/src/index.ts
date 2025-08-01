import http from 'http';
import app from './server';
import { attachSttProxy } from './sttProxy';
import { attachEviProxy } from './eviProxy';

if (!process.env.OPENAI_API_KEY || !process.env.ELEVENLABS_API_KEY) {
  console.error(
    '❌ Missing OPENAI_API_KEY or ELEVENLABS_API_KEY environment variables.'
  );
  process.exit(1);
}

if (!process.env.HUME_API_KEY) {
  console.error('❌ Missing HUME_API_KEY environment variable.');
  process.exit(1);
}

const PORT = Number(process.env.PORT) || 3000;
const server = http.createServer(app);

// Attach Hume STT proxy
attachSttProxy(server);

// Attach EVI proxy
attachEviProxy(server);

server.listen(PORT, () => {
  console.log(`✅ Backend listening on http://localhost:${PORT}`);
});
