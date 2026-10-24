import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/async.handler.ts';
import { ApiError } from '../utils/api.error.ts';
import { removeBackground } from '../services/focus.service.ts';

export const focus = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new ApiError(400, 'No file uploaded');

    const png = await removeBackground(req.file.buffer);
    res.type('image/png').send(png);
});
