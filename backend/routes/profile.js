import express from 'express';
import { getProfile, updateProfile, uploadProfilePhoto } from '../controllers/profileController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/photo', uploadProfilePhoto);

export default router;
