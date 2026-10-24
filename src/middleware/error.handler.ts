import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { ApiError } from '../utils/api.error.ts';
import { logger } from '../utils/logger.ts';

export function notFound(_req: Request, _res: Response, next: NextFunction) {
    next(new ApiError(404, 'Not found'));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
    if (err instanceof ApiError) {
        return res.status(err.status).json({ error: err.message });
    }
    if (err instanceof multer.MulterError) {
        const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
        return res.status(status).json({ error: err.message });
    }
    logger.error(err);
    res.status(500).json({ error: 'Internal server error' });
}
