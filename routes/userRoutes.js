import express from 'express';
import { body, param } from 'express-validator';
import { handleValidation } from '../middleware/validate.js';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';

const router = express.Router();

const emailRule = body('email')
  .isString()
  .trim()
  .toLowerCase()
  .isEmail()
  .withMessage('Valid email required');

const nameRule = body('name')
  .isString()
  .trim()
  .notEmpty()
  .withMessage('Name is required')
  .isLength({ max: 80 })
  .withMessage('Name too long');

const idRule = param('id').isMongoId().withMessage('Invalid id');

// /api/users
router.get('/', getUsers);
router.get('/:id', idRule, handleValidation, getUserById);
router.post('/', nameRule, emailRule, handleValidation, createUser);
router.put('/:id', idRule, handleValidation, nameRule, emailRule, handleValidation, updateUser);
router.delete('/:id', idRule, handleValidation, deleteUser);

export default router;
