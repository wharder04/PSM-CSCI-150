import { validationResult } from 'express-validator';

// Use after express-validator checks in a route
export function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ ok: false, error: errors.array()[0].msg });
  }
  next();
}
