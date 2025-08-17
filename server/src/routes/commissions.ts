import { Router } from 'express';
import { protect, admin } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { idParamSchema, updateCommissionSchema } from '../lib/validation';
import { getCommissions, getCommission, updateCommission } from '../api/commissions';

const router = Router();

router.route('/').get(protect, admin, getCommissions);
router
  .route('/:id')
  .get(protect, validate({ params: idParamSchema }), getCommission)
  .put(protect, admin, validate({ params: idParamSchema, body: updateCommissionSchema }), updateCommission);

export default router;