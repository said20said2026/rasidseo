import type { Request, Response } from 'express';
import appModule from '../server.js';

const app = (appModule as any)?.default || appModule;

export default function handler(req: Request, res: Response) {
  return app(req, res);
}
