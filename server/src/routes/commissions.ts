import { Router } from 'express';
import { protect, admin } from '../middleware/auth';
import { getCommissions, getCommission, updateCommission } from '../api/commissions';

const router = Router();

router.route('/').get(protect, admin, getCommissions);
router.route('/:id').get(protect, getCommission).put(protect, admin, updateCommission);

export default router;