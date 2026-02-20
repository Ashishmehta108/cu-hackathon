import { Request, Response, NextFunction } from 'express';

/**
 * Tiny validation helper — throws a 400 error if required body fields are missing.
 */
export const requireBody =
    (...fields: string[]) =>
        (req: Request, res: Response, next: NextFunction) => {
            const missing = fields.filter((f) => req.body[f] === undefined || req.body[f] === '');
            if (missing.length > 0) {
                res.status(400).json({
                    error: 'Missing required fields',
                    details: `Missing: ${missing.join(', ')}`,
                });
                return;
            }
            next();
        };

/**
 * Validates that req.file exists (for multipart uploads).
 */
export const requireFile = (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
        res.status(400).json({
            error: 'Missing required file',
            details: 'An audio file must be provided in the "audio" field',
        });
        return;
    }
    next();
};
