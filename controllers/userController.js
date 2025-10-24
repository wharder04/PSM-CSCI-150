import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';

// GET /api/users
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ ok: true, data: users });
});

// GET /api/users/:id
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ ok: false, error: 'User not found' });
  res.json({ ok: true, data: user });
});

// POST /api/users
export const createUser = asyncHandler(async (req, res, next) => {
  const { name, email } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ ok: false, error: 'Email already in use' });

  const user = await User.create({ name, email });
  res.status(201).json({ ok: true, data: user });
});

// PUT /api/users/:id
export const updateUser = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email },
    { new: true, runValidators: true }
  );
  if (!user) return res.status(404).json({ ok: false, error: 'User not found' });
  res.json({ ok: true, data: user });
});

// DELETE /api/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ ok: false, error: 'User not found' });
  res.json({ ok: true, data: { _id: user._id } });
});
