// middleware/validate.js  — ESM only
import { z } from 'zod';
import { validationResult } from 'express-validator';

// Use after express-validator checks in a route
export function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors || errors.isEmpty()) return next();
  return res.status(400).json({ ok: false, error: errors.array()[0].msg });
}

// Zod body validator
export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'ValidationError',
      details: result.error.issues.map(i => ({
        path: i.path.join('.'),
        message: i.message
      })),
    });
  }
  req.body = result.data;
  next();
};

// Common schemas used around the app
export const schemas = {
  // Auth
  register: z.object({
    email: z.string().email(),
    password: z.string().min(8).max(64),
    name: z.string().min(1).max(80).optional(),
  }),
  login: z.object({
    email: z.string().email(),
    password: z.string().min(8).max(64),
    remember: z.boolean().optional().default(false),
  }),
  forgot: z.object({ email: z.string().email() }),
  reset: z.object({
    token: z.string().min(20),
    password: z.string().min(8).max(64),
  }),

  // Projects
  createProject: z.object({
    name: z.string().min(1),
    desc: z.string().optional(),
    startDate: z.string().datetime().optional(),
    dueDate: z.string().datetime().optional(),
  }),

  // Tasks
  createTask: z.object({
    title: z.string().min(1),
    desc: z.string().optional(),
    priority: z.enum(['Low', 'Medium', 'High']).optional(),
    dueDate: z.string().datetime().optional(),
    assignee: z.string().optional(),
    assignedTo: z.string().optional(),
    status: z.enum(['UnAssigned','Assigned','InProgress','Testing','Completed','InComplete']).optional(),
  }),
};
