import { Router } from 'express';
import { focus } from '../controllers/focus.controller.ts';
import { rateLimit } from '../middleware/ratelimit.ts';
import { upload } from '../middleware/upload.ts';
import { validateImage } from '../middleware/file.validator.ts';

const router = Router();
router.post('/v1/focus', rateLimit, upload.single('image'), validateImage, focus);

export default router;
