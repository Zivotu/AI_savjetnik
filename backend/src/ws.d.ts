// src/ws.d.ts
declare module 'ws' {
  import { IncomingMessage } from 'http';
  import { Duplex } from 'stream';

  export type RawData = string | Buffer | ArrayBuffer | Buffer[];

  export interface ClientOptions {
    headers?: Record<string, string>;
    perMessageDeflate?: boolean | Record<string, unknown>;
    handshakeTimeout?: number;
    maxPayload?: number;
    followRedirects?: boolean;
    origin?: string;
    protocolVersion?: number;
  }

  export class WebSocket {
    static OPEN: number;
    constructor(address: string, protocols?: string | string[], options?: ClientOptions);
    readyState: number;
    send(data: RawData): void;
    close(code?: number, reason?: string): void;
    on(event: 'message', listener: (data: RawData) => void): this;
    on(event: 'open', listener: () => void): this;
    on(event: 'close', listener: () => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
  }

  export interface ServerOptions {
    noServer?: boolean;
    port?: number;
    host?: string;
    maxPayload?: number;
    perMessageDeflate?: boolean | Record<string, unknown>;
  }

  export class WebSocketServer {
    constructor(options?: ServerOptions);
    handleUpgrade(
      req: IncomingMessage,
      socket: Duplex,
      head: Buffer,
      cb: (client: WebSocket) => void
    ): void;
    on(event: 'connection', listener: (socket: WebSocket, request: IncomingMessage) => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
  }

  export default WebSocket;
}
