import { Router } from 'express';
import { body, param } from 'express-validator';
import auth from '../middleware/auth.js';
import { handleValidation } from '../middleware/validate.js';
import {
  createTask, listTasks, getTask, updateTask, deleteTask
} from '../controllers/taskController.js';

const r = Router({ mergeParams: true });

const titleRule = body('title').isString().trim().notEmpty().withMessage('Title required');
const statusRule = body('status').optional()
  .isIn(['UnAssigned', 'Assigned', 'InProgress', 'Testing', 'Completed', 'InComplete'])
  .withMessage('Invalid status');

const idRule = param('taskId').isMongoId().withMessage('Invalid task id');

r.route('/')
  .get(auth, listTasks)
  .post(auth, titleRule, handleValidation, createTask);

r.route('/:taskId')
  .get(auth, idRule, handleValidation, getTask)
  .put(auth, idRule, handleValidation, statusRule, handleValidation, updateTask)
  .delete(auth, idRule, handleValidation, deleteTask);

export default r;
