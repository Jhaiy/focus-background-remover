import type { NextFunction, Request, Response } from 'express';
import { config } from '../config/config.ts';
import { ApiError } from '../utils/api.error.ts';

const hits = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key);
}, config.rateLimit.windowMs).unref();

export function rateLimit(req: Request, res: Response, next: NextFunction) {
    const { windowMs, max } = config.rateLimit;
    const key = req.ip ?? 'unknown';
    const now = Date.now();

    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
        entry = { count: 0, resetAt: now + windowMs };
        hits.set(key, entry);
    }
    entry.count++;

    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', Math.max(0, max - entry.count));
    if (entry.count > max) {
        res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
        return next(new ApiError(429, 'Too many requests'));
    }
    next();
}
