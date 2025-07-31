declare module 'express' {
  export interface Request {
    [key: string]: any;
  }
  export interface Response {
    [key: string]: any;
    status(code: number): this;
    json(data: any): this;
    send(data?: any): this;
    end(): void;
    setHeader(name: string, value: string): void;
    write(chunk: any): void;
  }
  export interface Router {
    [key: string]: any;
    (req?: any, res?: any, next?: any): any;
    use(...args: any[]): any;
    get(...args: any[]): any;
    post(...args: any[]): any;
  }
  export function Router(): Router;
  export type NextFunction = any;
  const exp: any;
  export default exp;
}
