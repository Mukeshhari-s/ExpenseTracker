import express from 'express';
import {
  getBankAccounts,
  addBankAccount,
  updateBankAccount,
  deleteBankAccount,
  getAccountSummary
} from '../controllers/bankController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Specific routes must come before :id routes
router.get('/summary', getAccountSummary);

router.get('/', getBankAccounts);
router.post('/', addBankAccount);
router.put('/:id', updateBankAccount);
router.delete('/:id', deleteBankAccount);

export default router;
