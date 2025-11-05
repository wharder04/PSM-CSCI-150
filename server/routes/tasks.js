// routes/tasks.js
import { Router } from 'express';
import auth from '../middleware/auth.js';
import {
  createTask, listTasks, getTask, updateTask, deleteTask, getProgress
} from '../controllers/taskController.js'; // <-- ensure the filename matches exactly and includes .js

const r = Router({ mergeParams: true }); // allows :projectId from parent route

// collection routes
r.get('/',  auth, listTasks);
r.post('/', auth, createTask);

// single-item routes
r.get('/:taskId',    auth, getTask);
r.put('/:taskId',    auth, updateTask);
r.delete('/:taskId', auth, deleteTask);

// optional summary
r.get('/__summary/progress', auth, getProgress); // or r.get('/progress', ...) if you prefer

export default r;
