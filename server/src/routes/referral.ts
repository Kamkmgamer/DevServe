import { Router } from 'express';
import { protect, admin } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { idParamSchema, codeParamSchema, createReferralSchema, updateReferralSchema } from '../lib/validation';
import { createReferral, getReferral, getReferrals, updateReferral, deleteReferral, getMyReferral, getReferralByCode } from '../api/referral'; // Added getReferralByCode

const router = Router();

router.route('/validate/:code').get(validate({ params: codeParamSchema }), getReferralByCode); // New route
router
  .route('/')
  .post(protect, validate(createReferralSchema), createReferral)
  .get(protect, admin, getReferrals);
router.route('/me').get(protect, getMyReferral);
router
  .route('/:id')
  .get(protect, validate({ params: idParamSchema }), getReferral)
  .put(protect, validate({ params: idParamSchema, body: updateReferralSchema }), updateReferral)
  .delete(protect, admin, validate({ params: idParamSchema }), deleteReferral);

export default router;