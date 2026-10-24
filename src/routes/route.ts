import { Router } from 'express';
import focusRoute from './focus.route.ts';
import healthRoute from './health.route.ts';

const router = Router();
router.use(healthRoute);
router.use(focusRoute);

export default router;
