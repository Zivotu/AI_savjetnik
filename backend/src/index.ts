import http from 'http';
import app from './server';
import { attachSttProxy } from './sttProxy';

const server = http.createServer(app);
attachSttProxy(server);

server.listen(3000, () => {
  console.log('✅ Backend listening on http://localhost:3000');
});
