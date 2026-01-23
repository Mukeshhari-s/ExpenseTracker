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

router.get('/', getBankAccounts);
router.post('/', addBankAccount);
router.put('/:id', updateBankAccount);
router.delete('/:id', deleteBankAccount);
router.get('/summary', getAccountSummary);

export default router;
