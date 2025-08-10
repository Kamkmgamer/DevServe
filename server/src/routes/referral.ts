import { Router } from 'express';
import { protect, admin } from '../middleware/auth';
import { createReferral, getReferral, getReferrals, updateReferral, deleteReferral, getMyReferral, getReferralByCode } from '../api/referral'; // Added getReferralByCode

const router = Router();

router.route('/validate/:code').get(getReferralByCode); // New route
router.route('/').post(protect, createReferral).get(protect, admin, getReferrals);
router.route('/me').get(protect, getMyReferral);
router.route('/:id').get(protect, getReferral).put(protect, updateReferral).delete(protect, admin, deleteReferral);

export default router;