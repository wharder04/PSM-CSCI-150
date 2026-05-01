import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";

const publicUserFilter = { isSystemPlaceholder: { $ne: true } };

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find(publicUserFilter).sort({ createdAt: -1 });
  res.json({ ok: true, data: users });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, ...publicUserFilter });
  if (!user) return res.status(404).json({ ok: false, error: "User not found" });
  res.json({ ok: true, data: user });
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password = "TempPass123!" } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) return res.status(409).json({ ok: false, error: "Email already in use" });

  const user = await User.create({ name, email: normalizedEmail, password });
  res.status(201).json({ ok: true, data: user });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, ...publicUserFilter },
    { name, email },
    { new: true, runValidators: true }
  );
  if (!user) return res.status(404).json({ ok: false, error: "User not found" });
  res.json({ ok: true, data: user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findOneAndDelete({ _id: req.params.id, ...publicUserFilter });
  if (!user) return res.status(404).json({ ok: false, error: "User not found" });
  res.json({ ok: true, data: { _id: user._id } });
});
