import { Router } from 'express';
import { protect, admin } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { idParamSchema, createPayoutSchema } from '../lib/validation';
import { createPayout, getPayouts, getPayout } from '../api/payouts';

const router = Router();

router
  .route('/')
  .post(protect, admin, validate(createPayoutSchema), createPayout)
  .get(protect, admin, getPayouts);
router.route('/:id').get(protect, admin, validate({ params: idParamSchema }), getPayout);

export default router;