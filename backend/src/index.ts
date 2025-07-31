import http from 'http';
import app from './server';
import { attachSttProxy } from './sttProxy';
import { attachEviProxy } from './eviProxy';

const server = http.createServer(app);
attachSttProxy(server);
attachEviProxy(server);

server.listen(3000, () => {
  console.log('✅ Backend listening on http://localhost:3000');
});
