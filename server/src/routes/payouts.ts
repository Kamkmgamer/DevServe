import { Router } from 'express';
import { protect, admin } from '../middleware/auth';
import { createPayout, getPayouts, getPayout } from '../api/payouts';

const router = Router();

router.route('/').post(protect, admin, createPayout).get(protect, admin, getPayouts);
router.route('/:id').get(protect, admin, getPayout);

export default router;