declare module 'ws' {
  export type RawData = string | Buffer | ArrayBuffer | Buffer[];

  export class WebSocket {
    static OPEN: number;
    constructor(address: string, protocols?: string | string[]);
    readyState: number;
    send(data: RawData): void;
    close(code?: number, reason?: string): void;
    on(event: 'message', listener: (data: RawData) => void): this;
    on(event: 'close', listener: () => void): this;
  }

  export class WebSocketServer {
    constructor(options?: any);
    handleUpgrade(req: any, socket: any, head: any, cb: (client: WebSocket) => void): void;
    on(event: 'connection', listener: (socket: WebSocket, request: any) => void): this;
  }
}
