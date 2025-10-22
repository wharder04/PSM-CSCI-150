import express from 'express';
import { body, param } from 'express-validator';
import { protect } from '../middleware/authMiddleware.js';
import { handleValidation } from '../middleware/validate.js';
import {
  createTask, getTasks, updateTask, deleteTask, getProgress,
} from '../controllers/taskController.js';

const router = express.Router();

const titleRule = body('title').isString().trim().notEmpty().withMessage('Title required');
const statusRule = body('status')
  .optional()
  .isIn(['To-Do', 'In Progress', 'Completed'])
  .withMessage('Invalid status');
const idRule = param('id').isMongoId().withMessage('Invalid id');

router.get('/progress', protect, getProgress);

router.route('/')
  .post(protect, titleRule, handleValidation, createTask)
  .get(protect, getTasks);

router.route('/:id')
  .put(protect, idRule, handleValidation, statusRule, handleValidation, updateTask)
  .delete(protect, idRule, handleValidation, deleteTask);

export default router;
