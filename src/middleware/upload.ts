import multer from 'multer';
import { config } from '../config/config.ts';

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: config.maxFileSize, files: 1 },
});
