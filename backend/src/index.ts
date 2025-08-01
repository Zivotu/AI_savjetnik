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

const server = http.createServer(app);
attachSttProxy(server);
attachEviProxy(server);

server.listen(3000, () => {
  console.log('✅ Backend listening on http://localhost:3000');
});
