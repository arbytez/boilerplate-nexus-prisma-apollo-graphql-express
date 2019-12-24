declare namespace Express {
  export interface Request {
    user?: object;
    userId?: string | number;
  }
}
