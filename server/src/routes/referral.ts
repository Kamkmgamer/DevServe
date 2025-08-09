import { Router } from 'express';
import { protect, admin } from '../middleware/auth';
import { createReferral, getReferral, getReferrals, updateReferral, deleteReferral, getMyReferral } from '../api/referral';

const router = Router();

router.route('/').post(protect, createReferral).get(protect, admin, getReferrals);
router.route('/me').get(protect, getMyReferral);
router.route('/:id').get(protect, getReferral).put(protect, updateReferral).delete(protect, admin, deleteReferral);

export default router;