import type { NextFunction, Request, Response } from 'express';
import sharp from 'sharp';
import { ApiError } from '../utils/api.error.ts';
import { config } from '../config/config.ts';

export async function validateImage(req: Request, _res: Response, next: NextFunction) {
    try {
        if (!req.file) throw new ApiError(400, 'No file uploaded');

        const { format, width, height } = await sharp(req.file.buffer).metadata().catch(() => {
            throw new ApiError(400, 'Invalid or corrupted image');
        });

        if (!format || !config.allowedFormats.includes(format)) {
            throw new ApiError(415, `Unsupported image format. Allowed: ${config.allowedFormats.join(', ')}`);
        }
        if (!width || !height || width * height > config.maxPixels) {
            throw new ApiError(413, 'Image dimensions too large');
        }
        next();
    } catch (error) {
        next(error);
    }
}
