import express from 'express';
import { body } from 'express-validator';
import { handleValidation } from '../middleware/validate.js';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

const emailRule = body('email').isEmail().withMessage('Valid email required');
const nameRule = body('name').isString().trim().notEmpty().withMessage('Name required');
const passwordRule = body('password').isString().isLength({ min: 8 }).withMessage('Password too short');

router.post('/register', nameRule, emailRule, passwordRule, handleValidation, registerUser);
router.post('/login', emailRule, passwordRule, handleValidation, loginUser);

export default router;
