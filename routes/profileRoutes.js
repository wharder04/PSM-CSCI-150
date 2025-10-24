import express from 'express';
import { body } from 'express-validator';
import { handleValidation } from '../middleware/validate.js';
import { protect } from '../middleware/authMiddleware.js';
import { getProfile, updateProfile } from '../controllers/profileController.js';

const router = express.Router();

const statusRule = body('status')
  .optional()
  .isIn(['Active', 'Offline', 'Busy', 'In a Meeting'])
  .withMessage('Invalid status');

router.get('/me', protect, getProfile);
router.put('/me', protect, statusRule, handleValidation, updateProfile);

export default router;
