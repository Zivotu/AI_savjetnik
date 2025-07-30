declare module 'express' {
  interface Request { [key: string]: any }
  interface Response { [key: string]: any }
  interface Router { [key: string]: any }
  interface NextFunction { (...args: any[]): any }
  function Router(): Router;
  function express(): any;
  namespace express {
    var json: () => any;
  }
  export { Router, Request, Response, NextFunction };
  export default express;
}
