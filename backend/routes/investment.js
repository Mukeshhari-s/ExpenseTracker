import express from 'express';
import {
  getInvestments,
  addInvestment,
  updateInvestment,
  deleteInvestment,
  getPortfolioSummary
} from '../controllers/investmentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getInvestments);
router.post('/', addInvestment);
router.put('/:id', updateInvestment);
router.delete('/:id', deleteInvestment);
router.get('/portfolio/summary', getPortfolioSummary);

export default router;
