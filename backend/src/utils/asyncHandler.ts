import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async route handler and forwards any thrown errors to next()
 * so the global error middleware can handle them.
 */
export const asyncHandler =
    (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
        (req: Request, res: Response, next: NextFunction) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
