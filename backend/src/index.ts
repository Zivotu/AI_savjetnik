import 'dotenv/config';
import http from 'http';
import app from './server';

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Missing OPENAI_API_KEY environment variable.');
  process.exit(1);
}

const PORT = Number(process.env.PORT) || 3000;
const server = http.createServer(app);

// Additional proxies are no longer required after migration to OpenAI

server.listen(PORT, () => {
  console.log(`✅ Backend listening on http://localhost:${PORT}`);
});
