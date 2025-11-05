import { Router } from 'express';
import { body } from 'express-validator';
import { handleValidation } from '../middleware/validate.js';
import auth from '../middleware/auth.js';
import { registerUser, loginUser, logoutUser } from '../controllers/authController.js';

const r = Router();
const emailRule = body('email').isEmail().withMessage('Valid email required');
const pwRule    = body('password').isString().isLength({ min: 8 }).withMessage('Password too short');

r.post('/register', emailRule, pwRule, handleValidation, registerUser);
r.post('/login',    emailRule, pwRule, handleValidation, loginUser);
r.post('/logout',   auth, logoutUser);

export default r;
