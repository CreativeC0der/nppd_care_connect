
import { Request, Response, NextFunction } from 'express';

export async function latency(req: Request, res: Response, next: NextFunction) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    next();
};
