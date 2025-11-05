import { Router } from 'express';
import auth from '../middleware/auth.js';
import { body } from 'express-validator';
import { handleValidation } from '../middleware/validate.js';
import { getProfile, updateProfile } from '../controllers/profileController.js';

const r = Router();
const statusRule = body('status').optional().isIn(['Active','Offline','Busy','In a Meeting']);

r.get('/me', auth, getProfile);
r.put('/me', auth, statusRule, handleValidation, updateProfile);

export default r;
