import { Request, Response, NextFunction } from 'express';

/**
 * Global error handler middleware.
 * Must be the LAST middleware registered in server.ts.
 */
export const errorMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(`[ERROR] ${req.method} ${req.path} —`, err.message ?? err);

    const statusCode = err.statusCode ?? err.status ?? 500;

    res.status(statusCode).json({
        error: err.message ?? 'Internal Server Error',
        details: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    });
};
