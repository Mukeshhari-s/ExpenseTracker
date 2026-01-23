import express from 'express';
import {
  getDematAccounts,
  addDematAccount,
  updateDematAccount,
  deleteDematAccount
} from '../controllers/dematController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getDematAccounts);
router.post('/', addDematAccount);
router.put('/:id', updateDematAccount);
router.delete('/:id', deleteDematAccount);

export default router;
